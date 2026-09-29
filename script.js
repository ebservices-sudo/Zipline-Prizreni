/* ==========================================================================
   Zipline Prizren — script.js
   1) CONFIG   : phone, prices, hours, map. Edit here.
   2) STRINGS  : ALL visible text, Albanian (sq, default) + English (en).
   3) REVIEWS  : real Google reviews (original language, not translated).
   4) Behaviour: language switch, images, booking form, reveal, menu.
   ========================================================================== */

/* ---------- 1) CONFIG ---------------------------------------------------- */
const CONFIG = {
  waNumber: '38348191176',          // WhatsApp (Kosovo) without "+"
  phoneKS: '+383 48 191 176',
  phoneDE: '+49 172 76 35 071',
  email: 'info@ziplineprizren.com', // TODO: domain did not resolve (NXDOMAIN) when checked — confirm this mailbox works
  instagram: 'https://www.instagram.com/ziplineprizren/',
  facebook: 'https://www.facebook.com/p/Zipline-Prizren-61576753757141/',
  priceAdult: 15,                   // € per adult per ride
  priceChild: 13,                   // € per child per ride
  // Opening hours (same every day). Used for the table, the time dropdown and JSON-LD.
  openHour: 13,
  closeHour: 19,
  slotMinutes: 30,                  // TODO: confirm real time slots + last ride time with the client
  lastSlot: '18:30',                // TODO: confirm
  // Location (from the Google Maps listing "Zipline Prizren")
  lat: 42.2075625,
  lng: 20.7476875,
  plusCode: '8GJ26P5X+23',
  mapsPlace: 'https://www.google.com/maps/place/Zipline+Prizren/@42.2075625,20.7476875,17z/data=!4m15!1m8!3m7!1s0x135395718dc05e7f:0xbc2a06866ae00e5c!2sZipline+Prizren!8m2!3d42.2075625!4d20.7476875!10e5!16s%2Fg%2F11xll4wk2b!3m5!1s0x135395718dc05e7f:0xbc2a06866ae00e5c!8m2!3d42.2075625!4d20.7476875!16s%2Fg%2F11xll4wk2b',
  // Google rating + number of reviews: NOT provided yet. Fill both to show the badge in the Reviews section.
  googleRating: null,               // e.g. 4.9
  googleReviewCount: null           // e.g. 120
};

