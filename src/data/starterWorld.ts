import { TerrainType, WorldProject } from '../types/world';

const GRID_COLS = 36;
const GRID_ROWS = 22;

function createStarterTerrainGrid(): TerrainType[] {
  const grid: TerrainType[] = new Array(GRID_COLS * GRID_ROWS).fill('sea');

  const setCell = (col: number, row: number, terrain: TerrainType) => {
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      grid[row * GRID_COLS + col] = terrain;
    }
  };

  // Paint a natural medieval fantasy continent ("Benua Aethelia")
  for (let r = 2; r <= 19; r++) {
    for (let c = 4; c <= 31; c++) {
      // Normalized distance from two continental centers
      const dWest = Math.hypot((c - 13) / 9.5, (r - 10.5) / 6.8);
      const dEast = Math.hypot((c - 23.5) / 7.5, (r - 11.5) / 6.2);
      const dNorthIsle = Math.hypot((c - 19) / 4.5, (r - 4.2) / 2.2);

      // Dragon's Bay indentation in the south-west
      const dBay = Math.hypot((c - 15) / 3.2, (r - 13.5) / 2.6);

      if ((dWest < 1.0 || dEast < 1.0 || dNorthIsle < 1.0) && dBay > 0.85) {
        setCell(c, r, 'plains');
      } else if (dWest < 1.15 || dEast < 1.15 || dNorthIsle < 1.18) {
        setCell(c, r, 'shallows');
      }
    }
  }

  // Northern Tundra & Wyvern Peaks
  for (let c = 11; c <= 24; c++) {
    setCell(c, 3, 'tundra');
    setCell(c, 4, 'tundra');
  }
  const mountainCoords = [
    [12, 5], [13, 5], [14, 5], [15, 5], [16, 5], [17, 5], [18, 6], [19, 6], [20, 6],
    [25, 9], [26, 10], [26, 11], [27, 12], [26, 13], [25, 14],
    [10, 8], [11, 9], [11, 10],
  ];
  for (const [c, r] of mountainCoords) {
    setCell(c, r, 'mountain');
  }

  // Shadowwood & Sylvan Forests
  const forestCoords = [
    [19, 7], [20, 7], [21, 7], [22, 7], [23, 8],
    [18, 8], [19, 8], [20, 8], [21, 8], [22, 8],
    [19, 9], [20, 9], [21, 9], [22, 9],
    [8, 10], [9, 10], [9, 11], [10, 11],
    [21, 15], [22, 15], [23, 15], [22, 16],
  ];
  for (const [c, r] of forestCoords) {
    setCell(c, r, 'forest');
  }

  // Southern Sunfire Desert & Ashen Marshes
  const desertCoords = [
    [23, 12], [24, 12], [24, 13], [23, 13], [24, 14], [25, 13],
  ];
  for (const [c, r] of desertCoords) {
    setCell(c, r, 'desert');
  }

  const swampCoords = [
    [16, 11], [17, 11], [17, 12], [18, 12],
  ];
  for (const [c, r] of swampCoords) {
    setCell(c, r, 'swamp');
  }

  return grid;
}

