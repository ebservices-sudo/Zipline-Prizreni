"""
Builds images/map-base.svg: the white base layer of the illustrated Prizren map
(contour lines, the Lumbardhi river, streets, the fortress walls).

Landmarks, labels, the zipline and the walking route are drawn by hand in
index.html on top of this layer; this script prints their projected
coordinates so they line up.

Data:  streets, river, landmarks  (c) OpenStreetMap contributors, ODbL
       elevation                  AWS Terrain Tiles (terrarium, SRTM-based)

Usage: python tools/build-map.py      (needs numpy, matplotlib, pillow)
Downloads are cached in tools/.cache/ (git-ignored).
"""
import heapq, json, math, os, sys, urllib.parse, urllib.request

import numpy as np
from PIL import Image
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "tools", ".cache")
OUT = os.path.join(ROOT, "images", "map-base.svg")
UA = {"User-Agent": "zipline-prizren-map-build/1.0"}

# ---- projection: 1 SVG unit = 1.5 m, map is 1600 x 1100 units (2.4 x 1.65 km)
W, H, M_PER_UNIT = 1600, 1100, 1.5
LAT0, LON0 = 42.2096, 20.7468             # map centre (between fortress and zipline)
KY = 111_080 / M_PER_UNIT                  # units per degree latitude
KX = 111_320 * math.cos(math.radians(LAT0)) / M_PER_UNIT
BBOX = "42.198,20.722,42.221,20.772"      # download box, a little larger than the map


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
    q = "[out:json][timeout:120];" + q.replace("BBOX", BBOX)
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


def inside(p, m=60):
    return -m <= p[0] <= W + m and -m <= p[1] <= H + m


def path_d(lines, prec=1, closed=False):
    """Compact path data using relative moves."""
    out, cx, cy = [], 0.0, 0.0
    f = (lambda v: str(round(v, prec)).rstrip("0").rstrip(".") if prec else str(int(round(v))))
    for pts in lines:
        if len(pts) < 2:
            continue
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
    if not cls:
        continue
    pts = [P(g["lat"], g["lon"]) for g in e["geometry"]]
    for run in clip_runs(pts):
        street_lines[cls].append(dp(run, 0.7))

# ---- 2. river (centre line) + lake
water = overpass("water.json", "(way[waterway](BBOX);relation[waterway](BBOX);way[natural=water](BBOX););out geom;")
river, streams = [], []
for e in water:
    t = e.get("tags", {})
    if e["type"] != "way" or not e.get("geometry"):
        continue
    pts = [P(g["lat"], g["lon"]) for g in e["geometry"]]
    if t.get("waterway") == "river":
        river += [dp(r, 0.6) for r in clip_runs(pts)]
    elif t.get("waterway") in ("stream", "canal"):
        streams += [dp(r, 0.8) for r in clip_runs(pts)]

# ---- 3. fortress walls (OSM way 136001313, "Kalaja e Prizrenit")
pois = overpass("fortress.json", "(way(136001313););out geom;")
fortress = [[P(g["lat"], g["lon"]) for g in pois[0]["geometry"]]] if pois else []

# ---- 4. contour lines from terrain tiles
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
for lvl, segs in zip(cs.levels, cs.allsegs):
    for seg in segs:
        pts = [px_to_svg(x, y) for x, y in seg]
        for run in clip_runs(pts):
            run = dp(run, 1.2)
            if len(run) > 2:
                contours["major" if int(lvl) % 50 == 0 else "minor"].append(run)

# ---- 5. write the SVG
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<!-- Generated by tools/build-map.py. Map data (c) OpenStreetMap contributors (ODbL). Elevation: AWS Terrain Tiles. -->
<style>
.c{{fill:none;stroke:#E8ECF4;stroke-width:1}}.C{{fill:none;stroke:#DCE3EF;stroke-width:1.4}}
.r0,.r1,.r2,.r3{{fill:none;stroke-linecap:round;stroke-linejoin:round}}
.r0{{stroke:#DCE1EA;stroke-width:8}}.r1{{stroke:#E6E9F0;stroke-width:5}}.r2{{stroke:#EDEFF4;stroke-width:3}}
.r3{{stroke:#DFE3EA;stroke-width:1.6;stroke-dasharray:4 3}}
.w0{{fill:none;stroke:#B9D2F3;stroke-width:15;stroke-linecap:round;stroke-linejoin:round}}
.w1{{fill:none;stroke:#DCEAFB;stroke-width:11;stroke-linecap:round;stroke-linejoin:round}}
.ws{{fill:none;stroke:#CFE0F8;stroke-width:2.5;stroke-linecap:round}}
.fw{{fill:#F1F6FD;stroke:#9DB9E4;stroke-width:1.6;stroke-linejoin:round}}
</style>
<rect width="{W}" height="{H}" fill="#fff"/>
<path class="c" d="{path_d(contours['minor'], 0)}"/>
<path class="C" d="{path_d(contours['major'], 0)}"/>
<path class="fw" d="{path_d(fortress, 1, closed=True)}"/>
<path class="ws" d="{path_d(streams, 0)}"/>
<path class="r3" d="{path_d(street_lines['path'], 1)}"/>
<path class="r2" d="{path_d(street_lines['service'], 1)}"/>
<path class="r1" d="{path_d(street_lines['minor'], 1)}"/>
<path class="r0" d="{path_d(street_lines['major'], 1)}"/>
<path class="w0" d="{path_d(river, 1)}"/>
<path class="w1" d="{path_d(river, 1)}"/>
</svg>
'''
with open(OUT, "w", encoding="utf-8") as f:
    f.write(svg)
print("wrote", OUT, len(svg) // 1024, "KB", file=sys.stderr)

# ---- 6. walking route: Shadërvan square -> zipline start (shortest path on walkable ways)
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
