"""
Builds the two base layers of the illustrated Prizren map:

  images/map-relief.webp   terrain raster: hill shading, green hills, warm town
  images/map-base.svg      vector layers on top of it: woods (with a light tree
                           texture) and parks, rock, buildings, 10 m contours with
                           the 50 m ones stronger and labelled, the Lumbardhi,
                           streets, service roads (e.g. the gravel road up to the
                           zipline station) and footpaths, the fortress walls.
                           Still no driveways or small sheds.
  images/topo-lines.svg    the contour lines alone, a texture for the dark sections
  index.html               the street-name labels between the "street names" markers
                           are rewritten on every run (they need the page font)

Landmarks, points of interest, the zipline and the walking route are drawn by
hand in index.html on top of these layers; this script prints their projected
coordinates so they line up.

Data:  streets, water, land cover, buildings  (c) OpenStreetMap contributors, ODbL
       elevation                              AWS Terrain Tiles (terrarium, SRTM-based)

Usage: python tools/build-map.py      (needs numpy, matplotlib, pillow)
Downloads are cached in tools/.cache/ (git-ignored).
"""
import heapq, json, math, os, sys, urllib.parse, urllib.request

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "tools", ".cache")
OUT = os.path.join(ROOT, "images", "map-base.svg")
OUT_RELIEF = os.path.join(ROOT, "images", "map-relief.webp")
OUT_TOPO = os.path.join(ROOT, "images", "topo-lines.svg")
UA = {"User-Agent": "zipline-prizren-map-build/1.0"}

# ---- projection: 1 SVG unit = 1.5 m, map is 1600 x 1100 units (2.4 x 1.65 km)
W, H, M_PER_UNIT = 1600, 1100, 1.5
LAT0, LON0 = 42.2096, 20.7468             # map centre (between fortress and zipline)
KY = 111_080 / M_PER_UNIT                  # units per degree latitude
KX = 111_320 * math.cos(math.radians(LAT0)) / M_PER_UNIT
BBOX = "42.198,20.722,42.221,20.772"      # download box, a little larger than the map

# ---- colours (paper and greens sit under the logo's navy / blue / orange)
PAPER = (245, 242, 233)                    # outside the map + edge fade   #F5F2E9
TOWN = (244, 239, 229)                     # built-up valley floor
MEADOW = (222, 234, 205)                   # open hillsides
HILL = (202, 222, 184)                     # higher ground


def P(lat, lon):
    return (W / 2 + (lon - LON0) * KX, H / 2 - (lat - LAT0) * KY)


def fetch(name, url, data=None):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        body = urllib.parse.urlencode({"data": data}).encode() if data else None
        req = urllib.request.Request(url, data=body, headers=UA)
        with urllib.request.urlopen(req, timeout=180) as r, open(path, "wb") as f:
            f.write(r.read())
    return path


def overpass(name, q):
    q = "[out:json][timeout:150];" + q.replace("BBOX", BBOX)
    return json.load(open(fetch(name, "https://overpass-api.de/api/interpreter", q), encoding="utf-8"))["elements"]


