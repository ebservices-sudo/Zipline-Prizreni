/* ==========================================================================
   Zipline Prizren — script.js
   1) CONFIG   : phone, location, links, map download. Edit here.
   2) MAP      : every object on the map (position, turn, mirror) + photos.
   3) STRINGS  : ALL visible text, Albanian (sq, default) + English (en).
   4) Behaviour: language, links, contact form, map (hero + full screen), menu.
   ========================================================================== */

/* ---------- 1) CONFIG ---------------------------------------------------- */
// The opening hours are not on the site (the owner changes them by season); every
// "Orari" link opens the Google listing, where he keeps them up to date. This is the
// listing's permanent link; an empty string falls back to a Google Maps search.
const GOOGLE_PROFILE_URL = 'https://maps.google.com/?cid=13558656802540752476';
const TIKTOK_URL = 'https://www.tiktok.com/@ziplineprizren';   // empty string = TikTok buttons hidden
// "Shkarko hartën" (footer): put the owner's map at MAP_DOWNLOAD_FILE, then set the flag to true.
const MAP_DOWNLOAD_ENABLED = false;
const MAP_DOWNLOAD_FILE = 'downloads/harta-zipline-prizren.pdf';

const CONFIG = {
  waNumber: '38348100095',          // WhatsApp for questions, without "+"
  phone: '+383 48 100 095',
  instagram: 'https://www.instagram.com/ziplineprizren/',
  facebook: 'https://www.facebook.com/p/Zipline-Prizren-61576753757141/',
  // Where Google Maps sends people: the "Zipline Prizren" pin on Google Maps (zipline start, by the Kalaja).
  lat: 42.2075625,
  lng: 20.7476875
};

/* ---------- 2) MAP --------------------------------------------------------
   Everything drawn by hand on the map is placed from here; index.html only
   holds the drawings. x/y = map units (1 unit = 1.5 m, north up, see
   tools/build-map.py). Positions checked against Google Maps on 2026-10-07.
     rot   = turn the drawing, degrees clockwise
     scale = make the drawing smaller / bigger (1 = as drawn)
     flip  = mirror the drawing left-right
   The name labels never turn. h = height of the drawing above its point (for
   the pop-up), `icon` + `vb` = the small icon in the full map's list.         */
const ZIPLINE = {
  start: { x: 848.8, y: 700.9 },   // launch = the "Zipline Prizren" pin on Google Maps
  end: { x: 862.8, y: 345.6 },     // landing on the slope north of the river: the OSM line
                                   // (way 1423491824) drawn 25% longer, at the owner's request
  label: 0.3                       // where the "Zipline" label sits (0 = start, 1 = landing)
};
// Stairs from the landing down the slope to the nearest point of the road (Enver Haradinaj),
// drawn as a few simple lines. They are not on OSM or in any photo, so the points are a best
// guess until the owner confirms: add points for a bend, or show: false to hide them.
const STAIRS = { show: true, points: [[857, 350], [808, 391]] };

const PLACES = [
  { id: 'start',       ...ZIPLINE.start, h: 42,   icon: 's-pin',       vb: '-16 -42 32 44' },
  { id: 'kalaja',      x: 722.9,  y: 567.4,  h: 92,   icon: 's-castle',    vb: '-62 -68 126 72' },
  { id: 'landing',     ...ZIPLINE.end,   h: 8,    icon: null },
  // the bridge crosses the Lumbardhi north-south (OSM way 88338996), so its drawing is turned across the river
  { id: 'ura',         x: 460.3,  y: 552.7,  rot: 90, scale: .6, h: 32, icon: 's-bridge', vb: '-54 -42 108 56' },
  { id: 'shadervan',   x: 457.4,  y: 594.5,  h: 18,   icon: 's-fountain',  vb: '-12 -18 24 20' },
  { id: 'sinan',       x: 501.7,  y: 595.9,  h: 68,   icon: 's-mosque',    vb: '-24 -68 48 70' },
  { id: 'hamam',       x: 513.2,  y: 462.7,  h: 28,   icon: 's-hamam',     vb: '-28 -30 56 32' },
  { id: 'lidhja',      x: 632.6,  y: 415.7,  h: 44,   icon: 's-house',     vb: '-27 -44 54 46' },
  { id: 'premte',      x: 200.2,  y: 400.2,  h: 56,   icon: 's-church',    vb: '-25 -56 50 58' },
  { id: 'rrapi',       x: 732.7,  y: 359.7,  h: 30,   icon: 's-tree',      vb: '-20 -30 40 32' }
];

/* Smaller points of interest (data-poi in index.html). Google Maps positions, except
   the museum and the viewpoint, which Google doesn't list: those are OSM.        */
const POIS = {
  gjergji:    { x: 428.8, y: 662.2 },
  katedralja: { x: 339.5, y: 693.4 },
  arasta:     { x: 529.5, y: 495.1 },
  gazi:       { x: 598.2, y: 411.2 },
  katip:      { x: 515.8, y: 228.8 },
  kalter:     { x: 372.2, y: 550.3 },
  view:       { x: 659,   y: 643 },
  muzeu:      { x: 386,   y: 407 },
  sahat:      { x: 238.5, y: 425.2 }
};

/* Photos in the map pop-ups: images/places/, 720×480, cropped to 3:2.
   `start` and `landing` are the client's own photos. The others are from
   Wikimedia Commons; their licences ask for the author, the licence and a note
   that the photo was changed (we cropped them), which the pop-up shows.          */
const PHOTOS = {
  start:     { src: 'images/places/start.jpg' },
  landing:   { src: 'images/places/landing.jpg' },
  kalaja:    { src: 'images/places/kalaja.jpg',    by: 'Tom.whitehead337', lic: 'CC BY-SA 4.0', file: 'Prizren_Fortress_(Kalaja_e_Prizrenit).jpg' },
  ura:       { src: 'images/places/ura.jpg',       by: 'Pudelek',          lic: 'CC BY-SA 4.0', file: 'Stone_Bridge_in_Prizren_(by_Pudelek).JPG' },
  shadervan: { src: 'images/places/shadervan.jpg', by: 'GentiBehramaj',    lic: 'CC BY-SA 4.0', file: 'Sheshi_Shadervan.jpg' },
  sinan:     { src: 'images/places/sinan.jpg',     by: 'Ravi Dwivedi',     lic: 'CC BY-SA 4.0', file: 'Sinan_Pasha_Mosque,_Prizren,_Kosovo.jpg' },
  hamam:     { src: 'images/places/hamam.jpg',     by: 'ShkelzenRexha',    lic: 'CC BY-SA 3.0', file: '36_Prizreni_-_Hamami_mesjetar_-_Midle_Century_Hamam.JPG' },
  lidhja:    { src: 'images/places/lidhja.jpg',    by: 'Bujar Imer Gashi', lic: 'CC BY-SA 3.0', file: 'Prizren_-_The_complex_of_Prizren_League.jpg' },
  premte:    { src: 'images/places/premte.jpg',    by: 'Marcin Konsek',    lic: 'CC BY-SA 4.0', file: '2011_Prizren,_Cerkiew_Bogurodzicy_Ljevi%C5%A1kiej_10.JPG' },
  rrapi:     { src: 'images/places/rrapi.jpg',     by: 'Mergim.emini',     lic: 'CC BY-SA 4.0', file: 'Rrapi_Prizren7.jpg' }
};

