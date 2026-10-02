/* ==========================================================================
   Zipline Prizren — script.js
   1) CONFIG   : phone, location, links. Edit here.
   2) PLACES   : landmarks on the map (position in map units + drawing + photo).
   3) STRINGS  : ALL visible text, Albanian (sq, default) + English (en).
   4) Behaviour: language, links, contact form, map (hero + full screen), menu.
   ========================================================================== */

/* ---------- 1) CONFIG ---------------------------------------------------- */
const CONFIG = {
  waNumber: '38348100095',          // WhatsApp for questions, without "+"
  phone: '+383 48 100 095',
  instagram: 'https://www.instagram.com/ziplineprizren/',
  facebook: 'https://www.facebook.com/p/Zipline-Prizren-61576753757141/',
  // Where Google Maps sends people: the "Zipline Prizren" pin on Google Maps (zipline start, by the Kalaja).
  lat: 42.2075625,
  lng: 20.7476875
};

/* ---------- 2) PLACES ----------------------------------------------------
   x/y = map units (1 unit = 1.5 m, see tools/build-map.py), h = height of the
   drawing above that point. `icon` = drawing id in index.html, `vb` = its box
   for the small icon in the list.                                             */
const PLACES = [
  { id: 'start',       x: 861.4,  y: 695.4,  h: 42,   icon: 's-pin',       vb: '-16 -42 32 44' },
  { id: 'kalaja',      x: 730,    y: 580,    h: 92,   icon: 's-castle',    vb: '-62 -68 126 72' },
  { id: 'landing',     x: 872.6,  y: 411.2,  h: 8,    icon: null },
  { id: 'ura',         x: 452,    y: 556,    h: 44,   icon: 's-bridge',    vb: '-54 -42 108 56' },
  { id: 'shadervan',   x: 454,    y: 592,    h: 18,   icon: 's-fountain',  vb: '-12 -18 24 20' },
  { id: 'sinan',       x: 510,    y: 596,    h: 68,   icon: 's-mosque',    vb: '-24 -68 48 70' },
  { id: 'hamam',       x: 507,    y: 451,    h: 28,   icon: 's-hamam',     vb: '-28 -30 56 32' },
  { id: 'lidhja',      x: 630,    y: 410,    h: 44,   icon: 's-house',     vb: '-27 -44 54 46' },
  { id: 'premte',      x: 200,    y: 402,    h: 56,   icon: 's-church',    vb: '-25 -56 50 58' },
  { id: 'rrapi',       x: 716,    y: 338,    h: 30,   icon: 's-tree',      vb: '-20 -30 40 32' }
];

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