# ---- geometry helpers
def dp(pts, tol):
    """Douglas-Peucker simplification."""
    if len(pts) < 3:
        return pts
    (ax, ay), (bx, by) = pts[0], pts[-1]
    n = math.hypot(bx - ax, by - ay) or 1e-9
    d = [abs((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / n for px, py in pts[1:-1]]
    i = int(np.argmax(d)) + 1
    if d[i - 1] > tol:
        return dp(pts[: i + 1], tol)[:-1] + dp(pts[i:], tol)
    return [pts[0], pts[-1]]


def dp_ring(pts, tol):
    """Douglas-Peucker for a closed ring: split it at the point farthest from the first one."""
    if len(pts) < 4:
        return pts
    i = max(range(len(pts)), key=lambda k: (pts[k][0] - pts[0][0]) ** 2 + (pts[k][1] - pts[0][1]) ** 2)
    return dp(pts[: i + 1], tol)[:-1] + dp(pts[i:], tol)


def inside(p, m=60):
    return -m <= p[0] <= W + m and -m <= p[1] <= H + m


def path_d(lines, prec=1, closed=False):
    """Compact path data using relative moves."""
    out, cx, cy = [], 0.0, 0.0
    f = (lambda v: str(round(v, prec)).rstrip("0").rstrip(".") if prec else str(int(round(v))))
    for pts in lines:
        if len(pts) < 2:
            continue
        if closed and pts[0] == pts[-1]:
            pts = pts[:-1]
        x, y = pts[0]
        out.append("M%s %s" % (f(x), f(y)))
        cx, cy = round(x, prec), round(y, prec)
        seg = []
        for x, y in pts[1:]:
            x, y = round(x, prec), round(y, prec)
            seg.append("%s %s" % (f(x - cx), f(y - cy)))
            cx, cy = x, y
        out.append("l" + " ".join(seg).replace(" -", "-"))
        if closed:
            out.append("z")
    return "".join(out)


def clip_runs(pts):
    """Split a polyline into runs that are inside the (padded) map."""
    runs, cur = [], []
    for p in pts:
        if inside(p):
            cur.append(p)
        else:
            if cur:
                cur.append(p)
                runs.append(cur)
            cur = []
    if cur:
        runs.append(cur)
    return runs


def join(segs):
    """Join the member ways of a multipolygon into closed rings."""
    segs = [s[:] for s in segs if len(s) > 1]
    rings = []
    while segs:
        cur = segs.pop(0)
        while cur[0] != cur[-1]:
            for i, s in enumerate(segs):
                if s[0] == cur[-1]:
                    cur += s[1:]
                    break
                if s[-1] == cur[-1]:
                    cur += s[::-1][1:]
                    break
            else:
                break
            segs.pop(i)
        if len(cur) > 3:
            rings.append(cur)
    return rings


def rings_of(e):
    """Outer + inner rings (map units) of an OSM closed way or multipolygon relation."""
    if e["type"] == "way":
        g = e.get("geometry") or []
        return [[P(p["lat"], p["lon"]) for p in g]] if len(g) > 3 else []
    out = []
    for inner in (False, True):
        segs = [[(p["lat"], p["lon"]) for p in m["geometry"]] for m in e.get("members", [])
                if m["type"] == "way" and m.get("geometry") and (m.get("role") == "inner") == inner]
        out += [[P(*q) for q in r] for r in join(segs)]
    return out


def on_map(rings, m=40):
    xs_ = [x for r in rings for x, _ in r]
    ys_ = [y for r in rings for _, y in r]
    return xs_ and max(xs_) > -m and min(xs_) < W + m and max(ys_) > -m and min(ys_) < H + m


# ---- 1. streets
roads = overpass("roads.json", "(way[highway](BBOX););out geom;")
CLASSES = {
    "major": {"primary", "primary_link", "secondary", "secondary_link", "trunk", "tertiary", "tertiary_link"},
    "minor": {"residential", "unclassified", "living_street", "pedestrian", "road"},
    "service": {"service"},
    "path": {"footway", "path", "steps", "track", "cycleway", "bridleway"},
}
street_lines = {k: [] for k in CLASSES}
for e in roads:
    hw = e["tags"].get("highway")
    cls = next((k for k, v in CLASSES.items() if hw in v), None)
    if not cls or e["tags"].get("service") in ("driveway", "parking_aisle", "drive-through"):
        continue
    pts = [P(g["lat"], g["lon"]) for g in e["geometry"]]
    for run in clip_runs(pts):
        if cls == "service" and sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(run, run[1:])) < 20:
            continue                                            # tiny yard access stubs
        street_lines[cls].append(dp(run, 0.7))

# ---- 2. river (centre line + river-area polygons) and streams
water = overpass("water.json", "(way[waterway](BBOX);relation[waterway](BBOX);way[natural=water](BBOX););out geom;")
river, streams, water_areas = [], [], []
for e in water:
    t = e.get("tags", {})
    if t.get("natural") == "water":
        r = rings_of(e)
        if on_map(r):
            water_areas += [dp_ring(x, 0.6) for x in r]
        continue
    if e["type"] != "way" or not e.get("geometry"):
        continue
    pts = [P(g["lat"], g["lon"]) for g in e["geometry"]]
    if t.get("waterway") == "river":
        river += [dp(r, 0.6) for r in clip_runs(pts)]
    elif t.get("waterway") in ("stream", "canal"):
        streams += [dp(r, 0.8) for r in clip_runs(pts)]

# ---- 3. land cover: woods, scrub, grass and parks, rock, sports pitches
LC = "(way[landuse](BBOX);relation[landuse](BBOX);way[natural~\"wood|scrub|grassland|heath|bare_rock|scree\"](BBOX);" \
     "relation[natural~\"wood|scrub|grassland|heath\"](BBOX);way[leisure~\"park|garden|pitch|playground|stadium|sports_centre\"](BBOX);" \
     "relation[leisure~\"park|garden\"](BBOX);way[amenity~\"grave_yard|school|parking\"](BBOX););out geom;"
cover = overpass("landcover.json", LC)
LAND = {
    "wood": lambda t: t.get("landuse") == "forest" or t.get("natural") == "wood",
    "scrub": lambda t: t.get("natural") in ("scrub", "heath"),
    "grass": lambda t: t.get("landuse") in ("grass", "meadow", "village_green", "recreation_ground", "cemetery", "allotments")
    or t.get("natural") == "grassland" or t.get("leisure") in ("park", "garden") or t.get("amenity") == "grave_yard",
    "rock": lambda t: t.get("natural") in ("bare_rock", "scree"),
    "pitch": lambda t: t.get("leisure") in ("pitch", "stadium", "sports_centre", "playground"),
}
land = {k: [] for k in LAND}
for e in cover:
    t = e.get("tags", {})
    cls = next((k for k, f in LAND.items() if f(t)), None)
    if not cls:
        continue
    r = rings_of(e)
    if on_map(r):
        land[cls] += [dp_ring(x, 0.8) for x in r]

# ---- 4. buildings
bld = overpass("buildings.json", "(way[building](BBOX);relation[building](BBOX););out geom;")
buildings = []
for e in bld:
    for r in rings_of(e):
        area = abs(sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(r, r[1:] + r[:1]))) / 2
        if area > 40 and all(inside(p, 4) for p in r):          # 40 units = 90 m²: skips sheds and garages
            buildings.append(dp_ring(r, 0.6))