/* ---------- 2) STRINGS --------------------------------------------------- */
const STRINGS = {
  sq: {
    meta_title: 'Zipline Prizren — Fluturo mbi Prizren nga Kalaja | 550 m, 15 €',
    meta_desc: 'Zipline dyfishe 550 m nga Kalaja e Prizrenit: dy linja krah për krah, pajisje sigurie, trajnim, foto dhe çaj me mjaltë. 15 € të rritur, 13 € fëmijë. Rezervo në WhatsApp.',
    skip: 'Kalo te përmbajtja',
    nav_experience: 'Përvoja', nav_prices: 'Çmimet', nav_place: 'Vendi', nav_safety: 'Siguria',
    nav_reviews: 'Vlerësimet', nav_visit: 'Orari', nav_faq: 'Pyetje', nav_book: 'Rezervo',
    menu_open: 'Hap menynë', menu_close: 'Mbyll menynë', nav_label: 'Navigimi kryesor', lang_label: 'Gjuha',

    hero_eyebrow: 'Kalaja e Prizrenit · 550 metra · dy linja',
    hero_title: 'Fluturo mbi Prizren',
    hero_sub: 'Dy linja krah për krah, 550 metra mbi luginë, me nisje nga Kalaja e Prizrenit. Qyteti i vjetër poshtë teje, era në fytyrë.',
    hero_cta: 'Rezervo në WhatsApp',
    hero_more: 'Si funksionon',
    hero_note: 'Çdo ditë 13:00–19:00 · Mbyllur kur ka erë, shi ose mjegull',
    alt_hero: 'Një fluturuese me krahë hapur në zipline mbi luginën e Prizrenit, nën qiell blu',
    alt_logo: 'Zipline Prizren — logo',

    f1_num: '550 m', f1_lbl: 'fluturim mbi luginë',
    f2_num: '2', f2_lbl: 'linja krah për krah',
    f3_num: '15 €', f3_lbl: 'i rritur · 13 € fëmijë',
    f4_num: '6+', f4_lbl: 'vjeç, nga 130 cm',
    f5_num: 'ERCA', f5_lbl: 'anëtar i shoqatës evropiane',

    exp_kicker: 'Përvoja',
    exp_title: 'Nga Kalaja te lugina, në katër hapa',
    step1_t: 'Mbërrin te Kalaja', step1_p: 'Ngjitu te Kalaja e Prizrenit. Pikënisja është aty, me pamje mbi qytetin e vjetër.',
    step2_t: 'Pajisu dhe mëso', step2_p: 'Helmetë, hark sigurie dhe trajnim i shkurtër praktik nga ekipi. Nuk të duhet përvojë.',
    step3_t: 'Fluturo mbi luginë', step3_p: '550 metra në dy linja paralele. Fluturon krah për krah me shokun, të dashurin apo të vogëlin.',
    step4_t: 'Foto dhe çaj me mjaltë', step4_p: 'Fotografi profesionale dhe një filxhan çaj me mjaltë në kafenenë me pamje panoramike.',
    alt_rider1: 'Pesë fluturues me helmeta dhe harkje sigurie në platformën e nisjes, me qytetin e Prizrenit pas tyre',

    price_kicker: 'Çmimet',
    price_title: 'Një çmim i thjeshtë. Gjithçka brenda.',
    price_adult: 'I rritur', price_child: 'Fëmijë',
    price_per: 'për person, për fluturim',
    price_incl_title: 'Çfarë përfshihet',
    price_incl: [
      'Helmetë dhe hark sigurie',
      'Trajnim praktik sigurie',
      'Fluturimi 550 m mbi luginë',
      'Fotografi profesionale',
      'Një filxhan çaj me mjaltë në kafenenë panoramike'
    ],
    price_btn: 'Rezervo këtë fluturim',
    price_note: 'Rezervimi rekomandohet. Shkruaj në WhatsApp dhe ekipi ta konfirmon orën.',

    place_kicker: 'Vendi',
    place_title: 'Prizreni shtrihet poshtë teje',
    place_p1: 'Nën Kalanë shtrihen çatitë e kuqe dhe minaret e qytetit të vjetër, lumi Lumbardh dhe Ura e Gurit. Përtej tyre, shpatet e gjelbra të Sharrit.',
    place_p2: 'Në perëndim të diellit, e gjithë lugina merr ngjyrën e portokallit. Është pamja që e bën fluturimin të paharrueshëm.',
    cap_fortress: 'Kalaja e Prizrenit', cap_view: 'Perëndimi mbi Sharr', cap_oldtown: 'Çatitë e kuqe dhe minaret',
    cap_cafe: 'Kafeneja panoramike', cap_bridge: 'Ura e Gurit', cap_riders: 'Gati për nisje',
    alt_fortress: 'Kalaja e Prizrenit mbi qytetin e vjetër',
    alt_view: 'Perëndim dielli portokalli mbi malet e Sharrit',
    alt_oldtown: 'Çatitë e kuqe dhe një minare e qytetit të vjetër të Prizrenit nga lart',
    alt_cafe: 'Kafeneja panoramike pranë pikënisjes së zipline-it',
    alt_bridge: 'Ura e Gurit mbi lumin Lumbardh në Prizren',
    alt_rider2: 'Detaj i harqeve të sigurisë, litarëve dhe karabinave të fluturuesve',
    story_kicker: 'Historia',
    story_text: 'Zipline Prizren u ngrit nga Valon Elshani, prizrenas që për vite me radhë jetoi dhe punoi në Gjermani. Sot ekipi i pret vizitorët te Kalaja, që ta shohin Prizrenin nga ajri.',

    safety_kicker: 'Siguria',
    safety_title: 'Siguria para çdo gjëje',
    safety_intro: 'Zipline Prizren është anëtar i European Ropes Course Association (ERCA). Çdo fluturues merr helmetë, hark sigurie dhe trajnim praktik para se të nisë. Ekipi është me ty në çdo hap.',
    alt_gear: 'Katër fluturues me helmeta dhe harkje sigurie bashkë me një anëtar të ekipit para murit prej druri',
    rules_title: 'Kush mund të fluturojë',
    rules: [
      ['Mosha', 'minimumi 6 vjeç'],
      ['Gjatësia', 'minimumi 130 cm'],
      ['Pesha', 'nga 40 deri në 100 kg'],
      ['Shëndeti', 'gjendje e mirë shëndetësore'],
      ['Alkooli', 'nuk fluturohet nën ndikim alkooli'],
      ['Veshja', 'këpucë të mbyllura, flokë të lidhur, pa sende të lirshme']
    ],
    rules_note: 'Ekipi i kontrollon pajisjet dhe rregullat me çdo fluturues para nisjes.',

    rev_kicker: 'Vlerësimet',
    rev_title: 'Çfarë thonë fluturuesit',
    rev_sub: 'Vlerësime të vërteta nga Google Maps, të paraqitura në gjuhën origjinale.',
    rev_source: 'Google',
    rev_more: 'Shiko të gjitha në Google Maps',
    rev_reviews_word: 'vlerësime',

    visit_kicker: 'Orari dhe vendndodhja',
    visit_title: 'Ku dhe kur',
    hours_title: 'Orari i punës',
    days: ['E hënë', 'E martë', 'E mërkurë', 'E enjte', 'E premte', 'E shtunë', 'E diel'],
    hours_note: 'Mbyllur kur ka erë, shi ose mjegull. Në ditë të pasigurta, na shkruaj në WhatsApp para se të nisesh.',
    hours_today: 'sot',
    loc_title: 'Vendndodhja',
    loc_address: 'Zipline Prizren, Kalaja, Prizren 20000, Kosovë',
    loc_pluscode: 'Kodi i vendit (Plus Code)',
    loc_foot_title: 'Në këmbë nga Shadërvani',
    // TODO: confirm exact route + time with the client
    loc_foot: 'Nga sheshi i Shadërvanit ngjitu drejt Kalasë së Prizrenit. Rruga është e pjerrët dhe merr rreth 15–20 minuta; vish këpucë të rehatshme.',
    loc_btn: 'Merr udhëzimet',
    loc_map_title: 'Harta e Zipline Prizren te Kalaja',

    book_kicker: 'Rezervimi',
    book_title: 'Rezervo fluturimin tënd',
    book_sub: 'Plotëso të dhënat dhe hapim WhatsApp me mesazhin gati. Ekipi ta konfirmon orën.',
    b_name: 'Emri', b_date: 'Data', b_time: 'Ora e preferuar', b_adults: 'Të rritur', b_children: 'Fëmijë',
    b_adults_hint: '15 € secili', b_children_hint: '13 € secili',
    b_total: 'Totali', b_btn: 'Dërgo në WhatsApp',
    b_more: 'Më shumë se një vend? Rezervo edhe për shokët, ne i konfirmojmë bashkë.',
    b_weather: 'Nëse moti është i keq (erë, shi, mjegull), do të të propozojmë një datë tjetër.',
    b_err_name: 'Shkruaj emrin tënd.', b_err_date: 'Zgjidh një datë.', b_err_people: 'Zgjidh të paktën një person.',
    b_plus: 'Shto', b_minus: 'Hiq',
    wa_hello: 'Përshëndetje! Dua të rezervoj një fluturim me Zipline Prizren.',
    wa_card_adult: 'Përshëndetje! Dua të rezervoj një fluturim për të rritur (15 €) me Zipline Prizren.',
    wa_card_child: 'Përshëndetje! Dua të rezervoj një fluturim për fëmijë (13 €) me Zipline Prizren.',
    wa_name: 'Emri', wa_date: 'Data', wa_time: 'Ora', wa_adults: 'Të rritur', wa_children: 'Fëmijë', wa_total: 'Totali',
    wa_thanks: 'Faleminderit!',
    wa_float: 'Rezervo në WhatsApp',

    faq_kicker: 'Pyetje të shpeshta',
    faq_title: 'Gjërat që pyeten më shpesh',
    faq: [
      ['Sa kushton dhe çfarë përfshihet?', '15 € për të rritur dhe 13 € për fëmijë, për person dhe për fluturim. Çmimi përfshin helmetën dhe harkun e sigurisë, trajnimin praktik, fluturimin 550 m, fotografitë profesionale dhe një filxhan çaj me mjaltë në kafenenë panoramike.'],
      ['Kush mund të fluturojë?', 'Duhet të jesh të paktën 6 vjeç dhe 130 cm i gjatë, me peshë nga 40 deri në 100 kg dhe në gjendje të mirë shëndetësore. Nuk fluturohet nën ndikim alkooli.'],
      ['Çfarë duhet të vesh?', 'Këpucë të mbyllura (atlete), rroba të rehatshme, flokët të lidhur dhe pa sende të lirshme që mund të bien gjatë fluturimit.'],
      ['Çfarë ndodh nëse moti është i keq?', 'Zipline-i mbyllet kur ka erë, shi ose mjegull, për sigurinë tënde. Nëse je në dyshim, na shkruaj në WhatsApp para se të nisesh dhe të themi a hapet.'],
      ['A duhet të rezervoj paraprakisht?', 'Rezervimi rekomandohet, sidomos për grupe dhe fundjava. Mjafton një mesazh në WhatsApp ose forma më sipër.'],
      ['Ku ndodhet dhe si mbërrij?', 'Te Kalaja e Prizrenit, mbi qytetin e vjetër. Nga sheshi i Shadërvanit ngjitesh në këmbë rreth 15–20 minuta. Përdor butonin “Merr udhëzimet” për hartën.'],
      ['Mund të sjell fëmijë?', 'Po, nga mosha 6 vjeç dhe të paktën 130 cm. Për fëmijë çmimi është 13 €.']
    ],

    foot_tag: 'Fluturo mbi Prizren.',
    foot_contact: 'Kontakti', foot_ks: 'Kosovë (edhe WhatsApp)', foot_de: 'Gjermani',
    foot_hours: 'Orari', foot_hours_v: 'Çdo ditë 13:00–19:00', foot_closed: 'Mbyllur kur ka erë, shi ose mjegull.',
    foot_follow: 'Na ndiq',
    foot_rights: 'Të gjitha të drejtat e rezervuara.',
    foot_demo: 'Faqe demo e përgatitur nga EB Services.'
  },

  en: {
    meta_title: 'Zipline Prizren — Fly over Prizren from the Fortress | 550 m, €15',
    meta_desc: '550 m double zipline from Prizren Fortress: two lines side by side, safety gear, training, photos and honey tea. €15 adults, €13 children. Book on WhatsApp.',
    skip: 'Skip to content',
    nav_experience: 'Experience', nav_prices: 'Prices', nav_place: 'The place', nav_safety: 'Safety',
    nav_reviews: 'Reviews', nav_visit: 'Hours', nav_faq: 'FAQ', nav_book: 'Book',
    menu_open: 'Open menu', menu_close: 'Close menu', nav_label: 'Main navigation', lang_label: 'Language',

    hero_eyebrow: 'Prizren Fortress · 550 metres · two lines',
    hero_title: 'Fly over Prizren',
    hero_sub: 'Two lines side by side, 550 metres across the valley, launching from Prizren Fortress. The old town below you, wind in your face.',
    hero_cta: 'Book on WhatsApp',
    hero_more: 'How it works',
    hero_note: 'Every day 1–7 PM · Closed in wind, rain or fog',
    alt_hero: 'A rider with arms spread wide on the zipline above the Prizren valley under a blue sky',
    alt_logo: 'Zipline Prizren logo',

    f1_num: '550 m', f1_lbl: 'flight across the valley',
    f2_num: '2', f2_lbl: 'lines side by side',
    f3_num: '€15', f3_lbl: 'adult · €13 child',
    f4_num: '6+', f4_lbl: 'years old, from 130 cm',
    f5_num: 'ERCA', f5_lbl: 'member of the European association',

    exp_kicker: 'The experience',
    exp_title: 'From the fortress to the valley in four steps',
    step1_t: 'Arrive at the Kalaja', step1_p: 'Walk up to Prizren Fortress. The launch point is right there, with the old town spread below.',
    step2_t: 'Gear up and learn', step2_p: 'Helmet, harness and a short hands-on safety training with the team. No experience needed.',
    step3_t: 'Fly over the valley', step3_p: '550 metres on two parallel lines. Fly side by side with a friend, partner or your little one.',
    step4_t: 'Photos and honey tea', step4_p: 'Professional photos and a cup of honey tea at the café with a panoramic view.',
    alt_rider1: 'Five riders in helmets and harnesses on the launch platform with Prizren behind them',

    price_kicker: 'Prices',
    price_title: 'One simple price. Everything included.',
    price_adult: 'Adult', price_child: 'Child',
    price_per: 'per person, per ride',
    price_incl_title: 'What’s included',
    price_incl: [
      'Helmet and harness',
      'Hands-on safety training',
      'The 550 m flight across the valley',
      'Professional photos',
      'A cup of honey tea at the panoramic café'
    ],
    price_btn: 'Book this ride',
    price_note: 'Booking is recommended. Message us on WhatsApp and the team will confirm your time.',

    place_kicker: 'The place',
    place_title: 'Prizren spreads out below you',
    place_p1: 'Beneath the fortress lie the red roofs and minarets of the old town, the Lumbardhi river and the Stone Bridge. Beyond them, the green slopes of the Sharr mountains.',
    place_p2: 'At sunset the whole valley turns orange. It is the view that makes the flight unforgettable.',
    cap_fortress: 'Prizren Fortress', cap_view: 'Sunset over the Sharr', cap_oldtown: 'Red roofs and minarets',
    cap_cafe: 'The panoramic café', cap_bridge: 'The Stone Bridge', cap_riders: 'Ready for launch',
    alt_fortress: 'Prizren Fortress above the old town',
    alt_view: 'Orange sunset over the Sharr mountains',
    alt_oldtown: 'Red roofs and a minaret of Prizren’s old town seen from above',
    alt_cafe: 'The panoramic café next to the zipline launch',
    alt_bridge: 'The Stone Bridge over the Lumbardhi river in Prizren',
    alt_rider2: 'Close-up of riders’ harnesses, ropes and carabiners',
    story_kicker: 'Our story',
    story_text: 'Zipline Prizren was built by Valon Elshani, a Prizren native who lived and worked in Germany for many years. Today the team welcomes visitors at the Kalaja to see Prizren from the air.',

    safety_kicker: 'Safety',
    safety_title: 'Safety comes first',
    safety_intro: 'Zipline Prizren is a member of the European Ropes Course Association (ERCA). Every rider gets a helmet, a harness and hands-on safety training before flying. The team is with you at every step.',
    alt_gear: 'Four riders in helmets and harnesses with a team member in front of a wooden wall',
    rules_title: 'Who can ride',
    rules: [
      ['Age', 'minimum 6 years'],
      ['Height', 'minimum 130 cm'],
      ['Weight', 'between 40 and 100 kg'],
      ['Health', 'good general health'],
      ['Alcohol', 'no riding under the influence'],
      ['Clothing', 'closed shoes, hair tied back, no loose items']
    ],
    rules_note: 'The team checks equipment and rules with every rider before launch.',

    rev_kicker: 'Reviews',
    rev_title: 'What riders say',
    rev_sub: 'Real reviews from Google Maps, shown in their original language.',
    rev_source: 'Google',
    rev_more: 'See all on Google Maps',
    rev_reviews_word: 'reviews',

    visit_kicker: 'Hours and location',
    visit_title: 'Where and when',
    hours_title: 'Opening hours',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    hours_note: 'Closed in wind, rain or fog. On uncertain days, message us on WhatsApp before you set off.',
    hours_today: 'today',
    loc_title: 'Location',
    loc_address: 'Zipline Prizren, Kalaja, Prizren 20000, Kosovo',
    loc_pluscode: 'Plus Code',
    loc_foot_title: 'On foot from Shadërvan',
    loc_foot: 'From Shadërvan square, walk up towards Prizren Fortress. The path is steep and takes about 15–20 minutes; wear comfortable shoes.',
    loc_btn: 'Get directions',
    loc_map_title: 'Map of Zipline Prizren at the Kalaja',

    book_kicker: 'Booking',
    book_title: 'Book your flight',
    book_sub: 'Fill in the details and we open WhatsApp with the message ready. The team confirms your time.',
    b_name: 'Name', b_date: 'Date', b_time: 'Preferred time', b_adults: 'Adults', b_children: 'Children',
    b_adults_hint: '€15 each', b_children_hint: '€13 each',
    b_total: 'Total', b_btn: 'Send on WhatsApp',
    b_more: 'More than one seat? Book for friends too and we confirm together.',
    b_weather: 'If the weather is bad (wind, rain, fog) we will offer you another date.',
    b_err_name: 'Please enter your name.', b_err_date: 'Please choose a date.', b_err_people: 'Please choose at least one person.',
    b_plus: 'Add', b_minus: 'Remove',
    wa_hello: 'Hello! I would like to book a ride with Zipline Prizren.',
    wa_card_adult: 'Hello! I would like to book an adult ride (€15) with Zipline Prizren.',
    wa_card_child: 'Hello! I would like to book a child ride (€13) with Zipline Prizren.',
    wa_name: 'Name', wa_date: 'Date', wa_time: 'Time', wa_adults: 'Adults', wa_children: 'Children', wa_total: 'Total',
    wa_thanks: 'Thank you!',
    wa_float: 'Book on WhatsApp',

    faq_kicker: 'FAQ',
    faq_title: 'Things people ask most',
    faq: [
      ['What does it cost and what is included?', '€15 for adults and €13 for children, per person and per ride. The price includes helmet and harness, hands-on safety training, the 550 m flight, professional photos and a cup of honey tea at the panoramic café.'],
      ['Who can ride?', 'You must be at least 6 years old and 130 cm tall, weigh between 40 and 100 kg and be in good health. No riding under the influence of alcohol.'],
      ['What should I wear?', 'Closed shoes (trainers), comfortable clothes, hair tied back and no loose items that could fall during the flight.'],
      ['What happens in bad weather?', 'The zipline closes in wind, rain or fog for your safety. If in doubt, message us on WhatsApp before you set off and we will tell you if we are open.'],
      ['Do I need to book in advance?', 'Booking is recommended, especially for groups and weekends. One WhatsApp message or the form above is enough.'],
      ['Where is it and how do I get there?', 'At Prizren Fortress (the Kalaja), above the old town. From Shadërvan square it is about a 15–20 minute walk uphill. Use the “Get directions” button for the map.'],
      ['Can I bring children?', 'Yes, from 6 years old and at least 130 cm. Children ride for €13.']
    ],

    foot_tag: 'Fly over Prizren.',
    foot_contact: 'Contact', foot_ks: 'Kosovo (also WhatsApp)', foot_de: 'Germany',
    foot_hours: 'Hours', foot_hours_v: 'Every day 1–7 PM', foot_closed: 'Closed in wind, rain or fog.',
    foot_follow: 'Follow us',
    foot_rights: 'All rights reserved.',
    foot_demo: 'Demo site prepared by EB Services.'
  }
};