/* Small line icons for the rules (24×24, stroked). */
const RULE_ICONS = {
  weight: '<path d="M9.5 8a2.5 2.5 0 1 1 5 0"/><path d="M5.5 21l1.8-11.5h9.4L18.5 21z"/><path d="M10 15h4"/>',
  health: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M7.5 12h2.5l1.2-2 1.6 4 1.2-2h2.5"/>',
  alcohol: '<path d="M10 3h4M10.5 3v4.5L9 10v10h6V10l-1.5-2.5V3"/><path d="M4 4l16 16"/>',
  shoes: '<path d="M3 17v-5l4-1 2-3 3 3 5 1.5c2 .6 4 1.6 4 3.5v1z"/><path d="M3 17v2h18v-2M9 11l1 1.5M11.5 10l1 1.5"/>',
  items: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2M4 4l16 16"/>',
  helmet: '<path d="M4 16a8 8 0 0 1 16 0v1H4z"/><path d="M12 8v4M8.5 9.5 10 12M15.5 9.5 14 12M3 17h18"/>',
  hands: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.5 0-4-1.2-5.5-3.5L3.8 15a1.4 1.4 0 0 1 2.3-1.6L8 15.5"/>',
  landing: '<path d="M4 20h16M12 4v11M7.5 10.5 12 15l4.5-4.5"/>',
  weather: '<path d="M7 16h9a4 4 0 0 0 .5-8A5.5 5.5 0 0 0 6 8.5 3.8 3.8 0 0 0 7 16z"/><path d="M4 20h8M14 20h5"/>'
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
    hero_sub: 'Fluturo mbi luginën e Lumbardhit me nisje nga Kalaja e Prizrenit. Qyteti i vjetër poshtë teje, era në fytyrë.',
    hero_cta_map: 'Shiko hartën',
    hero_cta_wa: 'Pyetje? Na shkruaj',
    hero_note: 'Çdo ditë 13:00–19:00 · Mbyllur kur ka erë, shi ose mjegull',
    hero_erca: 'Anëtar i ERCA · Ndërtuar sipas EN 15567-1',

    map_title: 'Harta e Zipline Prizren: nga Shadërvani te Kalaja dhe te pikënisja e zipline-it, me Urën e Gurit, Xhaminë e Sinan Pashës dhe lumin Lumbardh.',
    map_open: 'Hap hartën e plotë',
    map_open_chip: 'Kliko për hartën e plotë',
    legend_zip: 'Zipline',
    legend_walk: 'Shtegu nga Shadërvani',
    map_walk: '15–20 min në këmbë',
    map_zip: 'Zipline',
    area_oldtown: 'Qyteti i vjetër',
    area_gorge: 'Gryka e Lumbardhit ↘',
    pl_kalaja_s: 'Kalaja', pl_ura_s: 'Ura e Gurit', pl_shadervan_s: 'Shadërvani', pl_sinan_s: 'Xhamia e Sinan Pashës',
    pl_hamam_s: 'Hamami', pl_lidhja_s: 'Lidhja e Prizrenit', pl_premte_s: 'Kisha e Shën Premtes', pl_rrapi_s: 'Rrapi shekullor',
    pl_landing_s: 'Ulja', pl_start_s: 'Pikënisja',
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
    alt_ph_a: 'Fluturues në kabllo mbi luginë, me Kalanë e Prizrenit në kodër pas tij',
    alt_ph_b: 'Tri shoqe në pufat e Zipline Prizren, me perëndimin e diellit mbi Prizren',
    alt_ph_c: 'Fluturuese e qeshur në kabllo, mbi shpatin me bar',
    alt_ph_d: 'Fluturues me krahë hapur sapo niset nga platforma, me qytetin poshtë',
    alt_ph_e: 'Fluturuese e gëzuar në platformën e nisjes',

    // TODO: placeholder rules written by EB Services. Replace with the client's official rules.
    rules_kicker: 'Rregullat',
    rules_title: 'Para se të fluturosh',
    rules_intro: 'Rregulla të thjeshta që e mbajnë çdo fluturim të sigurt. Ekipi i kalon me secilin fluturues para nisjes.',
    rules: [
      ['weight', 'Pesha', 'Minimumi 40 kg, maksimumi 100 kg.'],
      ['health', 'Shëndeti', 'Nuk lejohet gjatë shtatzënisë, me probleme zemre, shpine ose qafe, apo pas një operacioni të fundit.'],
      ['alcohol', 'Pa alkool', 'Nuk fluturohet nën ndikimin e alkoolit, drogave ose ilaçeve që ndikojnë te ti.'],
      ['shoes', 'Veshja', 'Këpucë të mbyllura dhe flokë të lidhur. Pa sandale, shalle apo rroba të lirshme që varen.'],
      ['items', 'Sendet personale', 'Telefoni, syzet dhe çelësat lihen te ekipi ose në xhep me zinxhir. Fotot t’i bën ekipi.'],
      ['helmet', 'Helmeta dhe harku', 'Mbahen gjatë gjithë kohës dhe kontrollohen nga ekipi para çdo nisjeje.'],
      ['hands', 'Gjatë fluturimit', 'Duart te rripat, asnjëherë te kablloja apo rrotulla. Mos provo të frenosh vetë.'],
      ['landing', 'Ulja', 'Këmbët përpara dhe prit sinjalin e ekipit para se të zgjidhesh.'],
      ['weather', 'Moti', 'Linja mbyllet kur ka erë të fortë, shi, mjegull ose stuhi. Në ditë të pasigurta, na shkruaj para se të nisesh.']
    ],
    rules_note: 'Ekipi mund ta refuzojë një fluturim nëse këto rregulla nuk plotësohen. Udhëzimet e ekipit kanë gjithmonë përparësi.',

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
    foot_hours: 'Orari', foot_hours_v: 'Çdo ditë 13:00–19:00', foot_closed: 'Mbyllur kur ka erë, shi ose mjegull.',
    foot_find: 'Na gjej', foot_map: 'Harta e plotë', foot_route: 'Rruga në Google Maps',
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
    hero_sub: 'Fly across the Lumbardhi valley from Prizren Fortress. The old town below you, wind in your face.',
    hero_cta_map: 'See the map',
    hero_cta_wa: 'Questions? Message us',
    hero_note: 'Every day 1–7 PM · Closed in wind, rain or fog',
    hero_erca: 'ERCA member · Built to EN 15567-1',

    map_title: 'Map of Zipline Prizren: from Shadërvan up to the fortress and the zipline start, with the Stone Bridge, Sinan Pasha Mosque and the Lumbardhi river.',
    map_open: 'Open the full map',
    map_open_chip: 'Click for the full map',
    legend_zip: 'Zipline',
    legend_walk: 'Footpath from Shadërvan',
    map_walk: '15–20 min walk',
    map_zip: 'Zipline',
    area_oldtown: 'Old town',
    area_gorge: 'Lumbardhi Gorge ↘',
    pl_kalaja_s: 'Fortress', pl_ura_s: 'Stone Bridge', pl_shadervan_s: 'Shadërvan', pl_sinan_s: 'Sinan Pasha Mosque',
    pl_hamam_s: 'Hammam', pl_lidhja_s: 'League of Prizren', pl_premte_s: 'Our Lady of Ljeviš', pl_rrapi_s: 'Old plane tree',
    pl_landing_s: 'Landing', pl_start_s: 'Start point',
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
    alt_ph_a: 'A rider on the cable above the valley, with Prizren Fortress on the hill behind',
    alt_ph_b: 'Three friends on Zipline Prizren beanbags, with the sunset over Prizren',
    alt_ph_c: 'A smiling rider on the cable above the grassy slope',
    alt_ph_d: 'A rider with arms spread just leaving the platform, the city below',
    alt_ph_e: 'An excited rider on the launch platform',

    rules_kicker: 'Rules',
    rules_title: 'Before you fly',
    rules_intro: 'Simple rules that keep every flight safe. The team goes through them with every rider before launch.',
    rules: [
      ['weight', 'Weight', 'Minimum 40 kg, maximum 100 kg.'],
      ['health', 'Health', 'Not allowed during pregnancy, with heart, back or neck problems, or after recent surgery.'],
      ['alcohol', 'No alcohol', 'No riding under the influence of alcohol, drugs or medication that affects you.'],
      ['shoes', 'Clothing', 'Closed shoes and hair tied back. No sandals, scarves or loose, hanging clothes.'],
      ['items', 'Personal items', 'Leave phones, glasses and keys with the team or in a zipped pocket. The team takes your photos.'],
      ['helmet', 'Helmet and harness', 'Worn the whole time and checked by the team before every launch.'],
      ['hands', 'During the ride', 'Hands on the straps, never on the cable or the trolley. Do not try to brake yourself.'],
      ['landing', 'Landing', 'Legs forward, and wait for the team’s signal before you unclip.'],
      ['weather', 'Weather', 'The line closes in strong wind, rain, fog or storms. On uncertain days, message us before you set off.']
    ],
    rules_note: 'The team may refuse a ride if these rules are not met. The team’s instructions always come first.',

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
    foot_hours: 'Hours', foot_hours_v: 'Every day 1–7 PM', foot_closed: 'Closed in wind, rain or fog.',
    foot_find: 'Find us', foot_map: 'Full map', foot_route: 'Route in Google Maps',
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
      '</svg></span><div><h3>' + r[1] + '</h3><p>' + r[2] + '</p></div></li>').join('');
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

  /* ----- links (WhatsApp, maps, social) ----- */
  function updateLinks() {
    $$('[data-wa]').forEach((a) => {
      const k = a.getAttribute('data-wa');
      a.href = waLink(k === 'hello' ? t('wa_hello') : '');
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-dir]').forEach((a) => { a.href = dirLink(); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-ig]').forEach((a) => { a.href = CONFIG.instagram; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-fb]').forEach((a) => { a.href = CONFIG.facebook; a.target = '_blank'; a.rel = 'noopener'; });
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
    const credit = ph.by
      ? '<figcaption><a href="https://commons.wikimedia.org/wiki/File:' + ph.file + '" target="_blank" rel="noopener">' + esc(t('photo_by')) + ': ' + esc(ph.by) +
        '</a> · <a href="https://creativecommons.org/licenses/' + ph.lic.replace('CC ', '').replace(/ (\d\.\d)$/, '/$1').toLowerCase() + '/" target="_blank" rel="noopener">' +
        esc(ph.lic) + '</a>, ' + esc(t('photo_cropped')) + '</figcaption>'
      : '';
    return '<figure class="pop__img"><img src="' + ph.src + '" alt="' + esc(alt) + '" width="720" height="480">' + credit + '</figure>';
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
      openMap({ noIntro: true }); goTo(lm.dataset.place);
      return true;
    };
  }

  function initMap() {
    map.svg = $('#map');
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

    const els = $$('.reveal:not(.in)');
    if ('IntersectionObserver' in window && !reduced) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      els.forEach((el) => io.observe(el));
    } else { els.forEach((el) => el.classList.add('in')); }
  }

  document.addEventListener('DOMContentLoaded', () => {
    map.svg = $('#map');
    applyLang(); initForm(); initChrome(); initMap();
  });
})();