# ---- 5. fortress walls (OSM way 136001313, "Kalaja e Prizrenit")
pois = overpass("fortress.json", "(way(136001313););out geom;")
fortress = [[P(g["lat"], g["lon"]) for g in pois[0]["geometry"]]] if pois else []

# ---- 6. terrain tiles -> contour lines + hill-shaded relief raster
Z = 15


def tile_xy(lat, lon):
    n = 2 ** Z
    return (lon + 180) / 360 * n, (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n


tx0, ty0 = tile_xy(42.222, 20.726)
tx1, ty1 = tile_xy(42.197, 20.767)
xs, ys = range(int(tx0), int(tx1) + 1), range(int(ty0), int(ty1) + 1)
mosaic = np.zeros((256 * len(ys), 256 * len(xs)))
for i, x in enumerate(xs):
    for j, y in enumerate(ys):
        f = fetch("t%d_%d_%d.png" % (Z, x, y), "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/%d/%d/%d.png" % (Z, x, y))
        a = np.asarray(Image.open(f).convert("RGB")).astype(float)
        mosaic[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768


def blur(a, s):
    k = np.exp(-0.5 * (np.arange(-3 * s, 3 * s + 1) / s) ** 2)
    k /= k.sum()
    a = np.apply_along_axis(lambda r: np.convolve(np.pad(r, 3 * s, mode="edge"), k, "valid"), 1, a)
    return np.apply_along_axis(lambda c: np.convolve(np.pad(c, 3 * s, mode="edge"), k, "valid"), 0, a)


dem = blur(mosaic, 4)


def px_to_svg(px, py):
    n = 2 ** Z
    X, Y = xs[0] + px / 256, ys[0] + py / 256
    lon = X / n * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * Y / n))))
    return P(lat, lon)