export const STARTER_WORLD_PROJECT: WorldProject = {
  id: 'world-aethelia-01',
  worldName: 'Kronik Benua Aethelia',
  tagline: 'Ketika Astrolabe Surya Retak dan Tujuh Menara Sihir Memperebutkan Takhta Abu',
  genre: 'High Fantasy · Arcanepunk · Politik Kerajaan',
  calendarSystem: 'Penanggalan Surya pasca-Konvergensi (AE - Era Astral)',
  authorName: 'Arsiparis Agung',
  heroBannerUrl: '/src/assets/images/parchment_cartography_banner_1794157187078.jpg',
  epigraphQuote:
    'Ketika cincin ketiga Astrolabe berhenti berputar, bayang-bayang pohon perak akan menelan mahkota emas, dan laut barat akan kembali menagih kota yang tenggelam.',
  epigraphSource: 'Gulungan Nubuat Pohon Memori Eldath, Bait IV (Tahun 12 AE)',
  centralConflict: `Tiga tahun menjelang terulangnya siklus [[Konvergensi Gerhana Merah]], retakan halus ditemukan pada inti [[Astrolabe Api Surya]]. [[Archmage Vaelen Thorne]] dan [[Ordo Cakrawala Perak]] berusaha mencegah penggunaan artefak tersebut karena dapat meruntuhkan lempeng benua, sementara [[Empress Seraphina Valorian]] dari [[Kekaisaran Gondoria]] bertekad menggunakannya sebagai senjata suar demi menundukkan [[Kerajaan Bawah Tanah Nidavellir]] dan menyatukan Aethelia secara paksa.`,
  storyThemes:
    'Harga dari Pengetahuan Terlarang · Persatuan Paksa vs Kebebasan Otonom · Warisan Ekologis Sihir Kuno',
  cosmologyCreationMyth: `Menurut kronik [[Sylvan Aelfir]] dan [[Dvergr Besi-Bintang]], Benua Aethelia terbentuk dari jatuhnya Bintang Purba yang terbelah menjadi tiga unsur: Inti Besi yang mengendap menjadi pegunungan [[Kerajaan Bawah Tanah Nidavellir]], Debu Cahaya yang melahirkan akar [[Rimba Bayang-Bayang (Shadowwood)]], serta Api Cakrawala yang terus berputar di langit sebagai matahari dan bulan kembar.`,
  cosmologyLaws: `Seluruh energi magis di dunia ini tunduk pada hukum [[Resonansi Eteris Astral]]: sihir hanya dapat dipanen dari pantulan cahaya benda langit (Matahari, Bulan Kembar, atau Gugus Bintang) dan tidak dapat dirapal di ruang tertutup tanpa medium kristal. Penggunaan melebihi kapasitas jiwa akan memicu kutukan *Kristalisasi Organ* yang mengubah tubuh praktisi menjadi kuningan dan kaca hidup.`,
  scratchpadNotes: [
    {
      id: 'note-1',
      text: 'Klan Penyelundup Kabut di Pelabuhan Teluk Naga yang memperdagangkan Bunga Lentera Malam palsu kepada bangsawan Gondoria.',
      targetCategory: 'faction',
      createdAt: 'Hari ini',
    },
    {
      id: 'note-2',
      text: 'Teknik terlarang Jalur Gerhana: memadukan resonansi matahari dan bulan secara bersamaan dengan risiko kebutaan permanen.',
      targetCategory: 'skill',
      createdAt: 'Hari ini',
    },
  ],
  entities: [
    // 1. CHARACTERS
    {
      id: 'char-vaelen',
      category: 'character',
      title: 'Archmage Vaelen Thorne',
      subtitle: 'Penjaga Segel Ketujuh dari Menara Nidavellir',
      summary: 'Cendekiawan tua penguasa Resonansi Astral yang menemukan retakan waktu pada [[Astrolabe Api Surya]].',
      imageUrl: '/src/assets/images/avatar_archmage_vaelen_1794157187885.jpg',
      tags: ['Protagonis', 'Penyihir Astral', 'Ordo Cakrawala'],
      attributes: {
        role: 'Protagonis',
        raceName: 'Aethel-Born (Manusia Tinggi)',
        factionName: 'Ordo Cakrawala Perak',
        originNation: 'Kekaisaran Gondoria',
        age: '68 Tahun',
        status: 'Diasingkan',
        powerTier: 'Lingkar ke-6 (Sovereign Scholar)',
        knownSkills: ['Tenunan Gravitasi Bintang'],
        ownedArtifacts: ['Astrolabe Api Surya', 'Bunga Lentera Malam'],
        signatureQuote:
          'Bintang-bintang tidak pernah berdusta, Seraphina; hanya raja-raja fana yang memalsukan peta langit demi membenarkan perang mereka.',
        voiceStyle:
          'Tenang, terukur, sering menggunakan metafora astronomi dan jam mekanis kuno saat berdebat.',
        appearance:
          'Berjanggut perak rapi, mengenakan jubah beludru biru malam berbordir rasi bintang. Mata kirinya telah mengkristal menjadi kuningan bercahaya akibat kutukan Over-Resonansi.',
        motivationGoal:
          'Memperbaiki retakan cincin ketiga Astrolabe Api Surya tanpa mengorbankan nyawa penduduk Teluk Naga maupun kedaulatan bangsa Sylvan Aelfir.',
        fatalFlaw:
          'Rasa bersalah mendalam atas kegagalan masa mudanya membuat Vaelen cenderung memikul beban sendiri dan menyembunyikan rahasia fatal dari muridnya.',
        arcStart:
          'Cendekiawan penyendiri yang bersembunyi di Puncak Wyvern dan berusaha menghindari konflik politik secara pasif.',
        arcCrisis:
          'Ketika kristal di mata kirinya mulai menjalar ke jantungnya saat legiun Gondoria mengepung Rimba Shadowwood.',
        arcEndgame:
          'Menerima bahwa pengetahuan harus diwariskan kepada generasi baru dan rela mengorbankan kapasitas sihirnya demi menyegel kembali patahan benua.',
      },
      content: `Archmage Vaelen Thorne adalah mantan Penasihat Agung di istana [[Kekaisaran Gondoria]] yang diasingkan setelah menolak menyerahkan [[Astrolabe Api Surya]] kepada [[Empress Seraphina Valorian]] untuk dijadikan senjata perang.

Di masa mudanya, Vaelen memimpin ekspedisi menembus [[Rimba Bayang-Bayang (Shadowwood)]] bersama bangsa [[Sylvan Aelfir]] untuk menyegel kebocoran eter pasca peristiwa [[Konvergensi Gerhana Merah]]. Akibat penggunaan berlebih dari sistem [[Resonansi Eteris Astral]], mata kirinya perlahan berubah menjadi kristal kuningan hidup yang mampu melihat jejak sejarah masa lalu di suatu tempat.

Saat ini ia bersembunyi di observatorium tua di lereng [[Puncak Wyvern]], melatih murid terakhirnya sembari mencari cara menghentikan kembalinya [[Kerajaan Bawah Tanah Nidavellir]] ke dalam perang terbuka.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'char-seraphina',
      category: 'character',
      title: 'Empress Seraphina Valorian',
      subtitle: 'Maharani Mahkota Surya & Panglima Legiun Cinnabar',
      summary: 'Penguasa bertangan besi dari [[Kekaisaran Gondoria]] yang berambisi menyatukan seluruh benua sebelum bencana gerhana berikutnya.',
      imageUrl: '/src/assets/images/avatar_empress_seraphina_1794157189411.jpg',
      tags: ['Penguasa', 'Antagonis Kompleks', 'Keluarga Valorian'],
      attributes: {
        role: 'Antagonis',
        raceName: 'Aethel-Born (Darah Surya)',
        factionName: 'Legiun Surya Cinnabar',
        originNation: 'Kekaisaran Gondoria',
        age: '39 Tahun',
        status: 'Hidup',
        powerTier: 'Lingkar ke-6 (Solar Valkyrie)',
        knownSkills: ['Keputusan Tombak Surya'],
        ownedArtifacts: ['Astrolabe Api Surya'],
        signatureQuote:
          'Sejarah tidak akan menghakimi siapa yang sopan saat langit runtuh; sejarah hanya mencatat siapa yang sanggup menjaga perisai tetap tegak.',
        voiceStyle:
          'Tegas, lugas seperti dekrit militer, jarang meninggikan suara namun setiap kalimatnya mengandung otoritas mutlak.',
        appearance:
          'Perawakan tinggi tegap dalam balutan zirah seremonial emas-cinnabar dan jubah beludru merah mahkota. Lengan kanannya memiliki bekas luka bakar surya yang disembunyikan di balik sarung tangan baja.',
        motivationGoal:
          'Menyatukan seluruh kerajaan di Benua Aethelia di bawah satu komando militer sebelum Konvergensi Gerhana Merah berikutnya tiba.',
        fatalFlaw:
          'Obsesi terhadap kendali mutlak dan ketidakmampuan mempercayai aliansi setara karena trauma pengkhianatan yang menewaskan ayahnya.',
        arcStart:
          'Penguasa rasional namun otoriter yang menganggap diplomasi sudah gagal dan hanya kekuatan senjata surya yang dapat menyelamatkan dunia.',
        arcCrisis:
          'Menyadari bahwa penyalaan paksa Menara Suar Ibu Kota justru mempercepat kehancuran Teluk Naga yang ingin ia lindungi.',
        arcEndgame:
          'Terpaksa memilih antara mempertahankan takhta kekaisaran atau bekerja sama dengan mantan gurunya, Archmage Vaelen Thorne.',
      },
      content: `Empress Seraphina Valorian naik takhta setelah ayahnya gugur dalam pemberontakan di perbatasan [[Kerajaan Bawah Tanah Nidavellir]]. Berbeda dengan para bangsawan korup yang mendahuluinya, Seraphina meyakini bahwa satu-satunya cara menyelamatkan Benua Aethelia dari kehancuran astral adalah menyatukan seluruh bangsa di bawah satu komando militer mutlak.

Meskipun berselisih tajam dengan mantan gurunya, [[Archmage Vaelen Thorne]], Seraphina diam-diam mendanai riset pertahanan batas dunia. Ia memegang pedang pusaka warisan era [[Konvergensi Gerhana Merah]] dan berencana merebut [[Astrolabe Api Surya]] demi menyalakan kembali Menara Suar Ibu Kota.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'char-kaelen',
      category: 'character',
      title: 'Kaelen dari Kabut Perak',
      subtitle: 'Penjaga Perbatasan Shadowwood & Utusan Pohon Memori',
      summary: 'Pengintai muda bangsa [[Sylvan Aelfir]] yang menjadi penghubung rahasia antara [[Ordo Cakrawala Perak]] dan penjaga hutan.',
      tags: ['Deuteragonis', 'Sylvan Aelfir', 'Pemanah Eter'],
      attributes: {
        role: 'Deuteragonis',
        raceName: 'Sylvan Aelfir',
        factionName: 'Ordo Cakrawala Perak',
        originNation: 'Rimba Bayang-Bayang (Shadowwood)',
        age: '114 Tahun (Setara pemuda 22 tahun)',
        status: 'Hidup',
        powerTier: 'Lingkar ke-4 (Lunar Ranger)',
        knownSkills: ['Tenunan Gravitasi Bintang'],
        ownedArtifacts: ['Bunga Lentera Malam'],
        signatureQuote:
          'Kalian manusia membangun menara batu untuk menyentuh bintang, padahal akar pohon kami sudah mendengar bisikan langit sejak zaman pertama.',
        voiceStyle:
          'Sarkastik namun puitis, bicara dengan nada rendah seperti berbisik di tengah hutan berkabut.',
        appearance:
          'Rambut perak sebahu dengan iris mata berwarna ambar menyala. Mengenakan mantel kamuflase serat daun Lumin-Oak dan busur kayu besi perak.',
        motivationGoal:
          'Melindungi lembah terakhir Bunga Lentera Malam dari penjarahan penyelundup dan ekspansi legiun Gondoria.',
        fatalFlaw:
          'Prasangka mendalam terhadap bangsa manusia di luar Ordo Cakrawala Perak akibat terbakarnya hutan selatan.',
        arcStart:
          'Penjaga perbatasan yang xenofobik dan hanya mau berurusan dengan Vaelen karena utang nyawa.',
        arcCrisis:
          'Harus memimpin pengungsi manusia dan Aelfir bersama-sama melewati terowongan kuno Dvergr.',
        arcEndgame:
          'Menjadi duta perdamaian pertama antara Rimba Shadowwood dan persemakmuran kota-kota manusia.',
      },
      content: `Kaelen adalah pengintai tercepat di perbatasan [[Rimba Bayang-Bayang (Shadowwood)]]. Ketika patroli [[Kekaisaran Gondoria]] mulai merambah lembah tempat tumbuhnya [[Bunga Lentera Malam]], Kaelen diutus menembus badai salju menuju [[Puncak Wyvern]] untuk memperingatkan [[Archmage Vaelen Thorne]].`,
      updatedAt: '2026-11-08',
    },

    // 2. RACES
    {
      id: 'race-aelfir',
      category: 'race',
      title: 'Sylvan Aelfir',
      subtitle: 'Penjaga Kanopi Abadi & Penenun Memori Pohon',
      summary: 'Ras berumur panjang penghuni [[Rimba Bayang-Bayang (Shadowwood)]] yang menyimpan sejarah dunia melalui getah pohon kristal.',
      tags: ['Ras Kuno', 'Penjaga Hutan', 'Sensitif Eter'],
      attributes: {
        raceOriginClass: 'Sylvan / Fae',
        lifespan: '450 - 700 Tahun',
        traits: 'Iris mata berwarna ambar bercahaya, telinga meruncing halus, pendengaran frekuensi eter, langkah tanpa suara di atas dedaunan.',
        homeland: 'Rimba Bayang-Bayang (Shadowwood)',
        innateAbilities:
          'Mampu mendengar resonansi memori dari akar pohon Lumin-Oak, bernavigasi menembus kabut ilusi tanpa kompas, serta afinitas alami terhadap Jalur Lunar dan Sidereal.',
        racialWeakness:
          'Sangat rentan terhadap polusi abu besi dan panas radiasi Jalur Solar murni; terputus dari tanah hutan terlalu lama membuat regenerasi eter mereka melambat separuhnya.',
        languageAndNaming:
          'Bahasa: *Sylva-Lir* (aksara lengkung menyerupai sulur daun). Pola Nama: Nama pendek beraliran vokal lembut diikuti gelar alam tempat lahir (contoh: *Kaelen dari Kabut Perak*, *Liora Akar-Bintang*, *Veylan Embun-Senja*).',
        cultureAndTraditions:
          'Dipimpin oleh Majelis Penenun Memori. Ketika seorang Aelfir wafat, kenangan terpentingnya disematkan ke dalam getah kristal Pohon Memori Eldath. Menebang pohon hidup tanpa ritual izin dianggap kejahatan tertinggi.',
        interRaceRelations:
          'Bersekutu secara hati-hati dengan [[Ordo Cakrawala Perak]], curiga terhadap ekspansi militer [[Kekaisaran Gondoria]], dan berdagang herbal langka dengan [[Dvergr Besi-Bintang]].',
        subRaces: [
          'Aelfir Kanopi Perak (Penjaga Pohon Memori)',
          'Aelfir Kabut Malam (Pengintai Perbatasan)',
          'Aelfir Rawa Abu (Klan Terbuang Selatan)',
        ],
        signatureSkills: ['Tenunan Gravitasi Bintang'],
      },
      content: `Bangsa Sylvan Aelfir tidak menulis buku sejarah di atas kertas; mereka mengukir ingatan langsung ke dalam serat pohon *Lumin-Oak* di jantung [[Rimba Bayang-Bayang (Shadowwood)]].

Sejak meletusnya [[Konvergensi Gerhana Merah]], populasi mereka menurun drastis karena hutan bagian selatan berubah menjadi rawa abu. Kini mereka menjalin pakta pertahanan rapuh dengan [[Ordo Cakrawala Perak]] yang dipimpin oleh [[Archmage Vaelen Thorne]], namun sangat mencurigai ekspansi militer [[Kekaisaran Gondoria]].`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'race-dvergr',
      category: 'race',
      title: 'Dvergr Besi-Bintang',
      subtitle: 'Arsitek Mekanika Bawah Tanah & Penempa Meteorit',
      summary: 'Bangsa kriya logam penghuni [[Kerajaan Bawah Tanah Nidavellir]] yang memadukan roda gigi kuningan dengan inti energi bintang.',
      tags: ['Penempa Pusaka', 'Insinyur', 'Nidavellir'],
      attributes: {
        raceOriginClass: 'Subterranean / Kriya',
        lifespan: '250 - 320 Tahun',
        traits: 'Postur kekar berotot dengan kepadatan tulang dua kali manusia, janggut dikepang cincin perunggu, mata beradaptasi dengan pendaran termal.',
        homeland: 'Kerajaan Bawah Tanah Nidavellir',
        innateAbilities:
          'Tahan terhadap suhu tungku ekstrem dan tekanan bawah tanah, memiliki kepekaan magnetik terhadap bijih meteorit serta keahlian mengukir segel mekanis penampung cahaya.',
        racialWeakness:
          'Tidak dapat merapal sihir secara langsung dari tubuh tanpa medium alat atau senjata tempaan; rentan mengalami disorientasi vertigo di ruang terbuka yang terlalu luas.',
        languageAndNaming:
          'Bahasa: *Khaz-Runa* (aksara geometris bersudut tegas yang dipahat di logam). Pola Nama: Nama satu-dua suku kata keras diikuti nama klan tempaan (contoh: *Thrain Ironstar*, *Borin Brassgear*, *runa Vahl-Forge*).',
        cultureAndTraditions:
          'Status sosial ditentukan oleh mahakarya (*Masterwork*) yang pernah ditempa. Sumpah kontrak diukir di atas keping ingot perak dan tidak boleh dilanggar hingga tujuh turunan.',
        interRaceRelations:
          'Menuntut pengembalian [[Astrolabe Api Surya]] dari [[Kekaisaran Gondoria]], namun tetap menghormati para cendekiawan [[Ordo Cakrawala Perak]].',
        subRaces: [
          'Dvergr Kubah Besi (Klan Penempa Inti)',
          'Dvergr Cermin Surya (Insinyur Optik & Astrolabe)',
          'Dvergr Pengelana Permukaan (Pedagang Karavan)',
        ],
        signatureSkills: ['Keputusan Tombak Surya'],
      },
      content: `Para Dvergr Besi-Bintang percaya bahwa gunung-gunung di timur Aethelia adalah pecahan meteor raksasa yang jatuh pada awal penciptaan dunia. Mereka adalah pencipta asli dari [[Astrolabe Api Surya]] sebelum artefak tersebut diserahkan sebagai tanda perdamaian kepada [[Kekaisaran Gondoria]] tiga abad silam.

Para tetua Dvergr menuntut pengembalian artefak tersebut karena tungku utama di [[Kerajaan Bawah Tanah Nidavellir]] mulai mendingin.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'race-aethelborn',
      category: 'race',
      title: 'Aethel-Born (Manusia Tinggi)',
      subtitle: 'Pewaris Takhta Pesisir & Penjelajah Cakrawala',
      summary: 'Bangsa manusia adaptif yang mendominasi [[Kekaisaran Gondoria]] serta pelabuhan-pelabuhan besar di tepi Teluk Naga.',
      tags: ['Manusia', 'Gondoria', 'Adaptif'],
      attributes: {
        raceOriginClass: 'Manusia / Aethel-Born',
        lifespan: '75 - 110 Tahun (Hingga 140 tahun bagi praktisi Lingkar ke-6)',
        traits: 'Perawakan bervariasi, daya adaptasi meridian jiwa sangat fleksibel terhadap ketiga jalur Resonansi Astral.',
        homeland: 'Kekaisaran Gondoria',
        innateAbilities:
          'Fleksibilitas meridian eter yang memungkinkan mereka mempelajari Jalur Solar, Lunar, maupun Sidereal lebih cepat dibanding ras berumur panjang.',
        racialWeakness:
          'Kapasitas fisik tubuh yang lebih rapuh membuat mereka paling cepat terserang kutukan *Kristalisasi Organ* bila memaksakan merapal teknik Lingkar ke-6.',
        languageAndNaming:
          'Bahasa: *Aethelian Klasik* (turunan bahasa kekaisaran kuno). Pola Nama: Nama diri bernuansa Latin/Klasik diikuti nama wangsa atau tempat asal (contoh: *Seraphina Valorian*, *Vaelen Thorne*, *Cassian dari Solis*).',
        cultureAndTraditions:
          'Sangat menghargai warisan sejarah, pencatatan kartografi, dan ketertiban hukum. Masyarakatnya terbagi antara kaum bangsawan militer Solis Prime dan serikat cendekiawan merdeka.',
        interRaceRelations:
          'Mendominasi perdagangan maritim, namun ambisi penyatuan paksa dari takhta Gondoria memicu gesekan dengan bangsa [[Sylvan Aelfir]] dan [[Dvergr Besi-Bintang]].',
        subRaces: [
          'Aethel-Born Darah Surya (Bangsawan Gondoria)',
          'Aethel-Born Pesisir Teluk Naga (Pelaut & Saudagar)',
          'Aethel-Born Utara (Penjaga Perbatasan Puncak Wyvern)',
        ],
        signatureSkills: ['Keputusan Tombak Surya', 'Tenunan Gravitasi Bintang'],
      },
      content: `Meskipun memiliki rentang usia paling singkat di antara penghuni Benua Aethelia, bangsa **Aethel-Born** dikenal karena ambisi intelektual dan militer mereka yang tak pernah padam. Baik [[Archmage Vaelen Thorne]] maupun [[Empress Seraphina Valorian]] berasal dari ras ini, mewakili dua sisi ekstrem dari watak manusia Aethelia: kebijaksanaan penjaga ilmu vs ambisi penakluk.`,
      updatedAt: '2026-11-08',
    },

    // 3. FACTIONS / GROUPS
    {
      id: 'fac-ordo-cakrawala',
      category: 'faction',
      title: 'Ordo Cakrawala Perak',
      subtitle: 'Persaudaraan Kartografer Astral & Penjaga Relik',
      summary: 'Kelompok cendekiawan independen yang memetakan anomali ruang-waktu dan menjaga keseimbangan [[Resonansi Eteris Astral]].',
      tags: ['Majelis Sihir', 'Netral', 'Kartografer'],
      attributes: {
        factionType: 'Majelis Sihir / Akademi',
        influenceScale: 'Lintas Benua',
        leader: 'Archmage Vaelen Thorne',
        headquarters: 'Puncak Wyvern',
        emblemSymbol: 'Kompas Perak Berjarum Tujuh di atas Beludru Biru Malam · Semboyan: "Mengukur Langit, Menjaga Bumi"',
        rankHierarchy: [
          '1. Akolit Lentera (Murid & Pencatat Peta)',
          '2. Kartografer Eter (Penjelajah Lapangan)',
          '3. Pengamat Cincin (Ahli Segel & Astronomi)',
          '4. Magister Rasi (Dewan Menara)',
          '5. Penjaga Segel Ketujuh (Arsiparis Agung)',
        ],
        recruitmentOath:
          'Calon anggota wajib melewati ujian navigasi buta melintasi kabut [[Rimba Bayang-Bayang (Shadowwood)]] hanya dengan panduan frekuensi bintang, lalu mengucapkan Sumpah Perak untuk tidak pernah menyerahkan peta patahan benua kepada penguasa militer.',
        ideology:
          'Pengetahuan astronomi dan relik era [[Konvergensi Gerhana Merah]] adalah milik seluruh penghuni Aethelia dan tidak boleh dimonopoli oleh satu mahkota kerajaan.',
        secretAgenda:
          'Diam-diam menyembunyikan cincin inti [[Astrolabe Api Surya]] di balik segel ruang bawah tanah [[Puncak Wyvern]] sembari menyiapkan ritual darurat seandainya lempeng Teluk Naga kembali runtuh.',
        resourcesAndAssets:
          'Perpustakaan Peta Bintang Terlengkap di Aethelia, jaringan menara suar optik di pegunungan utara, serta pasokan rutin [[Bunga Lentera Malam]] hasil pakta dengan [[Sylvan Aelfir]].',
        factionArtifacts: ['Astrolabe Api Surya', 'Bunga Lentera Malam'],
        alliedFactions:
          'Menjalin pakta pertahanan dan pertukaran herbal dengan bangsa [[Sylvan Aelfir]] di [[Rimba Bayang-Bayang (Shadowwood)]], serta membeli instrumen optik dari [[Serikat Kriya Besi-Bintang]].',
        rivalFactions:
          'Diburu oleh [[Legiun Surya Cinnabar]] atas perintah [[Empress Seraphina Valorian]] karena menolak menyerahkan [[Astrolabe Api Surya]] ke Solis Prime.',
      },
      content: `Didirikan lima puluh tahun setelah [[Konvergensi Gerhana Merah]], Ordo Cakrawala Perak bertugas mengawasi titik-titik retakan dimensi di seluruh Benua Aethelia.

Setiap anggota ordo membawa kompas kuningan khusus yang bergetar saat terjadi penyalahgunaan [[Resonansi Eteris Astral]] tingkat tinggi. Sejak [[Empress Seraphina Valorian]] membekukan hak otonomi mereka di ibu kota, sebagian besar anggota Ordo mundur ke [[Puncak Wyvern]].`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'fac-legiun-cinnabar',
      category: 'faction',
      title: 'Legiun Surya Cinnabar',
      subtitle: 'Garda Ksatria Mahkota & Armada Penakluk Gondoria',
      summary: 'Ordo militer elit di bawah komando langsung [[Empress Seraphina Valorian]] yang bersenjatakan tombak surya dan zirah baja merah.',
      tags: ['Ordo Ksatria', 'Militer Gondoria', 'Jalur Solar'],
      attributes: {
        factionType: 'Ordo Ksatria / Militer',
        influenceScale: 'Regional / Kerajaan',
        leader: 'Empress Seraphina Valorian',
        headquarters: 'Kekaisaran Gondoria',
        emblemSymbol: 'Matahari Cinnabar Bersayap Tombak Kembar di atas Panji Merah-Emas · Semboyan: "Satu Matahari, Satu Perisai"',
        rankHierarchy: [
          '1. Tombak Perunggu (Prajurit Infanteri Surya)',
          '2. Ksatria Lentera Merah (Kavaleri Berlapis Baja)',
          '3. Kapten Menara Suar (Komandan Benteng Perbatasan)',
          '4. Marsekal Cinnabar (Dewan Perang Solis Prime)',
          '5. Panglima Mahkota Surya (Empress Seraphina Valorian)',
        ],
        recruitmentOath:
          'Hanya menerima prajurit dan praktisi Jalur Solar yang lulus ujian ketahanan panas di Gurun Surya Selatan dan bersumpah setia di hadapan Takhta Abu Solis Prime.',
        ideology:
          'Persatuan militer mutlak di bawah [[Kekaisaran Gondoria]] adalah satu-satunya perisai yang sanggup menyelamatkan dunia dari kehancuran [[Konvergensi Gerhana Merah]] berikutnya.',
        secretAgenda:
          'Merancang ekspedisi penyergapan ke [[Puncak Wyvern]] untuk merebut paksa [[Astrolabe Api Surya]] dan mengaktifkan meriam suar kuno di sepanjang perbatasan [[Kerajaan Bawah Tanah Nidavellir]].',
        resourcesAndAssets:
          'Tiga belas batalion kavaleri zirah surya, armada kapal perang berlapis perunggu di Pelabuhan Teluk Naga, serta pajak penuh dari kas negara [[Kekaisaran Gondoria]].',
        factionArtifacts: ['Astrolabe Api Surya'],
        alliedFactions:
          'Didukung penuh oleh Senat Bangsawan [[Kekaisaran Gondoria]] dan Kultus Surya Abadi di Solis Prime.',
        rivalFactions:
          'Berseberangan langsung dengan [[Ordo Cakrawala Perak]] pimpinan [[Archmage Vaelen Thorne]], serta terlibat blokade dagang melawan [[Serikat Kriya Besi-Bintang]] dari [[Kerajaan Bawah Tanah Nidavellir]].',
      },
      content: `**Legiun Surya Cinnabar** merupakan tulang punggung kekuatan militer [[Kekaisaran Gondoria]]. Direformasi secara langsung oleh [[Empress Seraphina Valorian]], ordo ksatria ini memadukan disiplin taktis formasi tombak dengan penyaluran [[Resonansi Eteris Astral]] Jalur Solar.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'fac-serikat-besibintang',
      category: 'faction',
      title: 'Serikat Kriya Besi-Bintang',
      subtitle: 'Konsorsium Penempa Pusaka & Karavan Dagang Bawah Tanah',
      summary: 'Gilda dagang dan insinyur mekanika dari [[Kerajaan Bawah Tanah Nidavellir]] yang memonopoli perdagangan logam meteorit serta instrumen optik astral.',
      tags: ['Gilda Dagang', 'Penempa', 'Nidavellir'],
      attributes: {
        factionType: 'Gilda Dagang / Kriya',
        influenceScale: 'Lintas Benua',
        leader: 'High Artificer Thrain Ironstar',
        headquarters: 'Kerajaan Bawah Tanah Nidavellir',
        emblemSymbol: 'Roda Gigi Kuningan Mengelilingi Palu Meteorit Perak · Semboyan: "Tak Ada Mahkota Tanpa Besi Kami"',
        rankHierarchy: [
          '1. Penempa Magang (Pengolah Bijih & Bara)',
          '2. Juru Roda Gigi (Teknisi Lentera & Karavan)',
          '3. Empu Cermin (Pembuat Lensa & Kompas Astral)',
          '4. Saudagar Kubah (Pengawas Jalur Dagang Benua)',
          '5. Dewan Tujuh Palu (Pucuk Pimpinan Serikat)',
        ],
        recruitmentOath:
          'Setiap anggota wajib menempa satu keping segel perunggu dengan tanda sidik jari dan darahnya sendiri; membocorkan rahasia campuran baja meteorit kepada pihak luar dihukum dengan pengasingan seumur hidup.',
        ideology:
          'Kemajuan peradaban ditentukan oleh ketepatan mesin dan kemurnian logam, bukan oleh takhayul bangsawan permukaan.',
        secretAgenda:
          'Menggunakan jaringan karavan dagang mereka di permukaan untuk menyelundupkan cetak biru senjata kuno dan mempersiapkan penarikan paksa [[Astrolabe Api Surya]] kembali ke tungku utama [[Kerajaan Bawah Tanah Nidavellir]].',
        resourcesAndAssets:
          'Monopoli tambang bijih bintang jatuh, terowongan kereta uap bawah tanah, serta armada karavan lapis baja yang melintasi Jalan Raya Kekaisaran Timur.',
        factionArtifacts: ['Astrolabe Api Surya'],
        alliedFactions:
          'Menyuplai instrumen astronomi kepada [[Ordo Cakrawala Perak]] dan berdagang getah kristal dengan [[Sylvan Aelfir]].',
        rivalFactions:
          'Mengeluarkan ultimatum embargo baja terhadap [[Kekaisaran Gondoria]] dan [[Legiun Surya Cinnabar]] akibat sengketa kepemilikan [[Astrolabe Api Surya]].',
      },
      content: `Tidak ada satu pun menara observatorium maupun gerbang benteng di Benua Aethelia yang berdiri tanpa campur tangan **Serikat Kriya Besi-Bintang**. Berpusat di [[Kerajaan Bawah Tanah Nidavellir]], gilda milik bangsa [[Dvergr Besi-Bintang]] ini memegang kendali penuh atas suplai logam penghantar eter.`,
      updatedAt: '2026-11-08',
    },

    // 4. NATIONS
    {
      id: 'nat-gondoria',
      category: 'nation',
      title: 'Kekaisaran Gondoria',
      subtitle: 'Mahkota Surya di Tepi Teluk Naga',
      summary: 'Negara maritim dan militer terkuat di barat Aethelia yang diperintah oleh [[Empress Seraphina Valorian]].',
      tags: ['Kekaisaran', 'Kekuatan Militer', 'Teluk Naga'],
      attributes: {
        government: 'Monarki Konstitusional Militer',
        capitalCity: 'Solis Prime',
        ruler: 'Empress Seraphina Valorian',
        stateReligion: 'Kultus Surya Abadi',
        currency: 'Dinar Surya Emas & Keping Kuningan',
      },
      content: `Kekaisaran Gondoria menguasai dataran subur di pesisir barat serta jalur pelayaran strategis di Teluk Naga (*Dragon's Bay*). Kekuatan ekonomi mereka bertumpu pada armada dagang dan legiun kavaleri berlapis baja surya.

Dalam dekade terakhir, Gondoria memperluas benteng perbatasannya hingga mendekati [[Rimba Bayang-Bayang (Shadowwood)]] dan jalur pegunungan menuju [[Kerajaan Bawah Tanah Nidavellir]], memicu ketegangan diplomatik di seluruh benua.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'nat-nidavellir',
      category: 'nation',
      title: 'Kerajaan Bawah Tanah Nidavellir',
      subtitle: 'Persemakmuran Tujuh Kubah Besi',
      summary: 'Negara benteng pegunungan di tenggara yang dikuasai serikat penempa [[Dvergr Besi-Bintang]].',
      tags: ['Negara Industri', 'Benteng Gunung', 'Dvergr'],
      attributes: {
        government: 'Dewan Serikat Penempa (oligarki teknik)',
        capitalCity: 'Kubah Kazad-Vahl',
        ruler: 'High Artificer Thrain Ironstar',
        stateReligion: 'Penghormatan Inti Bumi & Bintang',
        currency: 'Ingot Perak Bertanda Segel',
      },
      content: `Terletak di balik barisan pegunungan tenggara, [[Kerajaan Bawah Tanah Nidavellir]] adalah pusat teknologi metalurgi dan mekanika astral. Kota-kota mereka dibangun di dalam kawah gunung berapi tidak aktif yang diterangi oleh cermin surya raksasa.

Hubungan mereka dengan [[Kekaisaran Gondoria]] memburuk sejak sengketa kepemilikan [[Astrolabe Api Surya]].`,
      updatedAt: '2026-11-08',
    },

    // 5. REGIONS
    {
      id: 'reg-shadowwood',
      category: 'region',
      title: 'Rimba Bayang-Bayang (Shadowwood)',
      subtitle: 'Hutan Kanopi Perak di Timur Laut Aethelia',
      summary: 'Wilayah hutan purba berkabut tempat pohon-pohon raksasa menyerap cahaya bintang dan menjadi tanah suci [[Sylvan Aelfir]].',
      tags: ['Bioma Hutan', 'Zona Anomali', 'Aelfir'],
      attributes: {
        parentNation: 'Wilayah Otonom Sylvan Aelfir',
        climate: 'Lembap, berkabut abadi dengan pendaran bioluminesensi di malam hari',
        landmarks: 'Pohon Memori Eldath, Reruntuhan Kuil Bulan',
        resources: 'Getah Kristal Eter, Kayu Besi Perak, Tanaman [[Bunga Lentera Malam]]',
        dangerLevel: 'Tinggi (Kabut Ilusi & Penjaga Hutan)',
      },
      content: `Rimba Bayang-Bayang membentang luas di bagian timur laut benua. Kompas biasa tidak berfungsi di dalam wilayah ini karena rapatnya kandungan eter di akar pepohonan. Hanya kartografer dari [[Ordo Cakrawala Perak]] atau pemandu asli [[Sylvan Aelfir]] yang dapat melintasi jalurnya dengan selamat.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'reg-wyvern-peaks',
      category: 'region',
      title: 'Puncak Wyvern',
      subtitle: 'Pegunungan Utara Tempat Bersarangnya Naga Angin',
      summary: 'Barisan pegunungan bersalju di utara tempat berdirinya observatorium pengasingan [[Archmage Vaelen Thorne]].',
      tags: ['Pegunungan', 'Utara', 'Observatorium'],
      attributes: {
        parentNation: 'Zona Bebas Perbatasan Utara',
        climate: 'Dingin ekstrem, badai angin astral musiman',
        landmarks: 'Observatorium Cakrawala, Jembatan Rantai Langit',
        resources: 'Bijih Bintang Jatuh, Kristal Es Abadi',
        dangerLevel: 'Sangat Tinggi (Wyvern Puncak & Badai Eter)',
      },
      content: `Puncak Wyvern merupakan atap dunia Aethelia. Karena langitnya yang sangat jernih dan dekat dengan arus bintang, [[Ordo Cakrawala Perak]] membangun benteng observatorium mereka di tebing tertingginya.`,
      updatedAt: '2026-11-08',
    },

    // 6. HISTORY
    {
      id: 'hist-gerhana-merah',
      category: 'history',
      title: 'Konvergensi Gerhana Merah',
      subtitle: 'Tragedi Runtuhnya Menara Sihir Kuno (Tahun 1 AE)',
      summary: 'Peristiwa bersejarah ketika dua bulan Aethelia sejajar dengan matahari, membelah daratan Teluk Naga dan melahirkan sistem penanggalan baru.',
      tags: ['Bencana Besar', 'Era Pertama', 'Asal-Usul Sihir'],
      attributes: {
        era: 'Awal Era Astral (AE)',
        year: 1,
        belligerents: 'Dinasti Kuno Aethelia vs Arus Eter Liar',
        outcome: 'Tenggelamnya ibu kota lama menjadi Teluk Naga dan diciptakannya [[Astrolabe Api Surya]].',
      },
      content: `Empat ratus tahun yang lalu, para penyihir kuno mencoba menarik energi matahari secara paksa saat terjadi gerhana ganda. Eksperimen tersebut gagal dan memicu ledakan gelombang eter yang menenggelamkan lembah barat menjadi perairan Teluk Naga.

Untuk menstabilkan iklim dan arus sihir dunia yang kacau, para leluhur [[Dvergr Besi-Bintang]] dan pendahulu [[Kekaisaran Gondoria]] bekerja sama menempa [[Astrolabe Api Surya]]. Catatan [[Archmage Vaelen Thorne]] menunjukkan bahwa siklus gerhana serupa akan terulang dalam waktu kurang dari tiga tahun.`,
      updatedAt: '2026-11-08',
    },

    // 7. POWER SYSTEM
    {
      id: 'pwr-resonansi-astral',
      category: 'power_system',
      title: 'Resonansi Eteris Astral',
      subtitle: 'Hukum Penyelarasan Bintang, Segel Geometris, dan Harga Kristalisasi',
      summary: 'Sistem kekuatan utama di Aethelia yang mengubah cahaya benda langit menjadi manipulasi gravitasi, panas surya, dan memori ruang.',
      tags: ['Sistem Sihir Utama', 'Hard Magic', 'Hukum Mutlak'],
      attributes: {
        energySource: 'Cahaya Matahari (Jalur Solar), Bulan (Jalur Lunar), dan Gugus Bintang (Jalur Sidereal)',
        hardRules: '1. Tidak bisa menciptakan materi dari ketiadaan. 2. Kekuatan melemah 60% di ruang bawah tanah tertutup tanpa medium kristal penyimpan.',
        tierHierarchy: 'Lingkar 1 (Inisiat) → Lingkar 3 (Adept) → Lingkar 5 (Magister) → Lingkar 6 (Sovereign) → Lingkar 7 (Mitos)',
        corruptionCost: 'Over-Resonansi menyebabkan Kristalisasi Organ: jaringan tubuh pengguna perlahan berubah menjadi kaca/kuningan kaku jika melewati batas kapasitas jiwa.',
      },
      content: `**Resonansi Eteris Astral** bekerja dengan menyelaraskan detak jantung dan meridian pengguna terhadap frekuensi benda langit melalui diagram geometris (*Astrolabe Sigil*).

### Tiga Hukum Besi (Hard Magic Rules)
1. **Hukum Konservasi Cahaya**: Seorang praktisi tidak dapat merapal teknik di tempat yang terisolasi dari langit kecuali menggunakan lentera baterai kristal yang sudah diisi sebelumnya.
2. **Batas Lingkar Jiwa**: Setiap naik satu Lingkar membutuhkan pemahaman filosofis dan ukiran segel baru. Saat ini tidak ada manusia hidup yang berhasil mencapai Lingkar ke-7.
3. **Kutukan Kristalisasi**: Setiap penggunaan skill tingkat tinggi meninggalkan residu mineral bintang di dalam darah. Inilah alasan mengapa mata kiri [[Archmage Vaelen Thorne]] telah membatu menjadi kuningan kristal.`,
      updatedAt: '2026-11-08',
    },

    // 8. SKILLS
    {
      id: 'skl-tenunan-gravitasi',
      category: 'skill',
      title: 'Tenunan Gravitasi Bintang',
      subtitle: 'Teknik Lingkar ke-6 Jalur Sidereal',
      summary: 'Memampatkan medan gravitasi lokal untuk membelokkan serangan proyektil atau menghentikan pergerakan pasukan lawan.',
      tags: ['Jalur Sidereal', 'Pertahanan & Kontrol', 'Lingkar 6'],
      attributes: {
        parentPowerSystem: 'Resonansi Eteris Astral',
        skillRank: 'Lingkar ke-6 (Sovereign Art)',
        elementAffinity: 'Gravitasi & Ruang Sidereal',
        activationCost: 'Membutuhkan medium kompas/astrolabe logam dan 40% cadangan eter pengguna',
        cooldownOrLimit: 'Maksimal dipertahankan selama 90 detik sebelum memicu pendarahan retina.',
      },
      content: `Teknik khas milik [[Archmage Vaelen Thorne]]. Dengan memutar cincin astrolabe secara berlawanan arah jarum jam, pengguna menciptakan titik berat semu di udara dalam radius tiga puluh meter. Anak panah, tombak, hingga semburan api akan melengkung tertarik ke titik pusat tersebut sebelum sempat menyentuh target.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'skl-tombak-surya',
      category: 'skill',
      title: 'Keputusan Tombak Surya',
      subtitle: 'Teknik Militer Tertinggi Keluarga Valorian',
      summary: 'Memfokuskan panas matahari siang hari ke ujung senjata menjadi berkas cahaya penembus benteng.',
      tags: ['Jalur Solar', 'Serangan Murni', 'Valorian'],
      attributes: {
        parentPowerSystem: 'Resonansi Eteris Astral',
        skillRank: 'Lingkar ke-6 (Imperial Secret)',
        elementAffinity: 'Api Surya & Cahaya Murni',
        activationCost: 'Hanya bisa digunakan pada siang hari atau dengan mengorbankan satu inti rubi surya',
        cooldownOrLimit: 'Menyebabkan luka bakar termal pada lengan pengguna jika digunakan lebih dari dua kali sehari.',
      },
      content: `Keahlian warisan tahta [[Kekaisaran Gondoria]] yang dikuasai secara sempurna oleh [[Empress Seraphina Valorian]]. Berdasarkan aturan [[Resonansi Eteris Astral]], teknik ini kehilangan separuh dayanya pada malam hari kecuali disokong oleh artefak sekelas [[Astrolabe Api Surya]].`,
      updatedAt: '2026-11-08',
    },

    // 9. ENCYCLOPEDIA (Artifacts, Flora, Fauna)
    {
      id: 'enc-astrolabe-surya',
      category: 'encyclopedia',
      title: 'Astrolabe Api Surya',
      subtitle: 'Relik Penyeimbang Iklim & Kunci Menara Suar Aethelia',
      summary: 'Instrumen astronomi kuno dari kuningan dan rubi cinnabar yang mampu menyimpan energi matahari murni selama berabad-abad.',
      imageUrl: '/src/assets/images/artifact_sunfire_astrolabe_1794157188936.jpg',
      tags: ['Artefak Mitos', 'Pemicu Konflik Utama', 'Kriya Dvergr'],
      attributes: {
        subCategory: 'Artefak & Pusaka',
        rarity: 'Satu-satunya di Dunia (Unique Relic)',
        habitatOrOrigin: 'Ditempa di [[Kerajaan Bawah Tanah Nidavellir]] pada Tahun 2 AE',
        magicalProperties: 'Menghapus batasan malam hari pada [[Resonansi Eteris Astral]] dan menstabilkan garis patahan lempeng benua.',
      },
      content: `Astrolabe Api Surya adalah mahakarya gabungan antara penempa [[Dvergr Besi-Bintang]] dan penyihir perdana [[Kekaisaran Gondoria]]. Artefak ini terdiri dari tiga cincin kuningan berukir konstelasi kuno yang mengitari inti rubi surya.

Dua tahun lalu, [[Archmage Vaelen Thorne]] menemukan retakan halus pada cincin terdalamnya. Jika Astrolabe ini dipaksa menembakkan meriam suar militer seperti yang direncanakan [[Empress Seraphina Valorian]], cincin tersebut akan hancur dan memicu gelombang kedua [[Konvergensi Gerhana Merah]].`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'enc-bunga-lentera',
      category: 'encyclopedia',
      title: 'Bunga Lentera Malam',
      subtitle: 'Flora Bioluminesensi Penawar Kristalisasi Eter',
      summary: 'Tanaman langka yang hanya tumbuh di akar pohon purba [[Rimba Bayang-Bayang (Shadowwood)]] dan mampu memperlambat efek kutukan sihir.',
      tags: ['Flora Langka', 'Herbal Alkimia', 'Shadowwood'],
      attributes: {
        subCategory: 'Flora & Herbal',
        rarity: 'Sangat Langka (Dijaga ketat oleh Sylvan Aelfir)',
        habitatOrOrigin: 'Lembah terdalam [[Rimba Bayang-Bayang (Shadowwood)]]',
        magicalProperties: 'Ekstrak kelopaknya melarutkan endapan kristal di pembuluh darah praktisi [[Resonansi Eteris Astral]].',
      },
      content: `Bunga Lentera Malam mekar hanya ketika cahaya bulan kembar menembus kabut [[Rimba Bayang-Bayang (Shadowwood)]]. Karena kemampuannya meredakan efek *Kristalisasi Organ*, bunga ini menjadi komoditas penyelundupan paling mahal di pasar gelap [[Kekaisaran Gondoria]].`,
      updatedAt: '2026-11-08',
    },
  ],

  mapData: {
    mapTitle: 'Tabula Aethelia Magna',
    subtitle: 'Peta Kartografi Kekaisaran Gondoria, Rimba Shadowwood & Pegunungan Nidavellir',
    scaleLabel: '1 Grid = 45 Liga Kerajaan',
    leaguesPerCell: 45,
    gridCols: GRID_COLS,
    gridRows: GRID_ROWS,
    cells: createStarterTerrainGrid(),
    stamps: [
      {
        id: 'stamp-solis',
        type: 'capital',
        x: 34,
        y: 44,
        label: 'Solis Prime (Ibu Kota)',
        linkedEntityId: 'nat-gondoria',
        nationColor: '#9E2A2B',
      },
      {
        id: 'stamp-wyvern',
        type: 'tower',
        x: 46,
        y: 23,
        label: 'Observatorium Puncak Wyvern',
        linkedEntityId: 'reg-wyvern-peaks',
        nationColor: '#264653',
      },
      {
        id: 'stamp-shadowwood',
        type: 'shrine',
        x: 59,
        y: 37,
        label: 'Pohon Memori Eldath',
        linkedEntityId: 'reg-shadowwood',
        nationColor: '#2D5A43',
      },
      {
        id: 'stamp-nidavellir',
        type: 'castle',
        x: 71,
        y: 56,
        label: 'Kubah Besi Nidavellir',
        linkedEntityId: 'nat-nidavellir',
        nationColor: '#B5832A',
      },
      {
        id: 'stamp-port-valen',
        type: 'port',
        x: 38,
        y: 58,
        label: 'Pelabuhan Teluk Naga',
        linkedEntityId: 'hist-gerhana-merah',
        nationColor: '#9E2A2B',
      },
      {
        id: 'stamp-ruins-eclipse',
        type: 'ruins',
        x: 49,
        y: 52,
        label: 'Reruntuhan Menara Gerhana',
        linkedEntityId: 'enc-astrolabe-surya',
        nationColor: '#695A47',
      },
    ],
    regionLabels: [
      { id: 'lbl-1', text: 'KEKAISARAN GONDORIA', x: 31, y: 38, style: 'empire', rotation: -6 },
      { id: 'lbl-2', text: 'RIMBA SHADOWWOOD', x: 60, y: 31, style: 'region', rotation: 4 },
      { id: 'lbl-3', text: 'PUNCAK WYVERN', x: 45, y: 16, style: 'region', rotation: 0 },
      { id: 'lbl-4', text: 'NIDAVELLIR', x: 70, y: 64, style: 'empire', rotation: -4 },
      { id: 'lbl-5', text: 'Teluk Naga (Dragon Bay)', x: 41, y: 69, style: 'sea', rotation: 0 },
      { id: 'lbl-6', text: 'Samudra Barat Kuno', x: 14, y: 50, style: 'sea', rotation: -90 },
    ],
    rivers: [
      {
        id: 'riv-1',
        name: 'Sungai Perak',
        points: [
          { x: 47, y: 26 },
          { x: 46, y: 36 },
          { x: 43, y: 46 },
          { x: 40, y: 57 },
        ],
      },
      {
        id: 'riv-2',
        name: 'Aliran Kabut Timur',
        points: [
          { x: 58, y: 39 },
          { x: 54, y: 48 },
          { x: 50, y: 59 },
        ],
      },
    ],
    routes: [
      {
        id: 'rte-1',
        name: 'Jalan Raya Kekaisaran Timur',
        style: 'road',
        points: [
          { x: 34, y: 44 },
          { x: 42, y: 49 },
          { x: 49, y: 52 },
          { x: 60, y: 54 },
          { x: 71, y: 56 },
        ],
      },
      {
        id: 'rte-2',
        name: 'Ekspedisi Vaelen (Bab 1-3)',
        style: 'expedition',
        points: [
          { x: 46, y: 23 },
          { x: 52, y: 30 },
          { x: 59, y: 37 },
        ],
      },
    ],
  },

  relationships: [
    {
      id: 'rel-1',
      sourceId: 'char-vaelen',
      targetId: 'char-seraphina',
      type: 'rival',
      label: 'Mantan Guru & Sengketa Astrolabe',
      notes: 'Vaelen pernah mendidik Seraphina dalam filsafat astronomi, namun kini berseberangan demi mencegah penyalahgunaan Astrolabe Api Surya.',
    },
    {
      id: 'rel-2',
      sourceId: 'char-vaelen',
      targetId: 'fac-ordo-cakrawala',
      type: 'member',
      label: 'Arsiparis & Pemimpin',
      notes: 'Memimpin markas pengasingan Ordo di Puncak Wyvern.',
    },
    {
      id: 'rel-3',
      sourceId: 'char-seraphina',
      targetId: 'nat-gondoria',
      type: 'member',
      label: 'Maharani Penguasa',
      notes: 'Memegang komando tertinggi atas militer dan senat Kekaisaran Gondoria.',
    },
    {
      id: 'rel-4',
      sourceId: 'fac-ordo-cakrawala',
      targetId: 'race-aelfir',
      type: 'ally',
      label: 'Pakta Penjaga Rimba',
      notes: 'Saling bertukar informasi mengenai anomali eter dan suplai Bunga Lentera Malam.',
    },
    {
      id: 'rel-5',
      sourceId: 'nat-gondoria',
      targetId: 'nat-nidavellir',
      type: 'rival',
      label: 'Ultimatum Pengembalian Pusaka',
      notes: 'Ketegangan dagang dan militer terkait hak kepemilikan Astrolabe Api Surya.',
    },
    {
      id: 'rel-6',
      sourceId: 'race-dvergr',
      targetId: 'nat-nidavellir',
      type: 'member',
      label: 'Bangsa Pendiri',
      notes: 'Menguasai tujuh kubah penempaan di jantung gunung.',
    },
  ],

  nodePositions: [
    { entityId: 'char-vaelen', x: 240, y: 160 },
    { entityId: 'char-seraphina', x: 620, y: 160 },
    { entityId: 'fac-ordo-cakrawala', x: 160, y: 340 },
    { entityId: 'race-aelfir', x: 370, y: 390 },
    { entityId: 'nat-gondoria', x: 700, y: 340 },
    { entityId: 'nat-nidavellir', x: 520, y: 450 },
    { entityId: 'race-dvergr', x: 760, y: 490 },
  ],

  timeline: [
    {
      id: 'time-1',
      era: 'AE (Era Astral)',
      year: 1,
      displayDate: 'Tahun 1 AE · Musim Gugur',
      title: 'Bencana Konvergensi Gerhana Merah',
      category: 'Bencana Arcane',
      summary: 'Eksperimen penarikan energi surya gagal saat gerhana ganda, menenggelamkan lembah barat menjadi Teluk Naga.',
      linkedEntityIds: ['hist-gerhana-merah'],
      regionName: 'Teluk Naga',
    },
    {
      id: 'time-2',
      era: 'AE (Era Astral)',
      year: 2,
      displayDate: 'Tahun 2 AE · Musim Dingin',
      title: 'Penempaan Astrolabe Api Surya',
      category: 'Penemuan Pusaka',
      summary: 'Tetua Dvergr Besi-Bintang dan penyihir Gondoria menciptakan Astrolabe Api Surya untuk menstabilkan lempeng dan iklim.',
      linkedEntityIds: ['enc-astrolabe-surya', 'race-dvergr', 'nat-gondoria'],
      regionName: 'Kerajaan Bawah Tanah Nidavellir',
    },
    {
      id: 'time-3',
      era: 'AE (Era Astral)',
      year: 52,
      displayDate: 'Tahun 52 AE · Musim Semi',
      title: 'Deklarasi Berdirinya Ordo Cakrawala Perak',
      category: 'Berdirinya Kerajaan',
      summary: 'Para kartografer dan penyihir astral mendirikan observatorium independen di Puncak Wyvern.',
      linkedEntityIds: ['fac-ordo-cakrawala', 'reg-wyvern-peaks'],
      regionName: 'Puncak Wyvern',
    },
    {
      id: 'time-4',
      era: 'AE (Era Astral)',
      year: 398,
      displayDate: 'Tahun 398 AE · Musim Panas',
      title: 'Penobatan Empress Seraphina Valorian',
      category: 'Berdirinya Kerajaan',
      summary: 'Seraphina naik takhta di Solis Prime dan memulai reformasi militer Legiun Cinnabar.',
      linkedEntityIds: ['char-seraphina', 'nat-gondoria'],
      regionName: 'Solis Prime',
    },
    {
      id: 'time-5',
      era: 'AE (Era Astral)',
      year: 410,
      displayDate: 'Tahun 410 AE · Malam Titik Balik',
      title: 'Pengasingan Archmage Vaelen Thorne',
      category: 'Peperangan',
      summary: 'Vaelen membawa pergi Astrolabe Api Surya dari ibu kota setelah menemukan retakan berbahaya pada cincin intinya.',
      linkedEntityIds: ['char-vaelen', 'char-seraphina', 'enc-astrolabe-surya'],
      regionName: 'Puncak Wyvern',
    },
  ],

  chapters: [
    {
      id: 'chap-1',
      chapterNumber: 1,
      act: 'Babak I: Bayang-Bayang di Atas Kertas Perkamen',
      title: 'Jarum Kuningan yang Bergetar',
      status: 'Selesai',
      synopsis: 'Di puncak menara observatorium yang membeku, Archmage Vaelen Thorne mendapati cincin ketiga Astrolabe Api Surya berputar sendiri saat badai salju melanda Puncak Wyvern.',
      draftNotes: `Udara di Observatorium [[Puncak Wyvern]] cukup dingin untuk membekukan tinta di ujung pena bulu. [[Archmage Vaelen Thorne]] menatap permukaan meja kartografinya; di sana, [[Astrolabe Api Surya]] memancarkan denyut merah samar meskipun malam sedang gelap gulita tanpa bulan.

Menurut hukum [[Resonansi Eteris Astral]], artefak jalur surya seharusnya tertidur di malam hari. Namun jarum penunjuknya terus bergetar menunjuk ke arah tenggara—tepat ke jantung [[Rimba Bayang-Bayang (Shadowwood)]].`,
      featuredEntityIds: ['char-vaelen', 'reg-wyvern-peaks', 'enc-astrolabe-surya', 'pwr-resonansi-astral'],
      wordCountTarget: 3500,
      currentWordCount: 3420,
      scenes: [
        {
          id: 'sc-1a',
          title: 'Anomali Tengah Malam di Observatorium',
          povCharacter: 'Archmage Vaelen Thorne',
          settingRegion: 'Puncak Wyvern',
          summary: 'Vaelen mencatat pergeseran bintang dan merasakan nyeri pada mata kristal kuningannya.',
        },
        {
          id: 'sc-1b',
          title: 'Utusan Bersayap dari Shadowwood',
          povCharacter: 'Archmage Vaelen Thorne',
          settingRegion: 'Puncak Wyvern',
          summary: 'Seorang kurir Sylvan Aelfir tiba dengan luka bakar senjata surya milik Kekaisaran Gondoria.',
        },
      ],
    },
    {
      id: 'chap-2',
      chapterNumber: 2,
      act: 'Babak I: Bayang-Bayang di Atas Kertas Perkamen',
      title: 'Dekrit Segel Merah Solis Prime',
      status: 'Sedang Ditulis',
      synopsis: 'Empress Seraphina Valorian menghadapi ultimatum utusan Dvergr dari Nidavellir sembari memerintahkan ekspedisi rahasia memburu keberadaan Vaelen.',
      draftNotes: `Di ruang takhta Solis Prime, ibu kota [[Kekaisaran Gondoria]], [[Empress Seraphina Valorian]] membuka gulungan peta perbatasan timur. Utusan dari [[Kerajaan Bawah Tanah Nidavellir]] baru saja mengancam akan menghentikan pasokan baja meteorit jika [[Astrolabe Api Surya]] tidak dikembalikan sebelum musim dingin berakhir.

Seraphina tahu ia tidak bisa menyerahkan relik itu. Tanpa Astrolabe tersebut, teknik [[Keputusan Tombak Surya]] tidak akan cukup kuat menahan gelombang gerhana yang akan datang.`,
      featuredEntityIds: ['char-seraphina', 'nat-gondoria', 'nat-nidavellir', 'skl-tombak-surya'],
      wordCountTarget: 4000,
      currentWordCount: 2150,
      scenes: [
        {
          id: 'sc-2a',
          title: 'Sidang Dewan Perang di Solis Prime',
          povCharacter: 'Empress Seraphina Valorian',
          settingRegion: 'Kekaisaran Gondoria',
          summary: 'Perdebatan sengit antara jenderal Gondoria dan delegasi penempa Dvergr.',
        },
      ],
    },
    {
      id: 'chap-3',
      chapterNumber: 3,
      act: 'Babak I: Bayang-Bayang di Atas Kertas Perkamen',
      title: 'Kabut Pohon Memori',
      status: 'Rencana',
      synopsis: 'Vaelen turun dari Puncak Wyvern menuju Rimba Bayang-Bayang untuk mencari Bunga Lentera Malam dan memeriksa retakan lempeng eter.',
      draftNotes: `Perjalanan menembus [[Rimba Bayang-Bayang (Shadowwood)]] menguji batas fisik [[Archmage Vaelen Thorne]]. Karena kanopi pohon yang begitu rapat menutup cahaya langit, efisiensi [[Resonansi Eteris Astral]] berkurang drastis sesuai hukum konservasi cahaya. Ia harus mengandalkan cadangan kristal di tongkatnya saat berhadapan dengan patroli perbatasan.`,
      featuredEntityIds: ['char-vaelen', 'reg-shadowwood', 'race-aelfir', 'enc-bunga-lentera'],
      wordCountTarget: 3800,
      currentWordCount: 640,
      scenes: [
        {
          id: 'sc-3a',
          title: 'Gerbang Kabut Perak',
          povCharacter: 'Archmage Vaelen Thorne',
          settingRegion: 'Rimba Bayang-Bayang (Shadowwood)',
          summary: 'Pertemuan dengan penjaga perbatasan Sylvan Aelfir dan negosiasi izin masuk.',
        },
      ],
    },
  ],
};