/* Small line icons for the rules (24×24, stroked): the same four signs as on the rules board at the station. */
const RULE_ICONS = {
  allowed: '<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.8 2.8L16.2 9.6"/>',
  banned: '<circle cx="12" cy="12" r="9"/><path d="M5.7 5.7l12.6 12.6"/>',
  dress: '<path d="M9 3.5L4 5.6 1.9 10.6l3.6 1.5.5-1.3v9.7h12v-9.7l.5 1.3 3.6-1.5L20 5.6l-5-2.1c-.4 1.5-1.6 2.5-3 2.5S9.4 5 9 3.5z"/>',
  warning: '<path d="M12 3.6l9.4 16.4H2.6z"/><path d="M12 9.6v4.8M12 17.2v.2"/>'
};

/* ---------- 3) STRINGS --------------------------------------------------- */
const STRINGS = {
  sq: {
    meta_title: 'Zipline Prizren — Fluturo mbi Prizren nga Kalaja',
    meta_desc: 'Zipline nga Kalaja e Prizrenit. Shiko hartën me pikënisjen, rrugën nga Shadërvani dhe rregullat e sigurisë. Pyetje? Na shkruaj në WhatsApp.',
    skip: 'Kalo te përmbajtja',
    nav_map: 'Harta', nav_rules: 'Rregullat', nav_erca: 'ERCA', nav_contact: 'Kontakti', nav_ask: 'Pyetje?',
    menu_open: 'Hap menynë', menu_close: 'Mbyll menynë', nav_label: 'Navigimi kryesor', lang_label: 'Gjuha',

    hero_eyebrow: 'Zipline te Kalaja e Prizrenit',
    hero_title: 'Fluturo mbi Prizren',
    hero_sub_a: 'Fluturo mbi luginën e Lumbardhit me nisje nga Kalaja e Prizrenit.',
    hero_sub_b: 'Qyteti i vjetër poshtë teje, era në fytyrë.',
    hero_cta_map: 'Shiko hartën',
    hero_cta_wa: 'Pyetje? Na shkruaj',
    hero_erca: 'Anëtar i ERCA · Ndërtuar sipas EN 15567-1',
    quick_label: 'Orari dhe rrjetet sociale',
    quick_hours: 'Shiko orarin', quick_hours_sub: 'në Google',
    quick_follow: 'Na ndiq',
    fact_start_k: 'Pikënisja', fact_start_v: 'Te Kalaja e Prizrenit',
    fact_walk_k: 'Në këmbë', fact_walk_v: '15–20 min nga Shadërvani',
    fact_weight_k: 'Pesha', fact_weight_v: '40–100 kg',
    fact_gear_k: 'Pajisjet', fact_gear_v: 'Helmetë, hark, trajnim',

    map_title: 'Harta e Zipline Prizren: nga Shadërvani te Kalaja dhe te pikënisja e zipline-it, me Urën e Gurit, Xhaminë e Sinan Pashës dhe lumin Lumbardh.',
    map_open: 'Hap hartën e plotë',
    map_open_chip: 'Kliko për hartën e plotë',
    legend_zip: 'Zipline',
    legend_walk: 'Shtegu nga Shadërvani',
    map_walk: '15–20 min në këmbë',
    map_zip: 'Zipline',
    map_stairs: 'Shkallët',
    area_oldtown: 'Qyteti i vjetër',
    area_gorge: 'Gryka e Lumbardhit ↘',
    pl_kalaja_s: 'Kalaja', pl_ura_s: 'Ura e Gurit', pl_shadervan_s: 'Shadërvani', pl_sinan_s: 'Xhamia e Sinan Pashës',
    pl_hamam_s: 'Hamami', pl_lidhja_s: 'Lidhja e Prizrenit', pl_premte_s: 'Kisha e Shën Premtes', pl_rrapi_s: 'Rrapi shekullor',
    pl_landing_s: 'Ulja', pl_start_s: 'Pikënisja',
    poi_view: 'Pikë panoramike',
    places: {
      start: ['Zipline Prizren · Pikënisja', 'Këtu fillon fluturimi mbi Lumbardh. Butoni i Google Maps të sjell pikërisht këtu.'],
      kalaja: ['Kalaja e Prizrenit', 'Kalaja mbi qytet, me pamje nga e gjithë lugina. Pikënisja është pak më në juglindje të saj.'],
      landing: ['Ulja', 'Fluturimi mbaron përtej lumit Lumbardh.'],
      ura: ['Ura e Gurit', 'Ura e vjetër prej guri mbi Lumbardh, simboli i Prizrenit.'],
      shadervan: ['Shadërvani', 'Sheshi kryesor i qytetit të vjetër. Nga këtu nis shtegu në këmbë për te Kalaja.'],
      sinan: ['Xhamia e Sinan Pashës', 'Xhami osmane e vitit 1615, pranë Shadërvanit.'],
      hamam: ['Hamami i Gazi Mehmet Pashës', 'Banjë osmane e shekullit XVI.'],
      lidhja: ['Kompleksi i Lidhjes së Prizrenit', 'Muzeu i Lidhjes Shqiptare të Prizrenit, 1878.'],
      premte: ['Kisha e Shën Premtes', 'Kishë e shekullit XIV, pjesë e trashëgimisë botërore të UNESCO-s.'],
      rrapi: ['Rrapi shekullor', 'Rrapi i vjetër i Marashit, buzë Lumbardhit.']
    },

    view_kicker: 'Ambienti',
    view_title: 'Prizreni nga lart',
    view_sub: 'Pikënisja është në shpatin mbi luginën e Lumbardhit, me gjithë Prizrenin përpara. Në tarracë ka pufa dhe hije: shiko të tjerët duke fluturuar, pastaj vjen radha jote.',
    alt_band: 'Tri shoqe në pufat e Zipline Prizren, me perëndimin e diellit mbi Prizren',
    reels_title: 'Nga kablloja',
    reels_sub: 'Pamje të vërteta nga fluturimet te Zipline Prizren.',
    reel_toggle: 'Luaj ose ndal videon',
    reel_sunset: 'Perëndimi mbi Prizren', reel_gorge: 'Mbi grykën e Lumbardhit', reel_cable: 'Pamja nga kablloja',
    reel_valley: 'Lugina dhe qyteti', reel_kalaja: 'Kodra e Kalasë',
    alt_ph_a: 'Stacioni prej druri i Zipline Prizren në shpat, me vizitorë para tij',
    alt_ph_b: 'Tarraca me pufa e karrige nën strehë, me qytetin poshtë',
    alt_ph_c: 'Fluturuese përshëndet nga kablloja në perëndim të diellit, me Prizrenin poshtë',
    alt_ph_d: 'Fluturues me krahë hapur sapo niset nga platforma, me qytetin poshtë',
    alt_ph_e: 'Dy shoqe në pufat e Zipline Prizren, me kabllon dhe qytetin përpara',

    // The official rules, word for word from the rules board at the station (Albanian side). On purpose,
    // the site leaves out the board's age (6) and height (130 cm) limits and "Fëmijë nën 6 vjeç".
    rules_kicker: 'Rregullat',
    rules_title: 'Para se të fluturosh',
    rules_intro: 'Rregullat e përdorimit të Zip Line Prizren',
    rules: [
      ['allowed', 'Lejohet pjesëmarrja vetëm për persona që plotësojnë këto kushte:', [
        'Pesha minimale: 40 kg',
        'Pesha maksimale: 100 kg',
        'Të jeni shëndetplotë dhe të aftë fizikisht']],
      ['banned', 'Nuk lejohet pjesëmarrja për:', [
        'Persona nën ndikimin e alkoolit ose e drogës',
        'Gra shtatzëna',
        'Persona me probleme të zemrës, frymëmarrjes, shpinës, ekuilibrit apo epilepsi',
        'Persona me çrregullime mendore ose frikë të theksuar nga lartësitë']],
      ['dress', 'Kodi i veshjes:', [
        'Këpucë të mbyllura dhe të forta (Nuk lejohen sandale, taka, flip-flops)',
        'Pa shalla, çadra, selfie-sticks apo sende të tjera të varura',
        'Flokët e gjatë duhet të lidhen mbrapa',
        'Bizhuteritë, çelësat dhe telefonat duhet të hiqen ose të ruhen në çanta',
        'Syzet të sigurohen me shirit sportiv']],
      ['warning', 'Udhëzime të tjera të rëndësishme:', [
        'Ndiqni udhëzimet e instruktorëve në çdo moment',
        'Mos filloni lëshimin pa lejen e qartë të instruktorit',
        'Mbani duart në dorezë gjatë lëshimit',
        'Mos përdorni Zip Line nëse ndiheni të pasigurt ose të sëmurë']]
    ],

    erca_kicker: 'Siguria',
    erca_title: 'Anëtar i ERCA',
    erca_p1: 'Zipline Prizren është anëtar i European Ropes Course Association (ERCA), shoqatës evropiane të parqeve me litarë dhe zipline-ve, dhe ka nënshkruar deklaratën e vetëangazhimit të ERCA-s.',
    erca_p2: 'Linja u ndërtua sipas standardit evropian EN 15567-1, nën mbikëqyrjen e Paul de Gast (Ropes Course Solutions), trup inspektimi dhe trajnimi i certifikuar nga ERCA.',
    erca_facts: ['Anëtar i ERCA', 'Ndërtuar sipas standardit EN 15567-1', 'Helmetë, hark dhe trajnim sigurie për çdo fluturues'],
    erca_seal_alt: 'Shenja ERCA Certified Inspection Body e Ropes Course Solutions',
    erca_seal_cap: 'Trup inspektimi i certifikuar nga ERCA, që mbikëqyri ndërtimin e linjës',

    contact_kicker: 'Kontakti',
    contact_title: 'Ke një pyetje?',
    contact_sub: 'Shkruaje këtu dhe hapim WhatsApp-in me mesazhin gati. Ekipi të përgjigjet atje.',
    contact_direct: 'Ose na shkruaj direkt në WhatsApp:',
    q_name: 'Emri', q_optional: '(opsional)', q_topic: 'Tema', q_text: 'Pyetja jote',
    q_topics: ['Pyetje', 'Orari dhe moti', 'Grupe', 'Tjetër'],
    q_btn: 'Dërgo në WhatsApp',
    q_hint: 'Butoni hap WhatsApp-in në telefon ose WhatsApp Web në kompjuter.',
    q_err: 'Shkruaj pyetjen tënde.',
    wa_hello: 'Përshëndetje Zipline Prizren! Kam një pyetje.',
    wa_q_hello: 'Përshëndetje Zipline Prizren!',
    wa_q_topic: 'Tema',
    wa_float: 'Pyetje? Na shkruaj në WhatsApp',

    mapx_title: 'Harta e Zipline Prizren',
    zoom_in: 'Zmadho', zoom_out: 'Zvogëlo', zoom_reset: 'Rikthe pamjen', map_close: 'Mbyll hartën',
    dest_kicker: 'Destinacioni',
    dest_name: 'Zipline Prizren · Pikënisja',
    gps_copy: 'Kopjo', gps_copied: 'U kopjua',
    photo_by: 'Foto', photo_cropped: 'e prerë',
    dest_btn: 'Hap rrugën në Google Maps',
    dest_hint: 'Google Maps hapet me rrugën nga vendndodhja jote deri te pikënisja.',
    walk_info: 'Në këmbë nga Shadërvani: rreth 940 m, 15–20 min përpjetë.',
    places_title: 'Vendet në hartë',
    intro_skip: 'Kliko për ta kaluar',

    foot_tag: 'Fluturo mbi Prizren.',
    foot_contact: 'Kontakti', foot_wa: 'WhatsApp dhe telefon', foot_ask: 'Dërgo një pyetje',
    foot_hours: 'Orari', foot_hours_link: 'Shiko orarin në Google',
    foot_find: 'Na gjej', foot_map: 'Harta e plotë', foot_route: 'Rruga në Google Maps', foot_download: 'Shkarko hartën',
    foot_rights: 'Të gjitha të drejtat e rezervuara.',
    foot_mapdata: 'Të dhënat e hartës',
    foot_demo: 'Faqe demo e përgatitur nga EB Services.'
  },

  en: {
    meta_title: 'Zipline Prizren — Fly over Prizren from the Fortress',
    meta_desc: 'Zipline from Prizren Fortress. See the map with the start point, the walk from Shadërvan and the safety rules. Questions? Message us on WhatsApp.',
    skip: 'Skip to content',
    nav_map: 'Map', nav_rules: 'Rules', nav_erca: 'ERCA', nav_contact: 'Contact', nav_ask: 'Questions?',
    menu_open: 'Open menu', menu_close: 'Close menu', nav_label: 'Main navigation', lang_label: 'Language',

    hero_eyebrow: 'Zipline at Prizren Fortress',
    hero_title: 'Fly over Prizren',
    hero_sub_a: 'Fly across the Lumbardhi valley from Prizren Fortress.',
    hero_sub_b: 'The old town below you, wind in your face.',
    hero_cta_map: 'See the map',
    hero_cta_wa: 'Questions? Message us',
    hero_erca: 'ERCA member · Built to EN 15567-1',
    quick_label: 'Opening hours and social media',
    quick_hours: 'Opening hours', quick_hours_sub: 'on Google',
    quick_follow: 'Follow us',
    fact_start_k: 'Start point', fact_start_v: 'At Prizren Fortress',
    fact_walk_k: 'On foot', fact_walk_v: '15–20 min from Shadërvan',
    fact_weight_k: 'Weight', fact_weight_v: '40–100 kg',
    fact_gear_k: 'Gear', fact_gear_v: 'Helmet, harness, briefing',

    map_title: 'Map of Zipline Prizren: from Shadërvan up to the fortress and the zipline start, with the Stone Bridge, Sinan Pasha Mosque and the Lumbardhi river.',
    map_open: 'Open the full map',
    map_open_chip: 'Click for the full map',
    legend_zip: 'Zipline',
    legend_walk: 'Footpath from Shadërvan',
    map_walk: '15–20 min walk',
    map_zip: 'Zipline',
    map_stairs: 'Stairs',
    area_oldtown: 'Old town',
    area_gorge: 'Lumbardhi Gorge ↘',
    pl_kalaja_s: 'Fortress', pl_ura_s: 'Stone Bridge', pl_shadervan_s: 'Shadërvan', pl_sinan_s: 'Sinan Pasha Mosque',
    pl_hamam_s: 'Hammam', pl_lidhja_s: 'League of Prizren', pl_premte_s: 'Our Lady of Ljeviš', pl_rrapi_s: 'Old plane tree',
    pl_landing_s: 'Landing', pl_start_s: 'Start point',
    poi_view: 'Viewpoint',
    places: {
      start: ['Zipline Prizren · Start', 'Where the ride begins, above the Lumbardhi. The Google Maps button brings you exactly here.'],
      kalaja: ['Prizren Fortress', 'The fortress above the city, with views over the whole valley. The zipline start is just south-east of it.'],
      landing: ['Landing', 'The ride ends across the Lumbardhi river.'],
      ura: ['Stone Bridge', 'The old stone bridge over the Lumbardhi, the symbol of Prizren.'],
      shadervan: ['Shadërvan', 'The old town’s main square. The footpath up to the fortress starts here.'],
      sinan: ['Sinan Pasha Mosque', 'Ottoman mosque from 1615, next to Shadërvan.'],
      hamam: ['Gazi Mehmed Pasha Hammam', 'A 16th-century Ottoman bathhouse.'],
      lidhja: ['League of Prizren Complex', 'Museum of the Albanian League of Prizren, 1878.'],
      premte: ['Church of Our Lady of Ljeviš', '14th-century church, part of a UNESCO World Heritage site.'],
      rrapi: ['The old plane tree', 'Marash’s centuries-old plane tree by the Lumbardhi.']
    },

    view_kicker: 'The setting',
    view_title: 'Prizren from above',
    view_sub: 'The start sits on the slope above the Lumbardhi valley, with all of Prizren in front of you. The terrace has beanbags and shade: watch the others fly, then it’s your turn.',
    alt_band: 'Three friends on Zipline Prizren beanbags, with the sunset over Prizren',
    reels_title: 'From the cable',
    reels_sub: 'Real footage from rides at Zipline Prizren.',
    reel_toggle: 'Play or pause the video',
    reel_sunset: 'Sunset over Prizren', reel_gorge: 'Over the Lumbardhi gorge', reel_cable: 'The view from the cable',
    reel_valley: 'The valley and the city', reel_kalaja: 'The Kalaja hill',
    alt_ph_a: 'The wooden Zipline Prizren station on the hillside, with visitors in front',
    alt_ph_b: 'The covered terrace with beanbags and chairs, the city below',
    alt_ph_c: 'A rider waves from the cable at sunset, Prizren below',
    alt_ph_d: 'A rider with arms spread just leaving the platform, the city below',
    alt_ph_e: 'Two friends on Zipline Prizren beanbags, the cable and the city ahead',

    rules_kicker: 'Rules',
    rules_title: 'Before you fly',
    rules_intro: 'Rules for the use of Zip Line Prizren',
    // the English side of the same rules board, word for word (same items left out as in Albanian)
    rules: [
      ['allowed', 'Participation is permitted only for persons who meet the following conditions:', [
        'Minimum weight: 40kg',
        'Maximum weight: 100kg',
        'Must be in good health and physically fit']],
      ['banned', 'Participation is not allowed for:', [
        'Persons under the influence of alcohol or drugs',
        'Pregnant women',
        'Persons with heart, respiratory, spinal or balance disorders, or epilepsy',
        'Persons with mental disorders or a strong fear of heights']],
      ['dress', 'Dress code:', [
        'Closed, sturdy footwear (sandals, heels, flip-flops are not allowed)',
        'No scarves, umbrellas, selfie-sticks or hanging items',
        'Long hair must be tied back',
        'Jewelry, keys and mobile phones must be removed or secured in a bag',
        'Goggles/glasses must be secured with a sports strap']],
      ['warning', 'Additional important instructions:', [
        'Follow the instructors’ directions at all times',
        'Do not start the ride without the instructor’s clear permission',
        'Keep your hands on the handles during the ride',
        'Do not use the Zip Line if you feel unsafe or unwell']]
    ],

    erca_kicker: 'Safety',
    erca_title: 'ERCA member',
    erca_p1: 'Zipline Prizren is a member of the European Ropes Course Association (ERCA), the European association for ropes courses and ziplines, and has signed ERCA’s self-commitment declaration.',
    erca_p2: 'The line was built to the European standard EN 15567-1 under the supervision of Paul de Gast (Ropes Course Solutions), an ERCA-certified inspection and training body.',
    erca_facts: ['ERCA member', 'Built to standard EN 15567-1', 'Helmet, harness and safety training for every rider'],
    erca_seal_alt: 'ERCA Certified Inspection Body label of Ropes Course Solutions',
    erca_seal_cap: 'ERCA-certified inspection body that supervised the build of the line',

    contact_kicker: 'Contact',
    contact_title: 'Got a question?',
    contact_sub: 'Write it here and we open WhatsApp with your message ready. The team replies there.',
    contact_direct: 'Or message us directly on WhatsApp:',
    q_name: 'Name', q_optional: '(optional)', q_topic: 'Topic', q_text: 'Your question',
    q_topics: ['Question', 'Hours and weather', 'Groups', 'Other'],
    q_btn: 'Send on WhatsApp',
    q_hint: 'The button opens WhatsApp on your phone, or WhatsApp Web on a computer.',
    q_err: 'Please write your question.',
    wa_hello: 'Hello Zipline Prizren! I have a question.',
    wa_q_hello: 'Hello Zipline Prizren!',
    wa_q_topic: 'Topic',
    wa_float: 'Questions? Message us on WhatsApp',

    mapx_title: 'Zipline Prizren map',
    zoom_in: 'Zoom in', zoom_out: 'Zoom out', zoom_reset: 'Reset view', map_close: 'Close map',
    dest_kicker: 'Destination',
    dest_name: 'Zipline Prizren · Start',
    gps_copy: 'Copy', gps_copied: 'Copied',
    photo_by: 'Photo', photo_cropped: 'cropped',
    dest_btn: 'Open the route in Google Maps',
    dest_hint: 'Google Maps opens with the route from where you are to the start point.',
    walk_info: 'On foot from Shadërvan: about 940 m, 15–20 min uphill.',
    places_title: 'Places on the map',
    intro_skip: 'Tap to skip',

    foot_tag: 'Fly over Prizren.',
    foot_contact: 'Contact', foot_wa: 'WhatsApp and phone', foot_ask: 'Send a question',
    foot_hours: 'Hours', foot_hours_link: 'See opening hours on Google',
    foot_find: 'Find us', foot_map: 'Full map', foot_route: 'Route in Google Maps', foot_download: 'Download the map',
    foot_rights: 'All rights reserved.',
    foot_mapdata: 'Map data',
    foot_demo: 'Demo site prepared by EB Services.'
  }
};