levels = list(range(380, 1100, 10))
cs = plt.contour(dem, levels=levels)
contours = {"minor": [], "major": []}
major_runs = []                                  # (level, run) for the elevation labels
for lvl, segs in zip(cs.levels, cs.allsegs):
    for seg in segs:
        pts = [px_to_svg(x, y) for x, y in seg]
        for run in clip_runs(pts):
            run = dp(run, 1.2)
            if len(run) > 2:
                contours["major" if int(lvl) % 50 == 0 else "minor"].append(run)
                if int(lvl) % 50 == 0:
                    major_runs.append((int(lvl), run))


def along(run, dist):
    """Point and direction (degrees) at a distance along a polyline."""
    for (ax, ay), (bx, by) in zip(run, run[1:]):
        seg = math.hypot(bx - ax, by - ay)
        if dist <= seg and seg > 0:
            t = dist / seg
            return ax + (bx - ax) * t, ay + (by - ay) * t, math.degrees(math.atan2(by - ay, bx - ax))
        dist -= seg
    return None


def run_len(run):
    return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(run, run[1:]))


# one elevation number per long 50 m contour, kept apart from each other and off the map edge
contour_labels, placed = [], []
for lvl, run in sorted(major_runs, key=lambda r: -run_len(r[1])):
    L = run_len(run)
    if L < 240:
        continue
    for frac in (0.5, 0.3, 0.7):
        p = along(run, L * frac)
        if not p:
            continue
        x, y, a = p
        if not (90 < x < W - 90 and 90 < y < H - 90) or any(math.hypot(x - u, y - v) < 230 for u, v in placed):
            continue
        a = a + 180 if a > 90 else a - 180 if a < -90 else a      # keep the numbers upright
        placed.append((x, y))
        contour_labels.append((x, y, a, lvl))
        break

# relief raster, 1 px = 1 map unit
yy, xx = np.mgrid[0:H, 0:W] + 0.5
lat = LAT0 - (yy - H / 2) / KY
lon = LON0 + (xx - W / 2) / KX
n = 2 ** Z
TX = (lon + 180) / 360 * n * 256 - xs[0] * 256
TY = (1 - np.log(np.tan(np.radians(lat)) + 1 / np.cos(np.radians(lat))) / np.pi) / 2 * n * 256 - ys[0] * 256
dem_fine = blur(mosaic, 10)          # the SRTM steps need a wide blur before shading
x0, y0 = np.floor(TX).astype(int), np.floor(TY).astype(int)
fx, fy = TX - x0, TY - y0
elev = (dem_fine[y0, x0] * (1 - fx) * (1 - fy) + dem_fine[y0, x0 + 1] * fx * (1 - fy)
        + dem_fine[y0 + 1, x0] * (1 - fx) * fy + dem_fine[y0 + 1, x0 + 1] * fx * fy)

gy, gx = np.gradient(elev, M_PER_UNIT)             # rise per metre, x = east, y = south
EXAG, ALT = 1.4, math.radians(45)
nx, ny, nz = -gx * EXAG, -gy * EXAG, np.ones_like(elev)
norm = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
lx, ly, lz = -math.cos(ALT) * math.sqrt(.5), -math.cos(ALT) * math.sqrt(.5), math.sin(ALT)   # sun from the north-west
shade = (nx * lx + ny * ly + nz * lz) / norm - math.sin(ALT)    # 0 on flat ground