/* ---------- 3) REVIEWS (real, from Google Maps; do not edit the wording) --
   `stars` is null because the star ratings were not included in the pasted
   reviews. Add a number 1–5 to any review and the stars appear automatically.
   `cut: true` = the text was truncated ("… More") in the source.            */
const REVIEWS = [
  { name: 'Kristi Peco',   stars: null, guide: true,
    text: 'So fun! A great experience in Prizren. The staff are very friendly, the views are amazing, and the overall experience is worth it. We had a wonderful time. Can’t wait to do it again when we visit again next year.' },
  { name: 'Elhame Dulaku', stars: null,
    text: 'Absolutely loved the zipline experience! It was so much fun and definitely an unforgettable experience. The staff were incredibly friendly, kind, and helpful, which made the whole experience even better. We felt comfortable and safe the entire time. Would 100% recommend it!' },
  { name: 'Sofía Ruiz',    stars: null, guide: true,
    text: 'This is a great way to spend time and have a great view of the city with a little bit of adrenaline. The team is super nice and professional!! Highly recommend!' },
  { name: 'Arbnor Muliqi', stars: null,
    text: 'Zipline Prizren was an amazing experience! The views were absolutely breathtaking, and the staff were super friendly and welcoming. Highly recommend it if you’re looking for a fun adventure with incredible scenery!' },
  { name: 'Besa Lala',     stars: null, cut: true,
    text: 'What an amazing experience! Zipline Prizren was one of the highlights of my trip. The views over the city were absolutely breathtaking, and the ride itself was so much fun. The staff was friendly, professional, and made me feel safe from' },
  { name: 'Sergen Akyüz',  stars: null,
    text: 'Amazing Experience. 10/10 recommendation!' }
];