/* ---------- 4) BEHAVIOUR ------------------------------------------------- */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let lang = store.get('zp-lang');
  if (lang !== 'sq' && lang !== 'en') lang = 'sq';           // Albanian by default
  const t = (k) => (STRINGS[lang] && STRINGS[lang][k] !== undefined ? STRINGS[lang][k] : STRINGS.sq[k]);
  const place = (id) => t('places')[id];

  const waLink = (text) => 'https://wa.me/' + CONFIG.waNumber + (text ? '?text=' + encodeURIComponent(text) : '');
  const dirLink = () => 'https://www.google.com/maps/dir/?api=1&destination=' + CONFIG.lat + ',' + CONFIG.lng;
  const hoursLink = () => GOOGLE_PROFILE_URL || 'https://www.google.com/maps/search/?api=1&query=Zipline+Prizren';
  const gps = () => CONFIG.lat.toFixed(5) + ', ' + CONFIG.lng.toFixed(5);

  /* ----- language ----- */
  function applyLang() {
    document.documentElement.lang = lang;
    document.title = t('meta_title');
    const md = $('meta[name="description"]'); if (md) md.content = t('meta_desc');
    const ot = $('meta[property="og:title"]'); if (ot) ot.content = t('meta_title');
    const od = $('meta[property="og:description"]'); if (od) od.content = t('meta_desc');
    const ol = $('meta[property="og:locale"]'); if (ol) ol.content = lang === 'sq' ? 'sq_AL' : 'en_US';

    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-attr]').forEach((el) => {
      el.getAttribute('data-i18n-attr').split(',').forEach((pair) => {
        const [attr, key] = pair.split(':'); el.setAttribute(attr.trim(), t(key.trim()));
      });
    });
    $$('.lang-btn').forEach((b) => {
      const on = b.dataset.lang === lang; b.setAttribute('aria-pressed', on); b.classList.toggle('is-on', on);
    });
    renderLists(); updateLinks();
    $('#menuBtn').setAttribute('aria-label', t($('#nav').classList.contains('open') ? 'menu_close' : 'menu_open'));
    if (map.pop) showPop(map.pop.id);
  }

  /* ----- lists rendered from STRINGS ----- */
  function renderLists() {
    $('#rulesList').innerHTML = t('rules').map((r) =>
      '<li class="rule reveal in"><span class="rule__ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + RULE_ICONS[r[0]] +
      '</svg></span><div><h3>' + r[1] + '</h3><ul class="rule__list">' + r[2].map((x) => '<li>' + x + '</li>').join('') +
      '</ul></div></li>').join('');
    $('#ercaFacts').innerHTML = t('erca_facts').map((x) => '<li>' + x + '</li>').join('');

    const topics = $('#qTopics'); const checked = (topics.querySelector('input:checked') || {}).value || '0';
    topics.innerHTML = t('q_topics').map((x, i) =>
      '<label class="topic"><input type="radio" name="topic" value="' + i + '"' + (String(i) === checked ? ' checked' : '') +
      '><span>' + x + '</span></label>').join('');

    $('#placesList').innerHTML = PLACES.map((p) => {
      const ico = p.icon
        ? '<svg viewBox="' + p.vb + '" aria-hidden="true"><use href="#' + p.icon + '"/></svg>'
        : '<svg viewBox="-12 -12 24 24" aria-hidden="true"><circle r="7" fill="#fff" stroke="#F76B08" stroke-width="3"/><circle r="2.5" fill="#F76B08"/></svg>';
      return '<li><button type="button" class="place" data-go="' + p.id + '">' + ico +
        '<span class="place__txt"><b>' + place(p.id)[0] + '</b><span class="place__desc">' + place(p.id)[1] + '</span></span></button></li>';
    }).join('');
  }

  /* ----- links (WhatsApp, maps, Google hours, social, map download) ----- */
  function updateLinks() {
    $$('[data-wa]').forEach((a) => {
      const k = a.getAttribute('data-wa');
      a.href = waLink(k === 'hello' ? t('wa_hello') : '');
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-dir]').forEach((a) => { a.href = dirLink(); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-hours]').forEach((a) => { a.href = hoursLink(); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-ig]').forEach((a) => { a.href = CONFIG.instagram; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-fb]').forEach((a) => { a.href = CONFIG.facebook; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-tt]').forEach((a) => {
      a.href = TIKTOK_URL || '#'; a.target = '_blank'; a.rel = 'noopener';
      (a.closest('li') || a).hidden = !TIKTOK_URL;
    });
    $$('[data-map-dl]').forEach((a) => { a.href = MAP_DOWNLOAD_FILE; (a.closest('li') || a).hidden = !MAP_DOWNLOAD_ENABLED; });
    $$('[data-phone]').forEach((el) => { el.textContent = CONFIG.phone; });
    $$('[data-gps]').forEach((el) => { el.textContent = gps(); });
  }

  /* ----- contact form → WhatsApp ----- */
  function initForm() {
    const form = $('#askForm'); const txt = $('#qText'); const err = $('#qTextErr');
    txt.addEventListener('input', () => { if (txt.value.trim()) { err.textContent = ''; txt.removeAttribute('aria-invalid'); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = txt.value.trim();
      if (!q) { err.textContent = t('q_err'); txt.setAttribute('aria-invalid', 'true'); txt.focus(); return; }
      const name = $('#qName').value.trim();
      const topic = t('q_topics')[+((form.querySelector('input[name="topic"]:checked') || {}).value || 0)];
      const lines = [t('wa_q_hello'), t('wa_q_topic') + ': ' + topic, '', q];
      if (name) lines.push('', '— ' + name);
      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* =====================================================================
     MAP: one <svg> that lives in the hero and moves into the full-screen
     view when opened. Zoom = changing the viewBox; labels and drawings
     are counter-scaled with --k so they stay readable at every zoom.
     ===================================================================== */
  const map = { svg: null, vb: null, open: false, pop: null, opener: null, fly: 0 };
  const FULL = { x: 0, y: 0, w: 1600, h: 1100 };
  const FOCUS_WIDE = { x: 330, y: 310, w: 920, h: 440 };      // hero on wide screens
  const FOCUS_NARROW = { x: 376, y: 330, w: 590, h: 420 };    // hero + full screen on phones
  const M_PER_UNIT = 1.5;

  function setK(ppu) {   // ppu = screen pixels per map unit
    map.svg.style.setProperty('--k', clamp(Math.pow(ppu, -0.75), 0.2, 1.3).toFixed(3));
  }

  function heroView() {
    const r = $('#heroSlot').getBoundingClientRect(); if (!r.width) return;
    const f = r.width >= 640 ? FOCUS_WIDE : FOCUS_NARROW;
    map.svg.setAttribute('viewBox', [f.x, f.y, f.w, f.h].join(' '));
    setK(Math.min(r.width / f.w, r.height / f.h));
  }

  /* --- full-screen view --- */
  const stage = () => $('#mapStage');
  function fit(box) {
    const r = stage().getBoundingClientRect(); const a = r.width / r.height;
    let w = box.w, h = box.h; const cx = box.x + w / 2, cy = box.y + h / 2;
    if (w / h < a) w = h * a; else h = w / a;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }
  function limit(v) {
    const r = stage().getBoundingClientRect(); const a = r.width / r.height;
    const w = clamp(v.w, 230, Math.max(1750, 1200 * a)); const h = w / a;
    const cx = clamp(v.x + v.w / 2, 0, FULL.w), cy = clamp(v.y + v.h / 2, 0, FULL.h);
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }
  const HOME_WIDE = { x: 240, y: 250, w: 1120, h: 560 };      // full screen, first view on wide screens
  function homeBox() { return stage().getBoundingClientRect().width < 640 ? FOCUS_NARROW : HOME_WIDE; }
  function applyVB() {
    const v = map.vb; const r = stage().getBoundingClientRect();
    map.svg.setAttribute('viewBox', v.x.toFixed(2) + ' ' + v.y.toFixed(2) + ' ' + v.w.toFixed(2) + ' ' + v.h.toFixed(2));
    const ppu = r.width / v.w; setK(ppu);
    // scale bar: pick a round distance that is 60–150 px long
    const pxPerM = ppu / M_PER_UNIT;
    const m = [25, 50, 100, 200, 250, 500, 1000].find((d) => d * pxPerM >= 60) || 1000;
    $('#scaleBar').style.width = Math.round(m * pxPerM) + 'px';
    $('#scaleTxt').textContent = m >= 1000 ? (m / 1000) + ' km' : m + ' m';
    placePop();
  }
  function toMap(cx, cy) {
    const r = stage().getBoundingClientRect(); const v = map.vb;
    return { x: v.x + (cx - r.left) / r.width * v.w, y: v.y + (cy - r.top) / r.height * v.h };
  }
  function zoomAt(f, cx, cy) {
    cancelFly();
    const p = toMap(cx, cy); const v = map.vb;
    map.vb = limit({ x: p.x - (p.x - v.x) / f, y: p.y - (p.y - v.y) / f, w: v.w / f, h: v.h / f });
    applyVB();
  }
  function zoomCenter(f) { const r = stage().getBoundingClientRect(); zoomAt(f, r.left + r.width / 2, r.top + r.height / 2); }
  function cancelFly() { cancelAnimationFrame(map.fly); map.fly = 0; }
  function flyTo(target, ms = 650) {
    cancelFly();
    const from = { ...map.vb }; const to = limit(target); const t0 = performance.now();
    if (reduced) { map.vb = to; applyVB(); return; }
    const ease = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const step = (now) => {
      const k = ease(Math.min(1, (now - t0) / ms));
      map.vb = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k, w: from.w + (to.w - from.w) * k, h: from.h + (to.h - from.h) * k };
      applyVB();
      if (k < 1) map.fly = requestAnimationFrame(step); else map.fly = 0;
    };
    map.fly = requestAnimationFrame(step);
  }
  function goTo(id) {
    const p = PLACES.find((x) => x.id === id); if (!p) return;
    const r = stage().getBoundingClientRect(); const w = r.width < 640 ? 440 : 720; const h = w * r.height / r.width;
    $$('.lm').forEach((g) => g.classList.toggle('is-hot', g.dataset.place === id));
    $$('.place').forEach((b) => b.classList.toggle('is-on', b.dataset.go === id));
    showPop(id);
    // place the landmark low enough for its pop-up (photo + text) to fit above it
    const ppu = r.width / w; const k = clamp(Math.pow(ppu, -0.75), 0.2, 1.3);
    const need = popTop() + $('#mapPop').offsetHeight + 16 + (p.h + 8) * k * ppu + 12;   // same sums as placePop(), plus a margin
    const sy = clamp(need, r.height * 0.5, r.height - 24);
    flyTo({ x: p.x - w / 2, y: p.y - sy / ppu, w, h });
  }

  /* --- popover on a landmark --- */
  function photoHTML(id, alt) {
    const ph = PHOTOS[id]; if (!ph) return '';
    return '<figure class="pop__img"><img src="' + ph.src + '" alt="' + esc(alt) + '" width="720" height="480"></figure>';
  }
  function showPop(id) {
    const pop = $('#mapPop'); const d = place(id); if (!d) return;
    map.pop = { id };
    pop.classList.toggle('has-img', !!PHOTOS[id]);
    pop.innerHTML = photoHTML(id, d[0]) + '<b>' + esc(d[0]) + '</b><p>' + esc(d[1]) + '</p>' +
      (id === 'start' ? '<a class="btn" href="' + dirLink() + '" target="_blank" rel="noopener"><span>' + esc(t('dest_btn')) + '</span></a>' : '');
    pop.hidden = false; placePop();
  }
  let photosLoaded = false;
  function preloadPhotos() {
    if (photosLoaded) return; photosLoaded = true;
    Object.values(PHOTOS).forEach((ph) => { const i = new Image(); i.src = ph.src; });
  }
  function hidePop() {
    map.pop = null; $('#mapPop').hidden = true;
    $$('.lm.is-hot').forEach((g) => g.classList.remove('is-hot'));
    $$('.place.is-on').forEach((b) => b.classList.remove('is-on'));
  }
  const popTop = () => (stage().getBoundingClientRect().width < 640 ? 122 : 70);   // keep pop-ups clear of the tool buttons (+ compass on phones)
  function placePop() {
    if (!map.pop || !map.open) return;
    const p = PLACES.find((x) => x.id === map.pop.id); const r = stage().getBoundingClientRect(); const v = map.vb;
    const x = (p.x - v.x) / v.w * r.width, y = (p.y - v.y) / v.h * r.height;
    const k = parseFloat(map.svg.style.getPropertyValue('--k')) || 1;
    const pop = $('#mapPop'); const top = y - (p.h + 8) * k * (r.width / v.w);
    const below = top - pop.offsetHeight - 16 < popTop();
    pop.classList.toggle('is-below', below);
    const half = pop.offsetWidth / 2 + 8;
    pop.style.left = clamp(x, half, r.width - half) + 'px';
    pop.style.top = (below ? y + 18 : top) + 'px';
  }

  /* --- open / close --- */
  function openMap(opts = {}) {
    if (map.open) return;
    map.open = true; map.opener = document.activeElement;
    const box = $('#mapx'); box.hidden = false;
    document.documentElement.classList.add('is-locked');
    measurePanel();
    stage().appendChild(map.svg);
    map.vb = limit(fit(homeBox())); applyVB();
    if (!opts.fromHistory) { try { history.pushState({ zpMap: 1 }, '', '#harta'); } catch (e) { /* file:// in some browsers */ } }
    $('#mapClose').focus({ preventScroll: true });
    if (reduced || opts.noIntro) $('#mapIntro').hidden = true; else playIntro();
    preloadPhotos();
  }
  function closeMap(fromHistory) {
    if (!map.open) return;
    map.open = false; stopIntro(); hidePop(); cancelFly();
    $('#mapx').hidden = true;
    document.documentElement.classList.remove('is-locked');
    $('#heroSlot').appendChild(map.svg); heroView();
    if (!fromHistory) {
      if (history.state && history.state.zpMap) history.back();
      else if (location.hash === '#harta') { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ } }
    }
    if (map.opener && map.opener.focus) map.opener.focus();
  }
  function measurePanel() {
    const box = $('#mapx'); const panel = $('.mapx__panel');
    const mobile = innerWidth < 900;
    box.style.setProperty('--panel-h', mobile ? panel.offsetHeight + 'px' : '0px');
  }

  /* --- intro: castle is drawn, a cable drops to the corner, a rider zips down, the map opens from where he lands --- */
  const intro = { anims: [], raf: 0, timer: 0 };
  function layoutIntro() {
    const svg = $('#mapIntro svg'); const W = 1600; const H = Math.round(W * innerHeight / innerWidth);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    const tall = H > W;
    const s = tall ? 8.4 : 5.2 * Math.min(1, H / 900);
    const ax = W * (tall ? 0.44 : 0.27), ay = Math.max(H * (tall ? 0.27 : 0.3), 72 * s + 70);
    $('.intro__castle').setAttribute('transform', 'translate(' + ax + ' ' + ay + ') scale(' + s + ')');
    const x0 = ax + 40 * s, y0 = ay - 39 * s, x1 = W + 90, y1 = H + 90;
    const len = Math.hypot(x1 - x0, y1 - y0);
    $('#introCable').setAttribute('d', 'M' + x0 + ' ' + y0 + 'Q' + ((x0 + x1) / 2) + ' ' + ((y0 + y1) / 2 + len * 0.1) + ' ' + x1 + ' ' + y1);
    $$('.intro__lines path').forEach((p, i) => {
      const y = ay + (18 + i * 12) * s;
      p.setAttribute('d', 'M-60 ' + (y + 60 * s) + 'L' + (ax + (70 - i * 18) * s) + ' ' + y);
    });
    $('#introRider').setAttribute('transform', 'translate(' + x0 + ' ' + y0 + ')');
    $('#introRider use').setAttribute('transform', 'scale(' + (s * 0.72) + ')');
  }
  function playIntro() {
    const el = $('#mapIntro'); el.hidden = false; el.style.opacity = '';
    layoutIntro();
    const anim = (node, kf, o) => { const a = node.animate(kf, { fill: 'both', ...o }); intro.anims.push(a); return a; };
    const draw = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
    $$('.intro__castle path').forEach((p, i) => anim(p, draw, { duration: 700, delay: i * 55, easing: 'cubic-bezier(.4,0,.2,1)' }));
    $$('.intro__lines path').forEach((p, i) => anim(p, draw, { duration: 520, delay: 250 + i * 90, easing: 'cubic-bezier(.2,.7,.2,1)' }));
    anim($('#introCable'), draw, { duration: 480, delay: 620, easing: 'ease-out' });
    anim($('#introRider'), [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 820 });
    anim(stage(), [{ clipPath: 'circle(0px at 100% 100%)' }, { clipPath: 'circle(0px at 100% 100%)' }], { duration: 1 });

    const cable = $('#introCable'); const rider = $('#introRider'); const L = cable.getTotalLength();
    const T0 = performance.now() + 1050, DUR = 1150;
    const tick = (now) => {
      const k = clamp((now - T0) / DUR, 0, 1); const e = k * k * (1.6 - 0.6 * k);   // ease-in, gathering speed
      const p = cable.getPointAtLength(L * e);
      rider.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + (-6 - 6 * e) + ')');
      if (k >= 0.62 && !intro.revealed) reveal(rider);
      if (k < 1) intro.raf = requestAnimationFrame(tick);
    };
    intro.revealed = false; intro.raf = requestAnimationFrame(tick);
    intro.timer = setTimeout(finishIntro, 3400);
  }
  function reveal(rider) {
    intro.revealed = true;
    const s = stage().getBoundingClientRect(); const b = rider.getBoundingClientRect();
    const x = clamp(b.left + b.width / 2 - s.left, 0, s.width), y = clamp(b.top + b.height / 2 - s.top, 0, s.height);
    const R = Math.hypot(Math.max(x, s.width - x), Math.max(y, s.height - y)) + 20;
    intro.anims.forEach((a) => { if (a.effect && a.effect.target === stage()) a.cancel(); });
    const a = stage().animate([{ clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' }, { clipPath: 'circle(' + R + 'px at ' + x + 'px ' + y + 'px)' }],
      { duration: 780, easing: 'cubic-bezier(.7,0,.25,1)', fill: 'both' });
    intro.anims.push(a);
    const f = $('#mapIntro').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, delay: 260, easing: 'ease-in', fill: 'both' });
    intro.anims.push(f);
    f.onfinish = finishIntro;
  }
  function stopIntro() {
    cancelAnimationFrame(intro.raf); clearTimeout(intro.timer);
    intro.anims.forEach((a) => a.cancel()); intro.anims = [];
  }
  function finishIntro() {
    if ($('#mapIntro').hidden) return;
    stopIntro(); $('#mapIntro').hidden = true;
    if (map.open) $('#mapClose').focus({ preventScroll: true });
  }

  /* --- pointer: drag to pan, pinch / wheel / double-click to zoom, tap a landmark --- */
  function initMapInput() {
    const st = stage(); const pts = new Map(); let pinch = null; let moved = 0;
    const center = () => { const a = [...pts.values()]; return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 }; };
    const dist = () => { const a = [...pts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); };

    st.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.mapx__pop')) return;
      cancelFly(); st.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) moved = 0;
      if (pts.size === 2) { const c = center(); pinch = { d: dist(), vb: { ...map.vb }, p: toMap(c.x, c.y) }; moved = 99; }
      st.classList.add('is-drag');
    });
    st.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      const prev = pts.get(e.pointerId); const cur = { x: e.clientX, y: e.clientY }; pts.set(e.pointerId, cur);
      const r = st.getBoundingClientRect();
      if (pts.size === 1) {
        const dx = cur.x - prev.x, dy = cur.y - prev.y; moved += Math.abs(dx) + Math.abs(dy);
        map.vb = limit({ ...map.vb, x: map.vb.x - dx * map.vb.w / r.width, y: map.vb.y - dy * map.vb.h / r.height });
        applyVB();
      } else if (pts.size === 2 && pinch) {
        const f = dist() / pinch.d; const c = center();
        const w = pinch.vb.w / f, h = pinch.vb.h / f;
        map.vb = limit({ x: pinch.p.x - (c.x - r.left) / r.width * w, y: pinch.p.y - (c.y - r.top) / r.height * h, w, h });
        applyVB();
      }
    });
    const up = (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (pts.size === 1) { const [id, p] = [...pts.entries()][0]; pts.set(id, p); }
      if (!pts.size) {
        st.classList.remove('is-drag');
        if (moved < 6 && e.type === 'pointerup') {
          const hit = document.elementFromPoint(e.clientX, e.clientY);
          const lm = hit && hit.closest('.lm');
          if (lm) goTo(lm.dataset.place); else hidePop();
        }
      }
    };
    st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
    st.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0022)), e.clientX, e.clientY);
    }, { passive: false });
    st.addEventListener('dblclick', (e) => zoomAt(1.8, e.clientX, e.clientY));

    $$('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
      const z = b.dataset.zoom;
      if (z === 'in') zoomCenter(1.5); else if (z === 'out') zoomCenter(1 / 1.5);
      else { hidePop(); flyTo(fit(homeBox())); }
    }));
    $('#mapClose').addEventListener('click', () => closeMap());
    $('#mapIntro').addEventListener('click', finishIntro);
    $('#placesList').addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) goTo(b.dataset.go); });
    $('#copyGps').addEventListener('click', () => {
      const btn = $('#copyGps'); const done = () => { btn.textContent = t('gps_copied'); setTimeout(() => { btn.textContent = t('gps_copy'); }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(CONFIG.lat + ', ' + CONFIG.lng).then(done, () => {}); else done();
    });

    // keyboard: Esc closes, +/- zoom, arrows pan, Tab stays inside the dialog
    document.addEventListener('keydown', (e) => {
      if (!map.open) return;
      if (!$('#mapIntro').hidden) { finishIntro(); if (e.key !== 'Tab') return; }
      if (e.key === 'Escape') { if (map.pop) hidePop(); else closeMap(); return; }
      if (e.target.closest('input, textarea')) return;
      if (e.key === '+' || e.key === '=') zoomCenter(1.4);
      else if (e.key === '-') zoomCenter(1 / 1.4);
      else if (e.key.startsWith('Arrow')) {
        const d = map.vb.w * 0.12; const k = e.key;
        map.vb = limit({ ...map.vb, x: map.vb.x + (k === 'ArrowRight' ? d : k === 'ArrowLeft' ? -d : 0), y: map.vb.y + (k === 'ArrowDown' ? d : k === 'ArrowUp' ? -d : 0) });
        applyVB(); e.preventDefault();
      } else if (e.key === 'Tab') {
        const f = $$('#mapx a[href], #mapx button').filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { f[f.length - 1].focus(); e.preventDefault(); }
        else if (!e.shiftKey && i === f.length - 1) { f[0].focus(); e.preventDefault(); }
      }
    });

    addEventListener('resize', () => {
      if (map.open) { measurePanel(); map.vb = limit(fit(map.vb)); applyVB(); } else heroView();
    });
    addEventListener('popstate', () => {
      const want = !!(history.state && history.state.zpMap);
      if (map.open && !want) closeMap(true); else if (!map.open && want) openMap({ fromHistory: true, noIntro: true });
    });
  }

  // the landmark (drawing or its label) under a point of the hero map; the "open map" button lies on top of it
  function landmarkAt(x, y) {
    if (map.open) return null;
    const hits = $$('#heroSlot .lm').map((g) => ({ g, r: g.getBoundingClientRect() }))
      .filter(({ r }) => r.width && x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4)
      .sort((a, b) => a.r.width * a.r.height - b.r.width * b.r.height);   // the smallest one wins where they overlap
    return hits.length ? hits[0].g : null;
  }
  function initHeroPicks() {
    const btn = $('.hero__open'); let hot = null;
    const setHot = (lm) => {
      if (lm === hot) return;
      if (hot) hot.classList.remove('is-hover');
      hot = lm; if (lm) lm.classList.add('is-hover');
      btn.classList.toggle('is-on-place', !!lm);
    };
    btn.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') setHot(landmarkAt(e.clientX, e.clientY)); });
    btn.addEventListener('pointerleave', () => setHot(null));
    return (e) => {
      const lm = e.detail ? landmarkAt(e.clientX, e.clientY) : null;   // e.detail = 0 for keyboard clicks
      setHot(null);
      if (!lm) return false;
      openMap(); goTo(lm.dataset.place);   // the intro still plays; the landmark pop-up appears as it ends
      return true;
    };
  }

  /* --- put every hand-drawn object where MAP config (top of this file) says --- */
  function placeObjects() {
    const at = (g, o) => {
      g.setAttribute('transform', 'translate(' + o.x + ' ' + o.y + ')');
      const art = g.querySelector('.sc__i > use');   // the drawing only; the name label stays upright
      if (!art) return;
      const tf = [o.rot ? 'rotate(' + o.rot + ')' : '', o.scale && o.scale !== 1 ? 'scale(' + o.scale + ')' : '', o.flip ? 'scale(-1 1)' : ''].join(' ').trim();
      if (tf) art.setAttribute('transform', tf); else art.removeAttribute('transform');
    };
    PLACES.forEach((p) => { const g = $('.lm[data-place="' + p.id + '"]', map.svg); if (g) at(g, p); });
    $$('.poi[data-poi]', map.svg).forEach((g) => { const o = POIS[g.dataset.poi]; if (o) at(g, o); });

    // the cable, the rider on it and its label
    const s = ZIPLINE.start, e = ZIPLINE.end;
    const d = 'M' + s.x + ' ' + s.y + 'L' + e.x + ' ' + e.y;
    $$('.zip__halo, .zip__cable', map.svg).forEach((p) => p.setAttribute('d', d));
    const motion = $('.zip__rider animateMotion', map.svg); if (motion) motion.setAttribute('path', d);
    const len = Math.hypot(e.x - s.x, e.y - s.y), ux = (e.x - s.x) / len, uy = (e.y - s.y) / len;
    const lx = s.x + (e.x - s.x) * ZIPLINE.label + uy * 19.5, ly = s.y + (e.y - s.y) * ZIPLINE.label - ux * 19.5;   // 19.5 units to the left of the cable
    $('.zip__lbl', map.svg).setAttribute('transform', 'translate(' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ')');
    $('.zip__label', map.svg).setAttribute('transform', 'rotate(' + (Math.atan2(uy, ux) * 180 / Math.PI).toFixed(2) + ')');

    // the stairs: a white path with short steps across it
    const st = $('#stairs', map.svg); st.toggleAttribute('hidden', !STAIRS.show);
    const pts = STAIRS.points;
    if (!STAIRS.show || pts.length < 2) return;
    let steps = ''; const W = 3.4, GAP = 5.5;   // half width and step spacing, map units
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; const l = Math.hypot(bx - ax, by - ay);
      const nx = -(by - ay) / l * W, ny = (bx - ax) / l * W;
      for (let k = GAP / 2; k < l; k += GAP) {
        const x = ax + (bx - ax) * k / l, y = ay + (by - ay) * k / l;
        steps += 'M' + (x + nx).toFixed(1) + ' ' + (y + ny).toFixed(1) + 'L' + (x - nx).toFixed(1) + ' ' + (y - ny).toFixed(1);
      }
    }
    const line = 'M' + pts.map((p) => p.join(' ')).join('L');
    $('.stairs__halo', st).setAttribute('d', line);
    $('.stairs__steps', st).setAttribute('d', steps);
    $('.stairs__lbl', st).setAttribute('transform', 'translate(' + pts[0][0] + ' ' + pts[0][1] + ')');   // label at the top of the stairs
  }

  function initMap() {
    map.svg = $('#map');
    placeObjects();
    heroView();
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (!map.open) heroView(); }).observe($('#heroSlot'));
    if (reduced && map.svg.pauseAnimations) map.svg.pauseAnimations();
    const pickFromHero = initHeroPicks();
    $$('[data-open-map]').forEach((b) => b.addEventListener('click', (e) => {
      e.preventDefault(); closeMenu();
      if (b.classList.contains('hero__open') && pickFromHero(e)) return;
      openMap();
    }));
    initMapInput();
    if (location.hash === '#harta') openMap({ fromHistory: true, noIntro: true });
  }

  /* ----- header, menu, reveal ----- */
  function closeMenu() {
    $('#nav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', false); $('#menuBtn').setAttribute('aria-label', t('menu_open'));
  }
  function initChrome() {
    const menuBtn = $('#menuBtn'); const nav = $('#nav');
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', t(open ? 'menu_close' : 'menu_open'));
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', closeMenu));
    $$('.lang-btn').forEach((b) => b.addEventListener('click', () => { lang = b.dataset.lang; store.set('zp-lang', lang); applyLang(); }));
    $('#year').textContent = new Date().getFullYear();
    if (reduced) $$('svg.ridge').forEach((r) => { if (r.pauseAnimations) r.pauseAnimations(); });

    // the floating "question?" button waits until the hero has scrolled away
    const float = $('.wa-float');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => float.classList.toggle('is-away', en.isIntersecting), { threshold: 0.35 }).observe($('#top'));
    }

    const els = $$('.reveal:not(.in), .zoom');
    if ('IntersectionObserver' in window && !reduced) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      els.forEach((el) => io.observe(el));
    } else { els.forEach((el) => el.classList.add('in')); }
  }

  /* ----- reels: each clip loads and plays only while it is on screen; a tap pauses / plays it ----- */
  function initReels() {
    const reels = $$('.reel');
    const play = (v) => { if (!v.src) v.src = v.dataset.src; const p = v.play(); if (p) p.catch(() => {}); };
    reels.forEach((r) => {
      const v = $('video', r);
      v.addEventListener('playing', () => r.classList.add('is-playing'));
      v.addEventListener('pause', () => r.classList.remove('is-playing'));
      $('.reel__play', r).addEventListener('click', () => {
        if (v.paused) { delete r.dataset.held; play(v); } else { r.dataset.held = ''; v.pause(); }
      });
    });
    if (reduced || !('IntersectionObserver' in window)) return;   // no autoplay: the posters show, a tap plays
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      const v = $('video', en.target);
      if (!en.isIntersecting) { if (!v.paused) v.pause(); } else if (!('held' in en.target.dataset)) play(v);
    }), { threshold: 0.4 });
    reels.forEach((r) => io.observe(r));
  }

  document.addEventListener('DOMContentLoaded', () => {
    map.svg = $('#map');
    applyLang(); initForm(); initChrome(); initMap(); initReels();
  });
})();