# built-up area = where the buildings are dense
mask = Image.new("L", (W, H), 0)
draw = ImageDraw.Draw(mask)
for r in buildings:
    if len(r) > 2:
        draw.polygon([(x, y) for x, y in r], fill=255)
dens = np.asarray(mask.filter(ImageFilter.GaussianBlur(20))).astype(float) / 255


def smooth(a, lo, hi):
    t = np.clip((a - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


town = smooth(dens, 0.05, 0.2)
high = smooth(elev, 430, 720)[..., None]
green = (np.array(MEADOW) * (1 - high) + np.array(HILL) * high)
base = np.array(TOWN) * town[..., None] + green * (1 - town[..., None])
light = np.clip(np.where(shade > 0, 1 + shade * 0.4, 1 + shade * 0.75), 0.74, 1.08)[..., None]
# shadows a little cooler
cool = 1 + (np.array([0.96, 0.99, 1.04]) - 1) * np.clip(-shade * 5, 0, 1)[..., None]
img = np.clip(base * light * cool, 0, 255)

# soft fade into the paper colour at the edges
edge = np.minimum.reduce([xx, W - xx, yy, H - yy])
fade = smooth(edge, 0, 70)[..., None]
img = np.array(PAPER) * (1 - fade) + img * fade
Image.fromarray(img.astype(np.uint8)).save(OUT_RELIEF, "WEBP", quality=80, method=6)
print("wrote", OUT_RELIEF, os.path.getsize(OUT_RELIEF) // 1024, "KB", file=sys.stderr)


# ---- 7. write the SVG (transparent; the relief raster sits under it in index.html)
pc = "#%02X%02X%02X" % PAPER
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<!-- Generated by tools/build-map.py. Map data (c) OpenStreetMap contributors (ODbL). Elevation: AWS Terrain Tiles. -->
<defs>
<linearGradient id="fx"><stop offset="0" stop-color="{pc}"/><stop offset="1" stop-color="{pc}" stop-opacity="0"/></linearGradient>
<linearGradient id="fy" x2="0" y2="1"><stop offset="0" stop-color="{pc}"/><stop offset="1" stop-color="{pc}" stop-opacity="0"/></linearGradient>
<pattern id="tr" width="11" height="10" patternUnits="userSpaceOnUse"><g fill="#A6C88B"><circle cx="2.5" cy="2.5" r="1.5"/><circle cx="8" cy="7.5" r="1.5"/></g></pattern>
<path id="wd" fill-rule="evenodd" d="{path_d(land['wood'], 1, closed=True)}"/>
</defs>
<style>
.gw{{fill:#C3DCAA}}.gs{{fill:#D3E5BE}}.gg{{fill:#D6E9C4}}.gp{{fill:#C7E0B4;stroke:#fff;stroke-width:1}}.rk{{fill:#E8E2D6}}
.c{{fill:none;stroke:#6F8A5A;stroke-opacity:.1;stroke-width:.8}}
.C{{fill:none;stroke:#6F8A5A;stroke-opacity:.24;stroke-width:1.2}}
.cl{{font:italic 600 10px sans-serif;fill:#6F8A5A;fill-opacity:.85;text-anchor:middle;paint-order:stroke;stroke:#EEF3E4;stroke-width:3.2px;stroke-linejoin:round}}
.b{{fill:#ECE1D1}}
.k0,.k1,.k2,.f0,.f1,.f2{{fill:none;stroke-linecap:round;stroke-linejoin:round}}
.k0{{stroke:#D9B878;stroke-width:9.5}}.f0{{stroke:#FFEFC9;stroke-width:7}}
.k1{{stroke:#D8CDBB;stroke-width:6.4}}.f1{{stroke:#fff;stroke-width:4.4}}
.k2{{stroke:#D8CDBB;stroke-width:4.4}}.f2{{stroke:#FBF8F1;stroke-width:2.6}}
.p{{fill:none;stroke:#A88D6C;stroke-width:1.1;stroke-dasharray:3 3;stroke-linecap:round;stroke-opacity:.45}}
.wa{{fill:#B6D9F3;stroke:#86BAE4;stroke-width:1.2}}
.w0{{fill:none;stroke:#86BAE4;stroke-width:15;stroke-linecap:round;stroke-linejoin:round}}
.w1{{fill:none;stroke:#B6D9F3;stroke-width:12;stroke-linecap:round;stroke-linejoin:round}}
.ws{{fill:none;stroke:#9CC8EC;stroke-width:2.4;stroke-linecap:round}}
.fw{{fill:#EFE6D3;fill-opacity:.85;stroke:#A8936F;stroke-width:1.8;stroke-linejoin:round}}
</style>
<path class="gs" d="{path_d(land['scrub'], 1, closed=True)}"/>
<path class="gg" d="{path_d(land['grass'], 1, closed=True)}" fill-rule="evenodd"/>
<use href="#wd" class="gw"/>
<use href="#wd" fill="url(#tr)" opacity=".55"/>
<path class="rk" d="{path_d(land['rock'], 1, closed=True)}"/>
<path class="gp" d="{path_d(land['pitch'], 1, closed=True)}"/>
<path class="c" d="{path_d(contours['minor'], 0)}"/>
<path class="C" d="{path_d(contours['major'], 0)}"/>
{''.join('<text class="cl" transform="translate(%.0f %.0f) rotate(%.0f)" dy="3.4">%d</text>' % c for c in contour_labels)}
<path class="b" d="{path_d(buildings, 1, closed=True)}"/>
<path class="fw" d="{path_d(fortress, 1, closed=True)}"/>
<path class="ws" d="{path_d(streams, 0)}"/>
<path class="wa" d="{path_d(water_areas, 1, closed=True)}" fill-rule="evenodd"/>
<path class="w0" d="{path_d(river, 1)}"/>
<path class="w1" d="{path_d(river, 1)}"/>
<path class="p" d="{path_d(street_lines['path'], 1)}"/>
<path class="k2" d="{path_d(street_lines['service'], 1)}"/>
<path class="f2" d="{path_d(street_lines['service'], 1)}"/>
<path class="k1" d="{path_d(street_lines['minor'], 1)}"/>
<path class="k0" d="{path_d(street_lines['major'], 1)}"/>
<path class="f1" d="{path_d(street_lines['minor'], 1)}"/>
<path class="f0" d="{path_d(street_lines['major'], 1)}"/>
<rect width="70" height="{H}" fill="url(#fx)"/><rect x="{W}" width="70" height="{H}" fill="url(#fx)" transform="scale(-1 1) translate(-{2 * W} 0)"/>
<rect width="{W}" height="70" fill="url(#fy)"/><rect y="{H}" width="{W}" height="70" fill="url(#fy)" transform="scale(1 -1) translate(0 -{2 * H})"/>
</svg>
'''
with open(OUT, "w", encoding="utf-8") as f:
    f.write(svg)
print("wrote", OUT, len(svg) // 1024, "KB", file=sys.stderr)

# ---- 8. the same contour lines as a texture for the dark sections of the page (background-image)
topo = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice">
<!-- Contour lines of Prizren, generated by tools/build-map.py. Elevation: AWS Terrain Tiles. -->
<path d="{path_d(contours['minor'], 0)}" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="1.2"/>
<path d="{path_d(contours['major'], 0)}" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width="1.6"/>
</svg>
'''
with open(OUT_TOPO, "w", encoding="utf-8") as f:
    f.write(topo)

# ---- 8b. street names -> index.html (between the "street names" markers inside the map SVG)
# Only the streets a visitor uses around the old town, the fortress and the start. Each name goes on
# the straightest stretch of its street that stays clear of the hand-drawn landmarks and the cable.
STREETS = ["Remzi Ademaj", "Adem Jashari", "Enver Haradinaj", "Ismet Jashari Kumanova", "Vatrat Shqiptare",
           "Rruga për në Kala", "Rrugëtimi i Gurit", "Prevalla", "Saraçët", "Mimar Sinan", "Yunus Emre",
           "Fehmi Lladrovci", "Shën Albani", "Hysen Rexhepi", "Evlija Çelebi"]
KEEP_CLEAR = [(730, 560, 70), (452, 548, 40), (510, 585, 34), (454, 595, 26), (507, 445, 36), (630, 395, 40),
              (716, 330, 36), (200, 395, 40), (861, 690, 50), (872, 411, 30), (588, 688, 60), (330, 475, 60),
              (630, 318, 40), (470, 728, 40)]          # landmark drawings + labels already on the map


def chains(ways):
    """Join ways that share end nodes into longer polylines (lists of (lat, lon))."""
    segs = [list(zip(w["nodes"], [(g["lat"], g["lon"]) for g in w["geometry"]])) for w in ways]
    out = []
    while segs:
        cur = segs.pop(0)
        grown = True
        while grown:
            grown = False
            for i, s in enumerate(segs):
                if s[0][0] == cur[-1][0]:
                    cur += s[1:]
                elif s[-1][0] == cur[-1][0]:
                    cur += s[::-1][1:]
                elif s[-1][0] == cur[0][0]:
                    cur = s[:-1] + cur
                elif s[0][0] == cur[0][0]:
                    cur = s[::-1][:-1] + cur
                else:
                    continue
                segs.pop(i)
                grown = True
                break
        out.append([c for _, c in cur])
    return out


def resample(run, step):
    L, out, d = run_len(run), [], 0.0
    while d <= L:
        p = along(run, d)
        if p:
            out.append(p[:2])
        d += step
    return out


labels = []
for name in STREETS:
    ways = [e for e in roads if e["tags"].get("name") == name and e.get("geometry")]
    need = len(name) * 5.6 + 36                     # label length at the default zoom, plus room to spare
    best = None
    for ch in chains(ways):
        for run in clip_runs([P(*c) for c in ch]):
            pts = [p for p in resample(run, 4) if 40 < p[0] < W - 40 and 40 < p[1] < H - 40]
            n = int(need / 4)
            for i in range(0, max(0, len(pts) - n), 2):
                win = pts[i:i + n + 1]
                if len(win) < n or run_len(win) < need * 0.95:
                    continue
                turn = sum(abs((math.degrees(math.atan2(c[1] - b[1], c[0] - b[0]) - math.atan2(b[1] - a[1], b[0] - a[0])) + 180) % 360 - 180)
                           for a, b, c in zip(win, win[1:], win[2:]))
                if any(math.hypot(x - u, y - v) < r for x, y in win[::3] for u, v, r in KEEP_CLEAR):
                    continue
                if any(840 < x < 875 and 335 < y < 710 for x, y in win):   # the zipline cable (ZIPLINE in script.js)
                    continue
                if best is None or turn < best[0]:
                    best = (turn, win)
    if best and best[0] < 120:
        win = best[1]
        if win[-1][0] < win[0][0]:
            win = win[::-1]                                 # read left to right
        labels.append((name, dp(win, 0.5)))

lab_html = "".join('\n              <path id="st%d" d="%s"/><text><textPath href="#st%d" startOffset="50%%">%s</textPath></text>'
                   % (i, path_d([pts], 1), i, name) for i, (name, pts) in enumerate(labels, 1))
INDEX = os.path.join(ROOT, "index.html")
A, B = "<!-- street names (generated by tools/build-map.py) -->", "<!-- /street names -->"
page = open(INDEX, "rb").read().decode("utf-8")
if A in page and B in page:
    head, rest = page.split(A, 1)
    page = head + A + '\r\n            <g class="streets" aria-hidden="true">' + lab_html.replace("\n", "\r\n") + "\r\n            </g>\r\n            " + B + rest.split(B, 1)[1]
    open(INDEX, "wb").write(page.encode("utf-8"))
    print("street names:", ", ".join(n for n, _ in labels), file=sys.stderr)

# ---- 9. walking route: Shadërvan square -> zipline start (shortest path on walkable ways)
WALK = CLASSES["minor"] | CLASSES["service"] | CLASSES["path"] | {"tertiary", "secondary"}
graph, coord = {}, {}
for e in roads:
    if e["tags"].get("highway") not in WALK:
        continue
    ids, geo = e["nodes"], e["geometry"]
    for a, b, ga, gb in zip(ids, ids[1:], geo, geo[1:]):
        coord[a], coord[b] = (ga["lat"], ga["lon"]), (gb["lat"], gb["lon"])
        d = math.hypot((ga["lat"] - gb["lat"]) * 111_080, (ga["lon"] - gb["lon"]) * KX * M_PER_UNIT)
        graph.setdefault(a, []).append((b, d))
        graph.setdefault(b, []).append((a, d))


def nearest(lat, lon):
    return min(coord, key=lambda n: (coord[n][0] - lat) ** 2 + ((coord[n][1] - lon) * 0.74) ** 2)


SHADERVAN = (42.209046, 20.740516)
ZIP_START = (42.2076362, 20.7479166)   # OSM way 1423491824 (aerialway=zip_line), southern end
ZIP_END = (42.2114745, 20.7481205)
src, dst = nearest(*SHADERVAN), nearest(*ZIP_START)
dist, prev, pq = {src: 0}, {}, [(0, src)]
while pq:
    d, n = heapq.heappop(pq)
    if n == dst:
        break
    if d > dist.get(n, 1e18):
        continue
    for m, w in graph.get(n, []):
        if d + w < dist.get(m, 1e18):
            dist[m], prev[m] = d + w, n
            heapq.heappush(pq, (d + w, m))
route, n = [dst], dst
while n != src:
    n = prev[n]
    route.append(n)
route = [P(*coord[n]) for n in reversed(route)]

info = {
    "route_m": round(dist[dst]),
    "route_d": path_d([dp(route, 1.0)], 1),
    "zip_start": [round(v, 1) for v in P(*ZIP_START)],
    "zip_end": [round(v, 1) for v in P(*ZIP_END)],
    "zip_len_m": round(math.hypot((ZIP_START[0] - ZIP_END[0]) * 111_080, (ZIP_START[1] - ZIP_END[1]) * KX * M_PER_UNIT)),
    "river_d": path_d([dp(r, 3) for r in river], 0),
}
LANDMARKS = {
    "kalaja": (42.209495, 20.74556), "ura": (42.209568, 20.740615), "sinan": (42.209023, 20.741379),
    "shadervan": SHADERVAN, "hamam": (42.210941, 20.741477), "lidhja": (42.21148, 20.743765),
    "premte": (42.211605, 20.735889), "katedralja": (42.207765, 20.738407), "shpetimtari": (42.208123, 20.743301),
    "rrapi": (42.2123, 20.745058), "sahat": (42.211272, 20.736614), "marash": (42.212186, 20.745144),
    "bazhderhane": (42.217335, 20.744281), "perroni": (42.206228, 20.739525), "panteli": (42.207555, 20.741187),
    "kurilla": (42.215332, 20.747195), "jeni": (42.214571, 20.733921), "ralin": (42.212857, 20.745181),
}
info["landmarks"] = {k: [round(v, 1) for v in P(*c)] for k, c in LANDMARKS.items()}
json.dump(info, sys.stdout, indent=1, ensure_ascii=False)