/* ---------- 4) BEHAVIOUR ------------------------------------------------- */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  let lang = store.get('zp-lang');
  if (lang !== 'sq' && lang !== 'en') lang = 'sq';           // Albanian by default
  const t = (k) => (STRINGS[lang] && STRINGS[lang][k] !== undefined ? STRINGS[lang][k] : STRINGS.sq[k]);

  const waLink = (text) => 'https://wa.me/' + CONFIG.waNumber + '?text=' + encodeURIComponent(text);
  const pad = (n) => String(n).padStart(2, '0');
  const fmtHour = (h) => (lang === 'en' ? ((h % 12) || 12) + (h < 12 ? ' AM' : ' PM') : pad(h) + ':00');

  /* ----- images with placeholders (drop a file into /images and it appears) ----- */
  const imgRegistry = [];
  function buildImages() {
    $$('[data-img]').forEach((box) => {
      const file = box.getAttribute('data-img');
      const img = document.createElement('img');
      img.src = 'images/' + file;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.setAttribute('data-alt-key', box.getAttribute('data-alt'));
      img.addEventListener('error', () => {
        const ph = document.createElement('div');
        ph.className = 'placeholder';
        ph.setAttribute('role', 'img');
        ph.setAttribute('data-alt-key', box.getAttribute('data-alt'));
        ph.innerHTML = '<span>images/' + file + '</span>';
        img.replaceWith(ph);
        imgRegistry.push(ph);
        applyAlt();
      });
      box.prepend(img);
      imgRegistry.push(img);
    });
  }
  function applyAlt() {
    imgRegistry.forEach((el) => {
      const txt = t(el.getAttribute('data-alt-key'));
      if (el.tagName === 'IMG') el.alt = txt; else el.setAttribute('aria-label', txt);
    });
  }

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
    renderLists(); applyAlt(); updateLinks(); updateTotal(); populateTimes(true);
    $('#menuBtn').setAttribute('aria-label', t($('#nav').classList.contains('open') ? 'menu_close' : 'menu_open'));
  }

  /* ----- lists rendered from STRINGS ----- */
  function renderLists() {
    $('#includedList').innerHTML = t('price_incl').map((x) => '<li>' + x + '</li>').join('');
    $('#rulesList').innerHTML = t('rules').map((r) => '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>').join('');
    $('#faqList').innerHTML = t('faq').map((q, i) =>
      '<details' + (i === 0 ? ' open' : '') + '><summary>' + q[0] + '</summary><p>' + q[1] + '</p></details>').join('');
    // hours table (Mon–Sun); highlight today
    const todayIdx = (new Date().getDay() + 6) % 7;
    $('#hoursBody').innerHTML = t('days').map((d, i) =>
      '<tr' + (i === todayIdx ? ' class="today"' : '') + '><th scope="row">' + d +
      (i === todayIdx ? ' <em>' + t('hours_today') + '</em>' : '') + '</th><td>' +
      fmtHour(CONFIG.openHour) + ' – ' + fmtHour(CONFIG.closeHour) + '</td></tr>').join('');
  }
  function renderReviews() {
    const star = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z"/></svg>';
    $('#reviewsGrid').innerHTML = REVIEWS.map((r, i) => {
      const stars = r.stars ? '<div class="stars" role="img" aria-label="' + r.stars + '/5">' + star.repeat(r.stars) + '</div>' : '';
      return '<figure class="review reveal' + (i === 0 ? ' review--lead' : '') + '">' + stars +
        '<blockquote lang="en"><p>' + r.text + (r.cut ? '…' : '') + '</p></blockquote>' +
        '<figcaption><strong>' + r.name + '</strong><span>' + (r.guide ? 'Local Guide · ' : '') + 'Google</span></figcaption></figure>';
    }).join('');
    const badge = $('#ratingBadge');
    if (CONFIG.googleRating && CONFIG.googleReviewCount) {
      badge.hidden = false;
      badge.innerHTML = '<strong>' + CONFIG.googleRating + '</strong> / 5 · ' + CONFIG.googleReviewCount + ' <span data-i18n="rev_reviews_word">' + t('rev_reviews_word') + '</span> · Google';
    } else { badge.hidden = true; }   // hidden until real rating + count are filled in CONFIG
  }

  /* ----- links (WhatsApp, maps, contact) ----- */
  function updateLinks() {
    $$('[data-wa]').forEach((a) => {
      const k = a.getAttribute('data-wa');
      a.href = waLink(t(k === 'hello' ? 'wa_hello' : k === 'adult' ? 'wa_card_adult' : 'wa_card_child'));
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-dir]').forEach((a) => { a.href = 'https://www.google.com/maps/dir/?api=1&destination=' + CONFIG.lat + ',' + CONFIG.lng; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-maps]').forEach((a) => { a.href = CONFIG.mapsPlace; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-ig]').forEach((a) => { a.href = CONFIG.instagram; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-fb]').forEach((a) => { a.href = CONFIG.facebook; a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-tel-ks]').forEach((a) => { a.href = 'tel:' + CONFIG.phoneKS.replace(/\s/g, ''); a.textContent = CONFIG.phoneKS; });
    $$('[data-tel-de]').forEach((a) => { a.href = 'tel:' + CONFIG.phoneDE.replace(/\s/g, ''); a.textContent = CONFIG.phoneDE; });
    $$('[data-mail]').forEach((a) => { a.href = 'mailto:' + CONFIG.email; a.textContent = CONFIG.email; });
    $$('[data-pluscode]').forEach((el) => { el.textContent = CONFIG.plusCode; });
    const map = $('#mapFrame');
    if (map && !map.src) map.src = 'https://maps.google.com/maps?q=' + CONFIG.lat + ',' + CONFIG.lng + '&z=16&output=embed';
  }

  /* ----- booking form ----- */
  const form = $('#bookForm');
  function populateTimes(keep) {
    const sel = $('#bTime'); const prev = keep ? sel.value : '';
    let html = ''; const [lh, lm] = CONFIG.lastSlot.split(':').map(Number);
    for (let m = CONFIG.openHour * 60; m <= lh * 60 + lm; m += CONFIG.slotMinutes) {
      const v = pad(Math.floor(m / 60)) + ':' + pad(m % 60); html += '<option value="' + v + '">' + v + '</option>';
    }
    sel.innerHTML = html; if (prev) sel.value = prev;
  }
  function counts() { return { a: +$('#bAdults').value || 0, c: +$('#bChildren').value || 0 }; }
  function updateTotal() {
    const { a, c } = counts();
    $('#bTotal').textContent = (a * CONFIG.priceAdult + c * CONFIG.priceChild) + ' €';
  }
  function fmtDate(iso) { const p = iso.split('-'); return p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : iso; }
  function setErr(id, msg) { const e = $('#' + id + 'Err'); if (e) e.textContent = msg || ''; $('#' + id).setAttribute('aria-invalid', msg ? 'true' : 'false'); }

  function initForm() {
    const today = new Date(); const iso = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
    $('#bDate').min = iso;
    $$('.step-btn', form).forEach((b) => b.addEventListener('click', () => {
      const inp = $('#' + b.dataset.target); const v = (+inp.value || 0) + (+b.dataset.d);
      inp.value = Math.max(0, Math.min(30, v)); updateTotal();
    }));
    ['bAdults', 'bChildren'].forEach((id) => $('#' + id).addEventListener('input', updateTotal));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#bName').value.trim(); const date = $('#bDate').value; const { a, c } = counts();
      setErr('bName', name ? '' : t('b_err_name')); setErr('bDate', date ? '' : t('b_err_date'));
      const pe = $('#bPeopleErr'); pe.textContent = (a + c) > 0 ? '' : t('b_err_people');
      if (!name || !date || (a + c) < 1) { (!name ? $('#bName') : !date ? $('#bDate') : $('#bAdults')).focus(); return; }
      const lines = [t('wa_hello'), '',
        t('wa_name') + ': ' + name, t('wa_date') + ': ' + fmtDate(date), t('wa_time') + ': ' + $('#bTime').value];
      if (a) lines.push(t('wa_adults') + ': ' + a + ' × ' + CONFIG.priceAdult + ' €');
      if (c) lines.push(t('wa_children') + ': ' + c + ' × ' + CONFIG.priceChild + ' €');
      lines.push(t('wa_total') + ': ' + (a * CONFIG.priceAdult + c * CONFIG.priceChild) + ' €', '', t('wa_thanks'));
      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* ----- header, menu, reveal ----- */
  function initChrome() {
    const header = $('#header'); const menuBtn = $('#menuBtn'); const nav = $('#nav');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 220);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', t(open ? 'menu_close' : 'menu_open'));
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); menuBtn.setAttribute('aria-label', t('menu_open')); }));
    $$('.lang-btn').forEach((b) => b.addEventListener('click', () => { lang = b.dataset.lang; store.set('zp-lang', lang); applyLang(); }));
    $('#year').textContent = new Date().getFullYear();

    const els = $$('.reveal');
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      els.forEach((el) => io.observe(el));
    } else { els.forEach((el) => el.classList.add('in')); }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // reviews are rendered before initChrome() so their .reveal elements get observed too
    buildImages(); renderReviews(); initForm(); initChrome(); applyLang();
  });
})();

