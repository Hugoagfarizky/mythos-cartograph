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
        signatureSkills: ['Simfoni Kabut Pohon Memori', 'Tenunan Gravitasi Bintang'],
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
        signatureSkills: ['Runtuhan Palu Bintang Nidavellir'],
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
      subtitle: 'Mahkota Surya di Tepi Teluk Naga · Imperium Maritim & Militer Barat',
      summary: 'Negara maritim dan militer terkuat di barat Aethelia yang diperintah oleh [[Empress Seraphina Valorian]] dari ibu kota Solis Prime.',
      tags: ['Kekaisaran', 'Kekuatan Militer', 'Teluk Naga'],
      attributes: {
        governmentType: 'Kekaisaran / Monarki',
        government: 'Monarki Konstitusional Militer (Takhta Surya & Senat Bangsawan)',
        capitalCity: 'Solis Prime',
        ruler: 'Empress Seraphina Valorian',
        stateReligion: 'Kultus Surya Abadi',
        currency: 'Dinar Surya Emas & Keping Kuningan',
        nationalEmblem:
          'Panji Matahari Emas Berkembar Tombak di atas Beludru Merah Cinnabar · Semboyan: "Di Bawah Satu Matahari, Tak Ada Bayangan"',
        dominantRaces: ['Aethel-Born (Manusia Tinggi)', 'Dvergr Besi-Bintang'],
        economicCommodities:
          'Ekspor utama berupa gandum lembah barat, anggur merah Solis, kapal perang berlapis perunggu, serta pajak pelayaran internasional di Teluk Naga. Sangat bergantung pada impor bijih meteorit dari [[Kerajaan Bawah Tanah Nidavellir]] dan herbal alkimia dari [[Rimba Bayang-Bayang (Shadowwood)]].',
        militaryStrength:
          'Diperkuat oleh [[Legiun Surya Cinnabar]] (13 batalion kavaleri zirah surya), Armada Laut Teluk Naga (40 kapal galiung meriam uap), serta jaringan Menara Suar Optik di sepanjang perbatasan timur.',
        lawsAndCulture:
          'Memberlakukan *Dekrit Registrasi Eter*: setiap praktisi [[Resonansi Eteris Astral]] Lingkar ke-3 ke atas wajib terdaftar di bawah pengawasan negara. Masyarakatnya menjunjung tinggi disiplin militer, arsitektur kubah marmer putih, dan mengadakan *Festival Titik Balik Surya* setiap pertengahan tahun.',
        diplomaticAllies:
          'Memiliki pakta perdagangan maritim dengan kota-kota pelabuhan bebas di pesisir selatan serta didukung penuh oleh Kultus Surya Abadi.',
        borderConflicts:
          'Terlibat ketegangan militer di perbatasan [[Rimba Bayang-Bayang (Shadowwood)]] melawan [[Persemakmuran Kanopi Eldath]], sengketa hak milik [[Astrolabe Api Surya]] dengan [[Kerajaan Bawah Tanah Nidavellir]], serta memburu pimpinan [[Ordo Cakrawala Perak]] di [[Puncak Wyvern]].',
      },
      content: `Kekaisaran Gondoria menguasai dataran subur di pesisir barat serta jalur pelayaran strategis di Teluk Naga (*Dragon's Bay*). Kekuatan ekonomi mereka bertumpu pada armada dagang dan legiun kavaleri berlapis baja surya di bawah komando [[Empress Seraphina Valorian]] dan [[Legiun Surya Cinnabar]].

Dalam dekade terakhir, Gondoria memperluas benteng perbatasannya hingga mendekati [[Rimba Bayang-Bayang (Shadowwood)]] dan jalur pegunungan menuju [[Kerajaan Bawah Tanah Nidavellir]], memicu ketegangan diplomatik di seluruh benua.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'nat-nidavellir',
      category: 'nation',
      title: 'Kerajaan Bawah Tanah Nidavellir',
      subtitle: 'Persemakmuran Tujuh Kubah Besi & Benteng Industri Tenggara',
      summary: 'Negara benteng pegunungan di tenggara yang dikuasai serikat penempa [[Dvergr Besi-Bintang]] dan memonopoli teknologi mekanika astral.',
      tags: ['Dewan Serikat', 'Benteng Gunung', 'Dvergr'],
      attributes: {
        governmentType: 'Dewan Serikat / Republik',
        government: 'Teknokrasi Dewan Serikat Penempa (Majelis Tujuh Kubah)',
        capitalCity: 'Kubah Kazad-Vahl',
        ruler: 'High Artificer Thrain Ironstar',
        stateReligion: 'Penghormatan Inti Bumi & Bintang Jatuh',
        currency: 'Ingot Perak Bertanda Segel & Koin Perunggu Roda Gigi',
        nationalEmblem:
          'Tujuh Palu Perak Mengelilingi Cincin Astrolabe di atas Panji Hitam-Tembaga · Semboyan: "Ditempa dalam Tekanan, Abadi dalam Baja"',
        dominantRaces: ['Dvergr Besi-Bintang'],
        economicCommodities:
          'Pengekspor tunggal baja meteorit, lensa teleskop astral, senjata berukir [[Tempaan Runik Besi-Bintang]], dan mesin uap geotermal. Mengimpor bahan pangan gandum dari permukaan serta getah kristal dari [[Persemakmuran Kanopi Eldath]].',
        militaryStrength:
          'Pertahanan berlapis gerbang baja setebal lima meter di sela ngarai pegunungan, baterai meriam uap termal, pasukan zirah berat Dvergr yang menguasai [[Runtuhan Palu Bintang Nidavellir]], serta kolosus mekanika penjaga kubah.',
        lawsAndCulture:
          'Berlandaskan *Hukum Kontrak Ingot*: setiap perjanjian dagang maupun politik yang telah dicap di atas keping perak bersifat mengikat secara hukum. Membocorkan rahasia metalurgi [[Serikat Kriya Besi-Bintang]] kepada pihak asing dihukum dengan pencabutan nama klan.',
        diplomaticAllies:
          'Menjalin hubungan dagang dan pasokan instrumen optik dengan [[Ordo Cakrawala Perak]] di [[Puncak Wyvern]], serta perjanjian pertukaran kristal dengan [[Persemakmuran Kanopi Eldath]].',
        borderConflicts:
          'Memberlakukan embargo ekspor baja meteorit terhadap [[Kekaisaran Gondoria]] dan menyiagakan meriam perbatasan akibat penolakan Solis Prime mengembalikan [[Astrolabe Api Surya]].',
      },
      content: `Terletak di balik barisan pegunungan tenggara, [[Kerajaan Bawah Tanah Nidavellir]] adalah pusat teknologi metalurgi dan mekanika astral. Kota-kota mereka dibangun di dalam kawah gunung berapi tidak aktif yang diterangi oleh cermin surya raksasa dan dikelola oleh [[Serikat Kriya Besi-Bintang]].

Hubungan mereka dengan [[Kekaisaran Gondoria]] memburuk drastis sejak sengketa kepemilikan [[Astrolabe Api Surya]].`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'nat-eldath',
      category: 'nation',
      title: 'Persemakmuran Kanopi Eldath',
      subtitle: 'Konfederasi Suci Rimba Shadowwood & Penjaga Pohon Memori',
      summary: 'Kedaulatan otonom bangsa [[Sylvan Aelfir]] di timur laut Aethelia yang diperintah oleh majelis tetua hutan tanpa raja tunggal.',
      tags: ['Persemakmuran', 'Sylvan Aelfir', 'Otonom'],
      attributes: {
        governmentType: 'Persemakmuran / Otonom',
        government: 'Konfederasi Majelis Tetua Kanopi & Penenun Memori',
        capitalCity: 'Rimba Bayang-Bayang (Shadowwood)',
        ruler: 'Kaelen dari Kabut Perak',
        stateReligion: 'Sinkronisasi Akar Pohon Memori Eldath & Siklus Bulan Kembar',
        currency: 'Barter Permata Getah Lumin & Keping Perak Daun',
        nationalEmblem:
          'Pohon Perak Berakar Bulan Kembar di atas Kain Hijau Zamrud · Semboyan: "Akar Mengingat Apa yang Dilupakan Mahkota"',
        dominantRaces: ['Sylvan Aelfir'],
        economicCommodities:
          'Penghasil eksklusif tanaman obat [[Bunga Lentera Malam]], kayu besi perak, busur eter, dan kristal memori. Sangat membatasi perdagangan dengan pihak luar kecuali melalui perantara terpercaya.',
        militaryStrength:
          'Tidak memiliki tentara reguler, melainkan dilindungi oleh medan alami [[Rimba Bayang-Bayang (Shadowwood)]], unit pemanah siluman penjaga perbatasan, serta pertahanan ilusi skala regional [[Simfoni Kabut Pohon Memori]].',
        lawsAndCulture:
          'Hukum Adat Kanopi melarang keras penebangan pohon *Lumin-Oak* dan penggunaan api Jalur Solar skala besar di dalam batas hutan. Pengambilan keputusan dilakukan melalui musyawarah gema memori di bawah pohon induk.',
        diplomaticAllies:
          'Bersekutu erat dengan [[Ordo Cakrawala Perak]] pimpinan [[Archmage Vaelen Thorne]] dan membuka jalur barter terbatas dengan [[Kerajaan Bawah Tanah Nidavellir]].',
        borderConflicts:
          'Berhadapan langsung dengan ekspansi pos militer [[Legiun Surya Cinnabar]] milik [[Kekaisaran Gondoria]] serta sindikat penyelundup bersenjata yang memburu [[Bunga Lentera Malam]].',
      },
      content: `**Persemakmuran Kanopi Eldath** bukanlah kerajaan dengan istana batu, melainkan jaringan kota-kota gantung di atas dahan pohon raksasa di jantung [[Rimba Bayang-Bayang (Shadowwood)]]. Diwakili di perbatasan luar oleh utusan seperti [[Kaelen dari Kabut Perak]], kedaulatan bangsa [[Sylvan Aelfir]] ini berusaha mempertahankan netralitasnya di tengah ancaman perang besar antara Gondoria dan Nidavellir.`,
      updatedAt: '2026-11-08',
    },

    // 5. REGIONS
    {
      id: 'reg-solis-prime',
      category: 'region',
      title: 'Solis Prime',
      subtitle: 'Ibu Kota Cincin Marmer Kekaisaran Gondoria · Pusat Takhta Surya',
      summary: 'Metropolis bertingkat tiga yang dibangun mengelilingi obelisk cermin surya raksasa, menjadi pusat politik dan militer [[Kekaisaran Gondoria]].',
      tags: ['Ibu Kota', 'Metropolis', 'Gondoria'],
      attributes: {
        regionType: 'Ibu Kota / Metropolis',
        parentNation: 'Kekaisaran Gondoria',
        climate: 'Hangat keemasan sepanjang tahun berkat pantulan cermin helio-termal di puncak kota',
        landmarks: 'Istana Takhta Surya, Katedral Sol-Aurea, Akademi Militer Legiun Cinnabar, Pelabuhan Udara Marmer',
        landmarksList: [
          'Istana Takhta Surya (Kediaman Empress Seraphina)',
          'Katedral Agung Sol-Aurea (Pusat Sinode Gereja Cahaya)',
          'Distrik Cincin Besi & Barak Legiun Cinnabar',
          'Menara Lonceng Helio-Termal',
        ],
        resources: 'Kristal Lensa Surya, Pajak Jalur Perdagangan Barat, Gudang Persenjataan Kekaisaran',
        endemicFloraFauna: ['Astrolabe Api Surya', 'Kuda Perang Zirah Surya'],
        dangerLevel: 'Rendah di Distrik Dalam · Ketat oleh Patroli Inkuisitor & Jam Malam Militer',
        sensoryAtmosphere:
          'Cahaya matahari memantul menyilaukan dari kubah-kubah marmer putih dan jalanan batu berlapis kuningan; udara berbau dupa kemenyan suci bercampur asap batu bara dari bengkel senjata, diiringi derap sepatu lars patroli [[Legiun Surya Cinnabar]] setiap pergantian jam.',
        localEcologyAndHazards:
          'Tidak ada monster liar di dalam tembok kota, namun bahaya utamanya adalah pengawasan mata-mata Inkuisisi Cahaya, razia sihir Jalur Lunar tanpa lisensi, serta panas ekstrem di sekitar menara cermin pusat pada tengah hari.',
        linkedMapStampLabel: 'Solis Prime (Ibu Kota)',
      },
      content: `**Solis Prime** adalah permata mahkota [[Kekaisaran Gondoria]] sekaligus kediaman resmi [[Empress Seraphina Valorian]]. Kota ini dirancang dalam tiga cincin konsentris yang semakin meninggi ke arah tengah: Cincin Luar untuk pasar niaga dan pemukiman rakyat, Cincin Tengah untuk senat bangsawan [[Aethel-Born (Manusia Tinggi)]] dan barak [[Legiun Surya Cinnabar]], serta Cincin Puncak tempat berdirinya Istana Takhta Surya.

Sebelum diasingkan ke [[Puncak Wyvern]], [[Archmage Vaelen Thorne]] pernah memimpin menara astronomi istana di kota ini sebelum menemukan bukti bahaya penggunaan [[Astrolabe Api Surya]].`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'reg-shadowwood',
      category: 'region',
      title: 'Rimba Bayang-Bayang (Shadowwood)',
      subtitle: 'Hutan Kanopi Perak di Timur Laut Aethelia · Tanah Suci Sylvan Aelfir',
      summary: 'Wilayah hutan purba berkabut tempat pohon-pohon raksasa menyerap cahaya bintang dan menjadi pusat kedaulatan [[Persemakmuran Kanopi Eldath]].',
      tags: ['Bioma Hutan', 'Zona Anomali', 'Aelfir'],
      attributes: {
        regionType: 'Alam Liar & Hutan Magis',
        parentNation: 'Persemakmuran Kanopi Eldath',
        climate: 'Lembap, sejuk, dan berkabut abadi dengan pendaran bioluminesensi perak-biru di malam hari',
        landmarks: 'Pohon Memori Eldath, Reruntuhan Kuil Bulan, Jembatan Akar Gantung, Pos Perbatasan Kabut Perak',
        landmarksList: [
          'Pohon Memori Eldath (Pusat Musyawarah Tetua Aelfir)',
          'Reruntuhan Kuil Bulan Kembar',
          'Lembah Budidaya Bunga Lentera Malam',
          'Pos Penjaga Kabut Perak',
        ],
        resources: 'Getah Kristal Eter, Kayu Besi Perak, Tanaman [[Bunga Lentera Malam]]',
        endemicFloraFauna: ['Bunga Lentera Malam', 'Rusa Tanduk Kristal', 'Ngengat Eter Perak'],
        dangerLevel: 'Tinggi (Kabut Ilusi Memori & Penjaga Perbatasan Aelfir)',
        sensoryAtmosphere:
          'Kanopi pohon *Lumin-Oak* setinggi seratus meter menutup langit hingga siang hari tampak seperti senja kebiruan; udara dingin beraroma lumut basah, getah pinus manis, dan ozon sihir, dengan bisikan halus gema suara masa lalu yang terbawa angin di sela akar-akar gantung.',
        localEcologyAndHazards:
          'Medan magnet dan kompas logam lumpuh total di wilayah ini. Pendatang asing yang masuk tanpa pemandu [[Sylvan Aelfir]] akan terjebak dalam anomali [[Simfoni Kabut Pohon Memori]] yang memutar balik arah langkah kaki dan membangkitkan halusinasi masa lalu.',
        linkedMapStampLabel: 'Pohon Memori Eldath',
      },
      content: `Rimba Bayang-Bayang membentang luas di bagian timur laut benua sebagai jantung dari [[Persemakmuran Kanopi Eldath]]. Kompas biasa tidak berfungsi di dalam wilayah ini karena rapatnya kandungan eter di akar pepohonan. Hanya kartografer dari [[Ordo Cakrawala Perak]] atau pemandu asli [[Sylvan Aelfir]] seperti [[Kaelen dari Kabut Perak]] yang dapat melintasi jalurnya dengan selamat.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'reg-wyvern-peaks',
      category: 'region',
      title: 'Puncak Wyvern',
      subtitle: 'Pegunungan Utara Tempat Bersarangnya Naga Angin & Benteng Observatorium',
      summary: 'Barisan pegunungan bersalju di utara tempat berdirinya observatorium pengasingan [[Archmage Vaelen Thorne]] dan markas [[Ordo Cakrawala Perak]].',
      tags: ['Pegunungan', 'Utara', 'Observatorium'],
      attributes: {
        regionType: 'Benteng & Kota Perbatasan',
        parentNation: 'Zona Bebas Perbatasan Utara',
        climate: 'Dingin membeku sepanjang tahun, disertai badai angin astral dan aurora eter di malam hari',
        landmarks: 'Observatorium Cakrawala, Jembatan Rantai Langit, Tebing Sarang Wyvern',
        landmarksList: [
          'Observatorium Cakrawala Perak (Markas Vaelen Thorne)',
          'Jembatan Rantai Besi-Bintang Lintas Jurang',
          'Gua Kristal Es Abadi',
          'Pos Sinyal Lentera Utara',
        ],
        resources: 'Bijih Bintang Jatuh, Kristal Es Abadi, Rekaman Peta Bintang Kuno',
        endemicFloraFauna: ['Wyvern Sayap-Es Utara', 'Lumut Bara Gunung'],
        dangerLevel: 'Sangat Tinggi (Predator Wyvern Puncak, Jurang Terjal & Badai Eter)',
        sensoryAtmosphere:
          'Angin utara menderu melewati celah tebing granit hitam dan menggetarkan rantai-rantai jembatan gantung; udara begitu dingin hingga napas langsung mengkristal, sementara langit malamnya sangat jernih menampilkan dua bulan dan cincin kuningan raksasa observatorium yang berputar perlahan.',
        localEcologyAndHazards:
          'Kawanan *Wyvern Sayap-Es* berburu di sekitar tebing bawah saat badai salju turun. Selain suhu hipodermia ekstrem, kilatan petir astral kerap menyambar logam terbuka yang tidak dilindungi ukiran runik [[Dvergr Besi-Bintang]].',
        linkedMapStampLabel: 'Observatorium Puncak Wyvern',
      },
      content: `Puncak Wyvern merupakan atap dunia Aethelia. Karena langitnya yang sangat jernih dan dekat dengan arus bintang, [[Ordo Cakrawala Perak]] membangun benteng observatorium mereka di tebing tertingginya.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'reg-reruntuhan-gerhana',
      category: 'region',
      title: 'Reruntuhan Menara Gerhana',
      subtitle: 'Zona Kawah Kaca & Patahan Eter Bekas Tragedi Tahun 1 AE',
      summary: 'Kawasan tanah tandus berkaca di tepi timur Teluk Naga tempat meledaknya menara sihir kuno saat [[Konvergensi Gerhana Merah]].',
      tags: ['Zona Terkutuk', 'Reruntuhan Kuno', 'Anomali Gravitasi'],
      attributes: {
        regionType: 'Zona Terkutuk / Reruntuhan',
        parentNation: 'Zona Sengketa Gondoria – Nidavellir',
        climate: 'Kering berangin abu dengan badai pasir kaca dan distorsi cahaya senja',
        landmarks: 'Pilar Patah Menara Pertama, Kawah Kaca Merah, Dermaga Tenggelam Teluk Naga',
        landmarksList: [
          'Inti Kawah Kaca Merah (Titik Nol Konvergensi)',
          'Pilar Patah Menara Sihir Kuno',
          'Bangkai Kapal Batu Dinasti Lama',
        ],
        resources: 'Pecahan Kaca Eter Kuno, Prasasti Era Pra-Konvergensi, Residu Kristal Surya',
        endemicFloraFauna: ['Astrolabe Api Surya', 'Konstruk Abu Terkutuk'],
        dangerLevel: 'Ekstrem (Anomali Gravitasi Liar & Radiasi Kristalisasi Organ)',
        sensoryAtmosphere:
          'Hamparan tanah pasir yang telah meleleh menjadi kaca hitam dan merah tua berkilau tajam di bawah matahari; batu-batu reruntuhan tampak melayang miring tanpa bobot di udara yang berbau logam terbakar dan kesunyian mencekam tanpa suara burung sedikit pun.',
        localEcologyAndHazards:
          'Zona paling mematikan di Aethelia tengah: kantong gravitasi terbalik dapat menghempaskan penjelajah ke udara, sementara debu kaca eter di kawah utama mempercepat gejala *Kristalisasi Organ* bagi siapa pun yang merapal [[Resonansi Eteris Astral]] tanpa pelindung.',
        linkedMapStampLabel: 'Reruntuhan Menara Gerhana',
      },
      content: `**Reruntuhan Menara Gerhana** adalah saksi bisu kehancuran [[Konvergensi Gerhana Merah]]. Di tempat inilah para penyihir kuno gagal mengendalikan energi gerhana ganda hingga menenggelamkan lembah barat menjadi Teluk Naga dan memaksa ditempanya [[Astrolabe Api Surya]].`,
      updatedAt: '2026-11-08',
    },

    // 6. HISTORY
    {
      id: 'hist-gerhana-merah',
      category: 'history',
      title: 'Konvergensi Gerhana Merah',
      subtitle: 'Tragedi Runtuhnya Menara Sihir Kuno & Tenggelamnya Teluk Naga (Tahun 1 AE)',
      summary: 'Peristiwa bencana kosmik ketika dua bulan Aethelia sejajar dengan matahari, membelah daratan Teluk Naga dan melahirkan sistem penanggalan Era Astral.',
      tags: ['Bencana Besar', 'Era Pertama', 'Asal-Usul Sihir'],
      attributes: {
        historyEventType: 'Bencana Kosmik / Arcane',
        era: 'AE (Era Astral)',
        year: 1,
        displayDate: 'Tahun 1 AE · Malam Gerhana Ganda Musim Gugur',
        eventLocation: 'Reruntuhan Menara Gerhana',
        belligerents: 'Dinasti Kuno Aethelia vs Arus Eter Liar',
        belligerentsList: [
          'Kekaisaran Gondoria',
          'Dvergr Besi-Bintang',
          'Sylvan Aelfir',
        ],
        keyHistoricalFigures: ['Archmage Vaelen Thorne'],
        historicalTrigger:
          'Eksperimen ambisius Dewan Penyihir Dinasti Kuno yang mencoba menyedot energi matahari dan dua bulan kembar secara paksa menggunakan menara fokus kristal tunggal guna meraih keabadian.',
        casualtiesAndLosses:
          'Ibu kota kuno lembah barat tenggelam seluruhnya menjadi perairan Teluk Naga; lebih dari 120.000 jiwa gugur dan tanah di sekitar titik ledakan meleleh menjadi [[Reruntuhan Menara Gerhana]].',
        outcome:
          'Runtuhnya Dinasti Lama, terbentuknya Teluk Naga, dan ditempanya [[Astrolabe Api Surya]] sebagai penstabil lempeng benua.',
        worldImpactLegacy:
          'Melahirkan sistem kalender *Era Astral (AE)*, memberlakukan Tiga Hukum Besi [[Resonansi Eteris Astral]], serta memicu trauma ekologis yang membuat bangsa [[Sylvan Aelfir]] menutup perbatasan [[Rimba Bayang-Bayang (Shadowwood)]].',
        officialHistoryVersion:
          'Menurut kronik resmi Gereja Cahaya di [[Solis Prime]], bencana ini adalah murka benda langit akibat kesombongan penyihir aliran bulan dan bintang yang menolak tunduk pada satu otoritas Matahari.',
        hiddenHistoricalTruth:
          'Prasasti yang diterjemahkan [[Archmage Vaelen Thorne]] membuktikan bahwa eksperimen tersebut sebenarnya disabotase oleh leluhur Wangsa Valorian sendiri agar mereka dapat memonopoli sisa inti surya dan mendirikan [[Kekaisaran Gondoria]].',
      },
      content: `Empat ratus tahun yang lalu, para penyihir kuno mencoba menarik energi matahari secara paksa saat terjadi gerhana ganda. Eksperimen tersebut gagal dan memicu ledakan gelombang eter yang menenggelamkan lembah barat menjadi perairan Teluk Naga serta meninggalkan kawah abadi di [[Reruntuhan Menara Gerhana]].

Untuk menstabilkan iklim dan arus sihir dunia yang kacau, para leluhur [[Dvergr Besi-Bintang]] dan pendahulu [[Kekaisaran Gondoria]] bekerja sama menempa [[Astrolabe Api Surya]]. Catatan [[Archmage Vaelen Thorne]] menunjukkan bahwa siklus gerhana serupa akan terulang dalam waktu kurang dari tiga tahun.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'hist-traktat-astrolabe',
      category: 'history',
      title: 'Pakta Kubah Besi & Penempaan Astrolabe',
      subtitle: 'Perjanjian Bersejarah Gondoria–Nidavellir Pasca-Konvergensi (Tahun 2 AE)',
      summary: 'Traktat kerja sama darurat antara leluhur [[Kekaisaran Gondoria]] dan [[Kerajaan Bawah Tanah Nidavellir]] untuk menempa [[Astrolabe Api Surya]].',
      tags: ['Traktat Politik', 'Penemuan Pusaka', 'Nidavellir'],
      attributes: {
        historyEventType: 'Traktat, Pakta & Penemuan Agung',
        era: 'AE (Era Astral)',
        year: 2,
        displayDate: 'Tahun 2 AE · Titik Balik Musim Dingin',
        eventLocation: 'Kerajaan Bawah Tanah Nidavellir',
        belligerents: 'Kekaisaran Gondoria & Serikat Klan Dvergr Nidavellir',
        belligerentsList: [
          'Kekaisaran Gondoria',
          'Kerajaan Bawah Tanah Nidavellir',
          'Dvergr Besi-Bintang',
        ],
        keyHistoricalFigures: [
          'Empress Seraphina Valorian',
          'Archmage Vaelen Thorne',
        ],
        historicalTrigger:
          'Gempa eter susulan pasca-[[Konvergensi Gerhana Merah]] yang mengancam akan meruntuhkan kubah-kubah bawah tanah Nidavellir dan membekukan lahan pertanian Gondoria.',
        casualtiesAndLosses:
          'Tujuh empu penempa tertinggi [[Dvergr Besi-Bintang]] kehilangan nyawa akibat paparan radiasi panas inti bintang saat menyatukan tiga cincin kuningan Astrolabe.',
        outcome:
          'Terciptanya [[Astrolabe Api Surya]] dan ditandatanganinya *Piagam Rotasi Seratus Tahun* yang mengatur hak kepemilikan bergilir atas relik tersebut.',
        worldImpactLegacy:
          'Pelanggaran klausul pengembalian relik inilah yang kini memicu krisis diplomatik terbesar antara [[Empress Seraphina Valorian]] dan Dewan Serikat [[Kerajaan Bawah Tanah Nidavellir]].',
        officialHistoryVersion:
          'Klaim resmi istana [[Solis Prime]] menyatakan bahwa bangsa Dvergr menyerahkan Astrolabe Api Surya secara permanen kepada Wangsa Valorian sebagai upeti perlindungan militer.',
        hiddenHistoricalTruth:
          'Salinan asli traktat yang terukir di lempeng meteorit di bawah Kubah Pertama Nidavellir secara tegas menyebutkan bahwa hak guna Gondoria telah habis sejak sepuluh tahun silam.',
      },
      content: `Satu tahun setelah bencana [[Konvergensi Gerhana Merah]], dunia Aethelia masih dilanda badai abu dan pergeseran lempeng. Hanya melalui penggabungan ilmu [[Tempaan Runik Besi-Bintang]] milik [[Dvergr Besi-Bintang]] dan matriks [[Resonansi Eteris Astral]] milik penyihir manusia, [[Astrolabe Api Surya]] berhasil diselesaikan.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'hist-perang-rantai-besi',
      category: 'history',
      title: 'Perang Rantai Besi & Pengepungan Lembah Timur',
      subtitle: 'Konflik Militer Terbesar Abad Keempat antara Gondoria dan Nidavellir (Tahun 340 AE)',
      summary: 'Perang perbatasan selama empat tahun memperebutkan tambang meteorit timur yang memperkenalkan kedahsyatan [[Legiun Surya Cinnabar]].',
      tags: ['Perang Besar', 'Militer', 'Abad Keempat'],
      attributes: {
        historyEventType: 'Perang Besar & Pengepungan',
        era: 'AE (Era Astral)',
        year: 340,
        displayDate: 'Tahun 340–344 AE · Kampanye Musim Kemarau',
        eventLocation: 'Puncak Wyvern',
        belligerents: 'Kekaisaran Gondoria vs Kerajaan Bawah Tanah Nidavellir',
        belligerentsList: [
          'Kekaisaran Gondoria',
          'Kerajaan Bawah Tanah Nidavellir',
          'Legiun Surya Cinnabar',
        ],
        keyHistoricalFigures: ['Empress Seraphina Valorian'],
        historicalTrigger:
          'Sengketa klaim atas jatuhnya meteorit bintang baru di lereng selatan [[Puncak Wyvern]] dan blokade jalur batu bara oleh Gilda Penempa Nidavellir.',
        casualtiesAndLosses:
          'Lebih dari 18.000 prajurit kedua belah pihak gugur; tiga benteng perbatasan hancur lebur dan jalur kereta gantung lama di pegunungan timur terputus.',
        outcome:
          'Gencatan senjata tanpa pemenang mutlak; lembah tambang ditetapkan sebagai zona penyangga demiliterisasi.',
        worldImpactLegacy:
          'Melahirkan doktrin artileri modern [[Legiun Surya Cinnabar]] serta mendorong Nidavellir membangun meriam uap penangkal sihir surya di sepanjang terowongan mereka.',
        officialHistoryVersion:
          'Buku sejarah militer Gondoria mencatat perang ini sebagai kemenangan gemilang Kekaisaran yang berhasil memaksa bangsa Dvergr kembali ke bawah tanah.',
        hiddenHistoricalTruth:
          'Pasukan Gondoria sebenarnya hampir kehabisan logistik di musim dingin keempat dan terpaksa mundur setelah jalur suplai mereka diputus oleh gerilyawan [[Sylvan Aelfir]].',
      },
      content: `**Perang Rantai Besi** menjadi ujian tempur pertama bagi persenjataan hibrida di Benua Aethelia. Pertempuran ini meninggalkan luka diplomasi mendalam yang membuat kepercayaan antara [[Kekaisaran Gondoria]] dan [[Kerajaan Bawah Tanah Nidavellir]] tidak pernah pulih sepenuhnya.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'hist-pengasingan-vaelen',
      category: 'history',
      title: 'Malam Skisma Surya & Pengasingan Vaelen Thorne',
      subtitle: 'Perpecahan Takhta Solis Prime dan Pelarian Pembawa Astrolabe (Tahun 410 AE)',
      summary: 'Peristiwa politik dramatis ketika [[Archmage Vaelen Thorne]] menolak perintah [[Empress Seraphina Valorian]] dan membawa lari [[Astrolabe Api Surya]] ke [[Puncak Wyvern]].',
      tags: ['Intrik Politik', 'Skisma', 'Pemicu Plot Utama'],
      attributes: {
        historyEventType: 'Berdirinya / Runtuhnya Dinasti',
        era: 'AE (Era Astral)',
        year: 410,
        displayDate: 'Tahun 410 AE · Malam Titik Balik Musim Dingin',
        eventLocation: 'Solis Prime',
        belligerents: 'Istana Kekaisaran Gondoria vs Ordo Cakrawala Perak',
        belligerentsList: [
          'Kekaisaran Gondoria',
          'Ordo Cakrawala Perak',
          'Legiun Surya Cinnabar',
        ],
        keyHistoricalFigures: [
          'Archmage Vaelen Thorne',
          'Empress Seraphina Valorian',
          'Kaelen dari Kabut Perak',
        ],
        historicalTrigger:
          'Perintah rahasia Empress Seraphina untuk membuka segel cincin ketiga [[Astrolabe Api Surya]] guna mengisi meriam suar kekaisaran.',
        casualtiesAndLosses:
          'Menara Astronomi Kerajaan di [[Solis Prime]] terbakar sebagian; dua belas cendekiawan [[Ordo Cakrawala Perak]] ditahan dan status kebangsawanan Vaelen dicabut.',
        outcome:
          'Vaelen berhasil meloloskan diri menembus blokade malam menuju [[Puncak Wyvern]] dengan bantuan pemandu [[Kaelen dari Kabut Perak]].',
        worldImpactLegacy:
          'Menjadi titik awal langsung dari konflik utama cerita novel saat ini (Bab 1–3), memicu perburuan lintas benua terhadap Vaelen dan Astrolabe Api Surya.',
        officialHistoryVersion:
          'Dekrit Segel Merah mengumumkan bahwa Archmage Vaelen telah kehilangan kewarasannya akibat kutukan *Kristalisasi Organ* dan mencuri pusaka negara untuk berkhianat.',
        hiddenHistoricalTruth:
          'Vaelen justru menyelamatkan ibu kota [[Solis Prime]] dari kehancuran: jika cincin ketiga Astrolabe dipaksa menyala malam itu, retakan intinya akan meledakkan separuh kota seperti tragedi [[Konvergensi Gerhana Merah]].',
      },
      content: `Pada malam titik balik musim dingin Tahun 410 AE, hubungan guru dan murid antara [[Archmage Vaelen Thorne]] dan [[Empress Seraphina Valorian]] pecah di ruang observatorium istana [[Solis Prime]]. Peristiwa inilah yang membuka rangkaian adegan pada Bab 1 naskah utama.`,
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
        systemTypology: 'Hard Magic / Terukur',
        energySource: 'Cahaya Matahari (Jalur Solar), Bulan Kembar (Jalur Lunar), dan Gugus Bintang (Jalur Sidereal)',
        originSource: 'Konvergensi Gerhana Merah',
        awakeningCondition:
          'Seseorang harus membuka Meridian Astral melalui meditasi penyelarasan detak jantung terhadap perputaran langit di menara observatorium atau di bawah kanopi [[Rimba Bayang-Bayang (Shadowwood)]].',
        catalystMedium: 'Astrolabe Api Surya',
        powerTiersList: [
          'Lingkar 1: Inisiat Lentera (Peka Cahaya & Eter Dasar)',
          'Lingkar 2: Penenun Cincin (Proyeksi Segel Tunggal)',
          'Lingkar 3: Adept Cakrawala (Manipulasi Elemen Lokal)',
          'Lingkar 4: Pengawas Rasi (Resonansi Jarak Menengah)',
          'Lingkar 5: Magister Menara (Penguasa Hukum Ruang/Panas)',
          'Lingkar 6: Sovereign Scholar / Valkyrie (Batas Tertinggi Fana)',
          'Lingkar 7: Arsitek Mitos (Legenda Era Konvergensi)',
        ],
        elementBranches: [
          'Jalur Solar (Panas Surya, Api Cinnabar & Otoritas Cahaya)',
          'Jalur Lunar (Ilusi Kabut, Memori Pohon & Pantulan Bayangan)',
          'Jalur Sidereal (Gravitasi Bintang, Vektor Ruang & Presisi Waktu)',
        ],
        tierHierarchy: 'Lingkar 1 (Inisiat) → Lingkar 3 (Adept) → Lingkar 5 (Magister) → Lingkar 6 (Sovereign) → Lingkar 7 (Mitos)',
        hardRules:
          '1. Hukum Konservasi Cahaya: Tidak bisa menciptakan materi dari ketiadaan dan tidak dapat dirapal di ruang bawah tanah yang tertutup rapat tanpa kristal penyimpan cahaya.\n2. Hukum Vektor Segel: Setiap rapalan wajib membentuk geometri cincin yang presisi; gangguan pada formasi cincin akan membatalkan teknik seketika.',
        systemWeakness:
          'Kekuatan melemah hingga 60% saat badai abu vulkanik atau di kedalaman [[Kerajaan Bawah Tanah Nidavellir]]. Logam timah hitam dan asap belerang dapat mengacaukan garis segel geometris.',
        corruptionCost:
          'Over-Resonansi memicu kutukan *Kristalisasi Organ*: pembuluh darah, mata, hingga jantung pengguna perlahan membatu menjadi kaca dan kuningan hidup yang kaku jika melampaui kapasitas jiwa (hanya dapat diredam dengan ekstrak [[Bunga Lentera Malam]]).',
      },
      content: `**Resonansi Eteris Astral** bekerja dengan menyelaraskan detak jantung dan meridian pengguna terhadap frekuensi benda langit melalui diagram geometris (*Astrolabe Sigil*).

### Tiga Hukum Besi (Hard Magic Rules)
1. **Hukum Konservasi Cahaya**: Seorang praktisi tidak dapat merapal teknik di tempat yang terisolasi dari langit kecuali menggunakan lentera baterai kristal yang sudah diisi sebelumnya.
2. **Batas Lingkar Jiwa**: Setiap naik satu Lingkar membutuhkan pemahaman filosofis dan ukiran segel baru. Saat ini tidak ada manusia hidup yang berhasil mencapai Lingkar ke-7.
3. **Kutukan Kristalisasi**: Setiap penggunaan skill tingkat tinggi meninggalkan residu mineral bintang di dalam darah. Inilah alasan mengapa mata kiri [[Archmage Vaelen Thorne]] telah membatu menjadi kuningan kristal.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'pwr-tempaan-runik',
      category: 'power_system',
      title: 'Tempaan Runik Besi-Bintang',
      subtitle: 'Arsitektur Mekanika-Magis & Pahat Segel Logam Bangsa Dvergr',
      summary: 'Disiplin kriya-magis dari [[Kerajaan Bawah Tanah Nidavellir]] yang mengikat energi panas bumi dan meteorit ke dalam roda gigi serta senjata tempaan.',
      tags: ['Runik & Kriya', 'Mekanika Astral', 'Dvergr'],
      attributes: {
        systemTypology: 'Runik & Kriya Artefak',
        energySource: 'Panas Tungku Geotermal & Inti Bijih Meteorit Bintang Jatuh',
        originSource: 'Dvergr Besi-Bintang',
        awakeningCondition:
          'Tidak membutuhkan bakat sihir bawaan di dalam darah, melainkan penguasaan matematika geometri *Khaz-Runa*, ketahanan fisik terhadap panas tungku, dan sumpah darah penempa.',
        catalystMedium: 'Palu Meteorit & Cincin Kuningan',
        powerTiersList: [
          'Tingkat 1: Juru Bara (Pengolah Bijih & Segel Tunggal)',
          'Tingkat 2: Pahat Perunggu (Pembuat Lentera & Perisai Runik)',
          'Tingkat 3: Empu Roda Gigi (Arsitek Automata & Cermin Optik)',
          'Tingkat 4: Penempa Bintang (Pencipta Senjata Pusaka Kerajaan)',
          'Tingkat 5: High Artificer (Pencipta Relik Sekelas Astrolabe Api Surya)',
        ],
        elementBranches: [
          'Kriya Termal (Penyimpanan Panas & Meriam Uap Surya)',
          'Kriya Magnetik (Kendali Berat Logam & Perisai Tolak Besi)',
          'Kriya Horologi (Roda Gigi Presisi & Instrumen Penstabil Lempeng)',
        ],
        tierHierarchy: 'Juru Bara → Pahat Perunggu → Empu Roda Gigi → Penempa Bintang → High Artificer',
        hardRules:
          '1. Energi hanya dapat bekerja melalui medium fisik yang telah diukir aksara *Khaz-Runa* secara utuh.\n2. Jika satu huruf runik pada permukaan logam tergores atau retak lebih dari dua milimeter, aliran energi akan bocor dan memicu ledakan mekanis.',
        systemWeakness:
          'Sangat bergantung pada ketersediaan bijih meteorit dan waktu pemeliharaan alat; jika mekanisme roda gigi membeku di suhu ekstrem [[Puncak Wyvern]], output dayanya turun drastis.',
        corruptionCost:
          'Paparan uap raksa-bintang dan getaran tungku selama puluhan tahun menyebabkan *Paru-Paru Abu Besi* serta ketergantungan pada implan mekanis.',
      },
      content: `Diciptakan oleh bangsa [[Dvergr Besi-Bintang]] karena tubuh biologis mereka tidak dapat merapal sihir langsung seperti bangsa [[Sylvan Aelfir]] maupun [[Aethel-Born (Manusia Tinggi)]]. Melalui **Tempaan Runik Besi-Bintang**, mereka membuktikan bahwa sebilah senjata yang diukir dengan presisi matematika mampu menandingi penyihir Lingkar ke-6.`,
      updatedAt: '2026-11-08',
    },

    // 8. SKILLS
    {
      id: 'skl-tenunan-gravitasi',
      category: 'skill',
      title: 'Tenunan Gravitasi Bintang',
      subtitle: 'Teknik Agung Lingkar ke-6 Jalur Sidereal · Pengendali Medan Tempur',
      summary: 'Memampatkan medan gravitasi lokal dalam skala benteng untuk membelokkan hujan proyektil, menghentikan laju kavaleri, atau meremukkan formasi pengepungan.',
      tags: ['Jalur Sidereal', 'Skala Benteng', 'Lingkar 6'],
      attributes: {
        parentPowerSystem: 'Resonansi Eteris Astral',
        skillRank: 'Lingkar 6: Sovereign Scholar / Valkyrie (Batas Tertinggi Fana)',
        elementAffinity: 'Jalur Sidereal (Gravitasi Bintang, Vektor Ruang & Presisi Waktu)',
        skillExclusivity: 'Teknik Agung Skala Strategis',
        exclusiveRaces: ['Aethel-Born (Manusia Tinggi)', 'Sylvan Aelfir'],
        impactScale: 'Skala Pasukan / Benteng (Radius 300 Meter)',
        strategicImpact:
          'Mampu melumpuhkan satu batalion kavaleri zirah berat dan membelokkan tembakan meriam uap secara serentak. Penggunaan beruntun di titik yang sama dapat memicu anomali retakan ruang mikro di atas tanah.',
        visualManifestation:
          'Tujuh cincin geometri perak berpendar di udara mengelilingi pengguna; batu-batu kerikil dan debu melayang naik secara terbalik sementara cahaya di sekitar kubah tampak melengkung bagai lensa kaca.',
        activationCost: 'Membutuhkan medium kompas/astrolabe logam dan 40% cadangan eter pengguna',
        cooldownOrLimit: 'Maksimal dipertahankan selama 90 detik sebelum memicu pendarahan retina dan gejala awal Kristalisasi Organ.',
      },
      content: `Teknik khas tingkat tinggi yang disempurnakan oleh [[Archmage Vaelen Thorne]] bersama para penjaga perbatasan [[Sylvan Aelfir]]. Dengan memutar cincin astrolabe secara berlawanan arah jarum jam, pengguna menciptakan titik berat semu di udara yang mengubah hukum jatuh bebas di area pertempuran.

Anak panah, tombak pengepungan, hingga semburan api dari [[Legiun Surya Cinnabar]] akan melengkung tertarik ke titik pusat gravitasi tersebut sebelum sempat menyentuh garis pertahanan [[Ordo Cakrawala Perak]].`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'skl-tombak-surya',
      category: 'skill',
      title: 'Keputusan Tombak Surya',
      subtitle: 'Teknik Militer Strategis Wangsa Valorian · Penghancur Gerbang Kota',
      summary: 'Memfokuskan panas matahari siang hari menjadi pilar cahaya cinnabar raksasa yang sanggup melelehkan gerbang benteng baja dan membelah formasi armada laut.',
      tags: ['Jalur Solar', 'Skala Kota / Benteng', 'Garis Darah Valorian'],
      attributes: {
        parentPowerSystem: 'Resonansi Eteris Astral',
        skillRank: 'Lingkar 6: Sovereign Scholar / Valkyrie (Batas Tertinggi Fana)',
        elementAffinity: 'Jalur Solar (Panas Surya, Api Cinnabar & Otoritas Cahaya)',
        skillExclusivity: 'Bakat Garis Darah Kuno & Takhta Mahkota',
        exclusiveRaces: ['Aethel-Born (Manusia Tinggi)'],
        impactScale: 'Skala Kota / Lembah (Jangkauan Lintas 2 Kilometer)',
        strategicImpact:
          'Satu tebasan penuh sanggup menguapkan parit pertahanan, melelehkan gerbang perunggu [[Kerajaan Bawah Tanah Nidavellir]], atau membakar lima kapal perang di Teluk Naga sekaligus. Tanah yang dilewati berkas cahayanya berubah menjadi kaca kristal merah selama berbulan-bulan.',
        visualManifestation:
          'Langit di atas pengguna tampak meredup sejenak karena seluruh cahaya matahari tersedot ke ujung pedang/tombak, membentuk mahkota halo emas-merah sebelum meledak menjadi seberkas pilar api lurus diiringi suara guntur termal.',
        activationCost: 'Hanya bisa digunakan pada siang hari terik atau dengan mengorbankan satu inti rubi surya murni',
        cooldownOrLimit: 'Menyebabkan luka bakar termal pada lengan pengguna jika dilepaskan lebih dari dua kali sehari tanpa sokongan [[Astrolabe Api Surya]].',
      },
      content: `Keahlian warisan takhta [[Kekaisaran Gondoria]] yang hanya diwariskan kepada garis darah bangsawan Surya di bawah kepemimpinan [[Empress Seraphina Valorian]]. Berdasarkan hukum mutlak [[Resonansi Eteris Astral]], teknik berskala strategis ini kehilangan separuh dayanya pada malam hari kecuali disokong oleh relik [[Astrolabe Api Surya]].`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'skl-kabut-memori-aelfir',
      category: 'skill',
      title: 'Simfoni Kabut Pohon Memori',
      subtitle: 'Warisan Rasial Eksklusif Sylvan Aelfir · Ilusi & Pertahanan Skala Hutan',
      summary: 'Skill khusus ras [[Sylvan Aelfir]] yang membangkitkan kabut bioluminesensi dari akar pohon purba untuk menyesatkan seluruh pasukan penyerbu ke dalam labirin ingatan masa lalu.',
      tags: ['Warisan Rasial', 'Sylvan Aelfir', 'Skala Regional'],
      attributes: {
        parentPowerSystem: 'Resonansi Eteris Astral',
        skillRank: 'Lingkar 5: Magister Menara (Penguasa Hukum Ruang/Panas)',
        elementAffinity: 'Jalur Lunar (Ilusi Kabut, Memori Pohon & Pantulan Bayangan)',
        skillExclusivity: 'Warisan Rasial Eksklusif',
        exclusiveRaces: ['Sylvan Aelfir'],
        impactScale: 'Skala Regional / Negara (Seluruh Lembah Hutan)',
        strategicImpact:
          'Menutup seluruh akses militer menuju [[Rimba Bayang-Bayang (Shadowwood)]]. Pasukan asing yang memasuki area kabut akan kehilangan arah kompas, melihat halusinasi kenangan leluhur hutan, dan berputar-putar hingga kembali ke titik awal tanpa pertumpahan darah.',
        visualManifestation:
          'Akar-akar pohon *Lumin-Oak* menyala biru-perak serentak, mengembuskan kabut tebal beraroma kelopak [[Bunga Lentera Malam]] disertai bisikan melodi bahasa kuno *Sylva-Lir* yang bergema dari segala penjuru.',
        activationCost: 'Hanya dapat diaktifkan oleh darah murni [[Sylvan Aelfir]] yang menyentuh jaringan akar hidup di tanah hutan',
        cooldownOrLimit: 'Tidak dapat digunakan di luar ekosistem hutan atau di tanah yang telah tercemar abu besi.',
      },
      content: `Hanya bangsa [[Sylvan Aelfir]] yang memiliki anatomi saraf pendengaran eter untuk memanggil **Simfoni Kabut Pohon Memori**. Dalam skala kecil, pengintai seperti [[Kaelen dari Kabut Perak]] menggunakannya untuk menyamarkan jejak pergerakan kelompoknya; namun bila dirapal bersama oleh para tetua di sekitar Pohon Memori Eldath, teknik ini mampu menelan seluruh lembah hutan dalam perisai ilusi berskala regional.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'skl-palu-gravitasi-dvergr',
      category: 'skill',
      title: 'Runtuhan Palu Bintang Nidavellir',
      subtitle: 'Teknik Kriya-Runik Eksklusif Dvergr · Guncangan Seismik Skala Gunung',
      summary: 'Teknik khusus ras [[Dvergr Besi-Bintang]] yang melepaskan muatan magnetik dan panas geotermal dari palu meteorit ke urat batuan bumi untuk meruntuhkan terowongan atau membelah perbukitan.',
      tags: ['Warisan Rasial', 'Dvergr Besi-Bintang', 'Tempaan Runik'],
      attributes: {
        parentPowerSystem: 'Tempaan Runik Besi-Bintang',
        skillRank: 'Tingkat 4: Penempa Bintang (Pencipta Senjata Pusaka Kerajaan)',
        elementAffinity: 'Kriya Magnetik (Kendali Berat Logam & Perisai Tolak Besi)',
        skillExclusivity: 'Warisan Rasial Eksklusif',
        exclusiveRaces: ['Dvergr Besi-Bintang'],
        impactScale: 'Skala Kota / Lembah (Guncangan Seismik 1,5 Kilometer)',
        strategicImpact:
          'Mampu menutup jalur celah pegunungan secara permanen, meruntuhkan dinding benteng batu dalam satu hentakan resonansi, atau menarik seluruh senjata besi prajurit lawan agar menempel ke tanah.',
        visualManifestation:
          'Ukiran aksara *Khaz-Runa* pada kepala palu meteorit berpijar putih-kebiruan; saat dihantamkan ke tanah, retakan garis geometris bercahaya merambat cepat di sepanjang permukaan batu diikuti gelombang kejut berfrekuensi rendah.',
        activationCost: 'Memerlukan senjata/palu bijih bintang jatuh berukir segel lengkap serta kekuatan tulang fisik Dvergr untuk menahan hentakan balik',
        cooldownOrLimit: 'Laras segel pada palu harus didinginkan dengan oli mineral khusus setelah tiga kali pelepasan agar logam tidak retak.',
      },
      content: `Karena tubuh biologis [[Dvergr Besi-Bintang]] memiliki kepadatan tulang dua kali lipat manusia dan tahan terhadap getaran ekstrem, hanya mereka yang sanggup mengeksekusi **Runtuhan Palu Bintang Nidavellir** tanpa meremukkan tulang lengan sendiri. Teknik dari sistem [[Tempaan Runik Besi-Bintang]] ini menjadi alasan utama mengapa belum pernah ada pasukan permukaan yang berhasil menembus gerbang [[Kerajaan Bawah Tanah Nidavellir]].`,
      updatedAt: '2026-11-08',
    },

    // 9. ENCYCLOPEDIA (Artifacts, Flora, Fauna & Cultural Codex)
    {
      id: 'enc-astrolabe-surya',
      category: 'encyclopedia',
      title: 'Astrolabe Api Surya',
      subtitle: 'Relik Penyeimbang Iklim & Kunci Menara Suar Aethelia',
      summary:
        'Instrumen astronomi kuno dari kuningan meteorit dan rubi cinnabar yang mampu menyimpan energi matahari murni selama berabad-abad.',
      imageUrl: '/src/assets/images/artifact_sunfire_astrolabe_1794157188936.jpg',
      tags: ['Artefak & Pusaka', 'Pemicu Konflik Utama', 'Kriya Dvergr'],
      attributes: {
        subCategory: 'Artefak & Pusaka',
        rarity: 'Artefak Tunggal (1 di Dunia)',
        habitatOrOrigin: 'Kerajaan Bawah Tanah Nidavellir',
        currentHolder: 'Archmage Vaelen Thorne',
        creatorOrOrigin: 'Dvergr Besi-Bintang',
        linkedPowerSystem: 'Resonansi Eteris Astral',
        magicalProperties:
          'Menghapus batasan malam hari pada [[Resonansi Eteris Astral]], memancarkan kubah panas di puncak salju, dan menstabilkan garis patahan lempeng benua.',
        attunementRequirement:
          'Membutuhkan penyelarasan meridian praktisi Lingkar ke-5 ke atas atau kunci segel darah murni [[Dvergr Besi-Bintang]] untuk memutar cincin ketiganya.',
        curseOrSideEffect:
          'Retakan pada cincin ketiganya memancarkan kebocoran radiasi surya yang mempercepat *Kristalisasi Organ* dan telah membutakan mata kiri [[Archmage Vaelen Thorne]].',
        destructionMethod:
          'Hanya dapat dilebur kembali di Tungku Jantung Bintang [[Kerajaan Bawah Tanah Nidavellir]] atau dihantam secara simultan oleh [[Keputusan Tombak Surya]] dan [[Runtuhan Palu Bintang Nidavellir]].',
        ownershipHistory: [
          '1. Raja Penempa Thrain I dari Nidavellir (Tahun 340 Pra-Gerhana)',
          '2. Dinasti Surya Kekaisaran Gondoria (Tahun 338 PG - 410 PG)',
          '3. Archmage Vaelen Thorne di Puncak Wyvern (Tahun 410 PG - Sekarang)',
        ],
        harvestableMaterials: [
          'Inti Rubi Surya Murni',
          'Cincin Kuningan Besi-Bintang',
          'Lensa Fokus Sidereal',
        ],
        alchemicalUses:
          'Debu residu cincinnya dapat dicampur ke dalam tinta segel kekaisaran untuk membuat gulungan perjanjian tahan api.',
      },
      content: `**Astrolabe Api Surya** adalah mahakarya gabungan antara penempa [[Dvergr Besi-Bintang]] dan penyihir perdana [[Kekaisaran Gondoria]]. Artefak ini terdiri dari tiga cincin kuningan berukir konstelasi kuno yang mengitari inti rubi surya.

Dua tahun lalu, [[Archmage Vaelen Thorne]] menemukan retakan halus pada cincin terdalamnya. Jika Astrolabe ini dipaksa menembakkan meriam suar militer seperti yang direncanakan [[Empress Seraphina Valorian]], cincin tersebut akan hancur dan memicu gelombang kedua [[Konvergensi Gerhana Merah]].`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'enc-bunga-lentera',
      category: 'encyclopedia',
      title: 'Bunga Lentera Malam',
      subtitle: 'Flora Bioluminesensi Penawar Kristalisasi Eter',
      summary:
        'Tanaman langka bercahaya perak-kebiruan yang hanya tumbuh di akar pohon purba [[Rimba Bayang-Bayang (Shadowwood)]] dan mampu memperlambat efek kutukan sihir.',
      tags: ['Flora & Herbal', 'Herbal Alkimia', 'Shadowwood'],
      attributes: {
        subCategory: 'Flora & Herbal',
        rarity: 'Sangat Langka / Legendaris',
        habitatOrOrigin: 'Rimba Bayang-Bayang (Shadowwood)',
        currentHolder: 'Sylvan Aelfir',
        creatorOrOrigin: 'Pohon Memori Eldath',
        linkedPowerSystem: 'Resonansi Eteris Astral',
        magicalProperties:
          'Ekstrak kelopaknya melarutkan endapan kristal di pembuluh darah praktisi [[Resonansi Eteris Astral]] serta memulihkan kelelahan saraf akibat paparan kabut ilusi.',
        attunementRequirement:
          'Harus dipetik menggunakan pisau tulang atau perak murni saat cahaya bulan kembar mencapai titik puncak; jika disentuh besi biasa, kelopaknya langsung layu menjadi abu.',
        curseOrSideEffect:
          'Konsumsi berlebih dalam keadaan mentah menyebabkan peminumnya mengalami mimpi halusinasi memori leluhur hutan selama tiga malam berturut-turut.',
        destructionMethod:
          'Sangat rentan terhadap panas api surya cinnabar dan polusi jelaga batu bara uap.',
        ownershipHistory: [
          '1. Dijaga secara turun-temurun oleh Tetua Hutan Sylvan Aelfir',
          '2. Disuplai terbatas ke Ordo Cakrawala Perak melalui Pakta Penjaga Rimba',
          '3. Diselundupkan di pasar gelap oleh Sindikat Gagak Senja',
        ],
        creatureBehavior:
          'Kuncupnya menutup rapat menyerupai kepompong kayu sepanjang siang hari, lalu membuka enam kelopak kaca berpendar biru lembut tepat saat kabut malam turun di sekitar akar Pohon Memori.',
        harvestableMaterials: [
          'Kelopak Bioluminesensi Perak',
          'Nektar Embun Bulan',
          'Serabut Akar Memori',
        ],
        alchemicalUses:
          'Bahan utama **Eliksir Embun Perak** (penawar Kristalisasi Organ), salep penyembuh luka bakar eter, dan dupa fokus meditasi bagi praktisi Jalur Lunar.',
      },
      content: `**Bunga Lentera Malam** mekar hanya ketika cahaya bulan kembar menembus kabut [[Rimba Bayang-Bayang (Shadowwood)]]. Karena kemampuannya meredakan efek *Kristalisasi Organ*, bunga ini menjadi komoditas penyelundupan paling mahal yang diperdagangkan oleh [[Sindikat Gagak Senja]] di pasar gelap [[Kekaisaran Gondoria]].`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'enc-wyvern-sayap-kaca',
      category: 'encyclopedia',
      title: 'Wyvern Sayap-Kaca Utara',
      subtitle: 'Predator Puncak Pegunungan Beku & Pemangsa Kristal Eter',
      summary:
        'Reptil bersayap raksasa penghuni tebing es [[Puncak Wyvern]] yang membran sayapnya tersusun dari serat silika transparan pembias cahaya matahari.',
      tags: ['Fauna & Monster', 'Predator Puncak', 'Puncak Wyvern'],
      attributes: {
        subCategory: 'Fauna & Monster',
        rarity: 'Langka / Terbatas',
        habitatOrOrigin: 'Puncak Wyvern',
        currentHolder: 'Alam Liar Puncak Wyvern',
        creatorOrOrigin: 'Mutasi Eter Pasca-Gerhana Merah',
        linkedPowerSystem: 'Resonansi Eteris Astral',
        magicalProperties:
          'Membran sayap kristalnya mampu membiaskan berkas sihir Jalur Solar sehingga kebal terhadap serangan cahaya biasa, serta mengembuskan napas kabut beku yang membekukan baja dalam hitungan detik.',
        attunementRequirement:
          'Tidak dapat dijinakkan secara penuh; namun [[Ordo Cakrawala Perak]] memasang lonceng frekuensi ultrasonik di sekitar menara agar kawanan Wyvern tidak menyerang observatorium.',
        curseOrSideEffect:
          'Luka gigitan atau cakaran taring Wyvern meninggalkan serpihan kristal mikro yang menghambat aliran meridian korban hingga dicabut secara bedah alkimia.',
        destructionMethod:
          'Titik lemahnya terletak pada kantung resonansi di bawah rahang bawah yang akan pecah bila terkena gelombang kejut seismik atau proyektil besi-bintang berkecepatan tinggi.',
        ownershipHistory: [
          '1. Menguasai tebing utara Puncak Wyvern sejak abad pertama Era Abu',
          '2. Diburu secara terbatas oleh pemburu gilda Valdoria dan Dvergr',
        ],
        creatureBehavior:
          'Berburu secara soliter saat badai salju turun. Wyvern ini tertarik pada pancaran panas eter dari kompas astral, menara suar, atau praktisi sihir yang merapal mantra berskala besar di pegunungan.',
        harvestableMaterials: [
          'Membran Sayap Kaca-Eter',
          'Inti Empedu Es Abadi',
          'Taring Silika Kristal',
          'Sisik Dada Penolak Cahaya',
        ],
        alchemicalUses:
          'Membran sayapnya diolah menjadi lensa teleskop bintang di [[Puncak Wyvern]], sedangkan sisik dadanya ditempa menjadi perisai anti-surya bagi perwira [[Kerajaan Bawah Tanah Nidavellir]].',
      },
      content: `**Wyvern Sayap-Kaca Utara** adalah alasan utama mengapa [[Kekaisaran Gondoria]] tidak berani mengirim armada udara atau pasukan besar mendaki [[Puncak Wyvern]]. Saat terbang di antara awan salju, tubuh mereka nyaris tak kasatmata karena sayap transparan mereka memantulkan warna langit di sekitarnya.`,
      updatedAt: '2026-11-08',
    },
    {
      id: 'enc-aksara-bintang',
      category: 'encyclopedia',
      title: 'Aksara Bintang Aethel & Glif Khaz-Runa',
      subtitle: 'Sistem Penulisan Geometris Kuno, Segel Perjanjian & Bahasa Liturgi Dunia',
      summary:
        'Dua rumpun aksara sakral yang menjadi fondasi seluruh dokumen diplomatik, segel sihir [[Resonansi Eteris Astral]], dan ukiran [[Tempaan Runik Besi-Bintang]].',
      tags: ['Bahasa & Budaya', 'Aksara Kuno', 'Kosmologi'],
      attributes: {
        subCategory: 'Bahasa & Budaya',
        rarity: 'Endemik / Musiman',
        habitatOrOrigin: 'Kekaisaran Gondoria',
        currentHolder: 'Ordo Cakrawala Perak',
        creatorOrOrigin: 'Aethel-Born (Manusia Tinggi)',
        linkedPowerSystem: 'Resonansi Eteris Astral',
        magicalProperties:
          'Setiap huruf dalam Aksara Bintang mewakili sudut inklinasi rasi bintang; jika ditulis menggunakan tinta perak atau diukir pada logam meteorit, kalimatnya mampu mengikat sumpah atau menyalurkan energi eter.',
        attunementRequirement:
          'Memerlukan penguasaan geometri astronomi dan pelafalan nada ganda untuk membaca naskah kuno Era Surya Emas tanpa memicu segel pelindung kertas.',
        curseOrSideEffect:
          'Kesalahan satu goresan sudut pada saat mengukir glif *Khaz-Runa* atau *Aethel* dapat menyebabkan gulungan perjanjian terbakar sendiri atau senjata runik meledak di tangan pemakainya.',
        destructionMethod:
          'Segel aksara pada dokumen perjanjian hanya dapat dibatalkan dengan meneteskan pelarut raksa-bintang di atas tanda tangan kedua belah pihak.',
        ownershipHistory: [
          '1. Aksara Bintang Aethel digunakan oleh istana Gondoria dan Ordo Cakrawala Perak',
          '2. Glif Khaz-Runa dijaga oleh Gilda Empu Kerajaan Bawah Tanah Nidavellir',
          '3. Dialek Sylva-Lir dilestarikan secara lisan oleh bangsa Sylvan Aelfir',
        ],
        creatureBehavior:
          'Digunakan dalam penanggalan kalender Post-Gerhana (PG), kode sandi diplomatik [[Sindikat Gagak Senja]], serta prasasti kuno di dasar Teluk Naga.',
        harvestableMaterials: [
          'Kamus Etimologi Aethel-Sylva',
          'Tabel Konversi Angka Bintang',
          'Segel Lilin Cinnabar Kekaisaran',
        ],
        alchemicalUses:
          'Digunakan oleh para sarjana, kartografer, dan diplomat dalam menyusun traktat antarnegara serta membaca peta peninggalan [[Konvergensi Gerhana Merah]].',
      },
      content: `Di benua Aethelia, bahasa bukan sekadar alat komunikasi melainkan kerangka hukum kekuatan. Para bangsawan [[Kekaisaran Gondoria]] dan sarjana [[Ordo Cakrawala Perak]] menulis menggunakan **Aksara Bintang Aethel**, sedangkan para empu [[Dvergr Besi-Bintang]] memahat **Glif Khaz-Runa** yang kaku dan bersudut tajam di atas baja.`,
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
      notes:
        'Vaelen pernah mendidik Seraphina dalam filsafat astronomi, namun kini berseberangan demi mencegah penyalahgunaan Astrolabe Api Surya.',
      visibilityStatus: 'Publik / Diketahui Umum',
      tensionOrLoyalty: 'Ketegangan Dingin & Rasa Hormat Lama',
      directionality: 'bidirectional',
      originHistory:
        'Terbentuk di Akademi Cakrawala Solis Prime sebelum pecahnya [[Konvergensi Gerhana Merah]], lalu retak ketika Vaelen menolak menyerahkan kunci [[Astrolabe Api Surya]].',
      storyEvolution:
        'Bab 1–2: Perang dingin melalui utusan militer; Bab 3+: Dipaksa berunding kembali saat anomali eter mengancam seluruh benua.',
    },
    {
      id: 'rel-2',
      sourceId: 'char-vaelen',
      targetId: 'fac-ordo-cakrawala',
      type: 'member',
      label: 'Arsiparis Agung & Pimpinan',
      notes: 'Memimpin markas pengasingan Ordo di Puncak Wyvern.',
      visibilityStatus: 'Publik / Diketahui Umum',
      tensionOrLoyalty: 'Sumpah Mati / Tak Terputuskan',
      directionality: 'directed',
      originHistory:
        'Mengambil alih kepemimpinan [[Ordo Cakrawala Perak]] setelah separuh menara observatorium runtuh pada Tahun 0 PG.',
      storyEvolution:
        'Vaelen menyembunyikan rahasia cincin ketiga Astrolabe bahkan dari sebagian dewan mudanya demi keselamatan mereka.',
    },
    {
      id: 'rel-3',
      sourceId: 'char-seraphina',
      targetId: 'nat-gondoria',
      type: 'member',
      label: 'Maharani Penguasa',
      notes:
        'Memegang komando tertinggi atas militer dan senat Kekaisaran Gondoria.',
      visibilityStatus: 'Publik / Diketahui Umum',
      tensionOrLoyalty: 'Otoritas Mutlak namun Ditekan Senat',
      directionality: 'directed',
      originHistory:
        'Naik takhta pada usia muda di [[Ibu Kota Solis Prime]] setelah krisis suksesi Dinasti Valorian.',
      storyEvolution:
        'Berusaha memulihkan kejayaan [[Kekaisaran Gondoria]] sambil menahan kudeta diam-diam para jenderal garis keras.',
    },
    {
      id: 'rel-4',
      sourceId: 'fac-ordo-cakrawala',
      targetId: 'race-aelfir',
      type: 'ally',
      label: 'Pakta Penjaga Rimba',
      notes:
        'Saling bertukar informasi mengenai anomali eter dan suplai Bunga Lentera Malam.',
      visibilityStatus: 'Terselubung / Disamarkan',
      tensionOrLoyalty: 'Aliansi Strategis Saling Percaya',
      directionality: 'bidirectional',
      originHistory:
        'Disepakati di bawah Pohon Memori Eldath di [[Rimba Shadowwood]] untuk menjaga stabilitas meridian alam.',
      storyEvolution:
        'Diperkuat pada Bab 2 ketika utusan [[Sylvan Aelfir]] menyelamatkan kurir Ordo dari sergapan tentara bayaran.',
    },
    {
      id: 'rel-5',
      sourceId: 'nat-gondoria',
      targetId: 'nat-nidavellir',
      type: 'rival',
      label: 'Ultimatum Pengembalian Pusaka',
      notes:
        'Ketegangan dagang dan militer terkait hak kepemilikan Astrolabe Api Surya.',
      visibilityStatus: 'Publik / Diketahui Umum',
      tensionOrLoyalty: 'Ambang Perang Terbuka',
      directionality: 'bidirectional',
      originHistory:
        'Berakar dari pelanggaran [[Traktat Baja-Surya Aethelgard]] setelah Gondoria menolak mengembalikan [[Astrolabe Api Surya]] ke Nidavellir.',
      storyEvolution:
        'Embargo baja runik oleh [[Kerajaan Bawah Tanah Nidavellir]] memicu krisis persenjataan di perbatasan Gondoria.',
    },
    {
      id: 'rel-6',
      sourceId: 'race-dvergr',
      targetId: 'nat-nidavellir',
      type: 'member',
      label: 'Bangsa Pendiri & Penguasa Kubah',
      notes: 'Menguasai tujuh kubah penempaan di jantung gunung.',
      visibilityStatus: 'Publik / Diketahui Umum',
      tensionOrLoyalty: 'Sumpah Mati / Tak Terputuskan',
      directionality: 'directed',
      originHistory:
        'Para leluhur [[Dvergr Besi-Bintang]] memahat kubah pertama Nidavellir ribuan tahun sebelum Era Surya Emas.',
      storyEvolution:
        'Dewan Gilda Empu bersiap mengaktifkan kembali Golem Jantung-Magma jika kedaulatan kubah dilanggar.',
    },
    {
      id: 'rel-7',
      sourceId: 'char-seraphina',
      targetId: 'fac-gagak-senja',
      type: 'vassal',
      label: 'Kontrak Intelijen & Operasi Hitam',
      notes:
        'Istana secara diam-diam menyewa mata-mata Sindikat Gagak Senja untuk melacak pergerakan Vaelen dan mengamankan jalur penyelundupan kristal eter.',
      visibilityStatus: 'Rahasia di Balik Layar (Konspirasi)',
      tensionOrLoyalty: 'Aliansi Taktis / Penuh Curiga',
      directionality: 'directed',
      originHistory:
        'Dimulai melalui pertemuan rahasia di kanal bawah tanah [[Ibu Kota Solis Prime]] tanpa sepengetahuan Senat Agung.',
      storyEvolution:
        'Berisiko menjadi skandal besar di Bab 3 apabila bukti kontrak bersegel maharani jatuh ke tangan oposisi.',
    },
  ],

  nodePositions: [
    { entityId: 'char-vaelen', x: 230, y: 150 },
    { entityId: 'char-seraphina', x: 640, y: 150 },
    { entityId: 'fac-ordo-cakrawala', x: 150, y: 330 },
    { entityId: 'fac-gagak-senja', x: 440, y: 250 },
    { entityId: 'race-aelfir', x: 330, y: 420 },
    { entityId: 'nat-gondoria', x: 740, y: 330 },
    { entityId: 'nat-nidavellir', x: 540, y: 450 },
    { entityId: 'race-dvergr', x: 770, y: 480 },
  ],

  timeline: [
    {
      id: 'time-0a',
      era: 'Era Surya Emas (Pra-Gerhana)',
      year: -340,
      displayDate: 'Tahun 340 Pra-Gerhana',
      seasonOrPhase: 'Titik Balik Matahari Musim Panas',
      title: 'Penempaan Astrolabe Api Surya & Pakta Aethelgard',
      category: 'Penemuan Pusaka',
      summary:
        'Para empu Dvergr Besi-Bintang dan penyihir Kekaisaran Gondoria menempa Astrolabe Api Surya di Kubah Besi Nidavellir untuk menstabilkan jaringan lempeng benua.',
      consequenceImpact:
        'Memulai tiga abad kemakmuran masa keemasan; jaringan menara suar surya berdiri di seluruh kota besar.',
      secretTruthNote:
        'Raja Thrain mengukir segel pengunci rahasia pada cincin ketiga Astrolabe yang hanya dapat dibuka dengan darah murni Dvergr atau tumbal mata penyihir tingkat Sovereign.',
      linkedEntityIds: [
        'hist-traktat-astrolabe',
        'enc-astrolabe-surya',
        'race-dvergr',
        'nat-nidavellir',
        'nat-gondoria',
      ],
      regionName: 'Kerajaan Bawah Tanah Nidavellir',
    },
    {
      id: 'time-0b',
      era: 'Era Surya Emas (Pra-Gerhana)',
      year: -85,
      displayDate: 'Tahun 85 Pra-Gerhana',
      seasonOrPhase: 'Malam Hujan Meteor Perak',
      title: 'Kelahiran & Kebangkitan Meridian Archmage Vaelen Thorne',
      category: 'Kelahiran Tokoh',
      summary:
        'Vaelen Thorne lahir di provinsi utara Gondoria di bawah konjungsi bintang perak dan menunjukkan bakat langka membaca getaran meridian kosmik sejak usia belia.',
      consequenceImpact:
        'Kelak diangkat menjadi Arsiparis Agung termuda dalam sejarah Akademi Cakrawala dan guru bagi putri mahkota Seraphina.',
      secretTruthNote:
        'Garis darah keluarga Thorne diam-diam memiliki keterikatan kuno dengan penjaga hutan Sylvan Aelfir.',
      linkedEntityIds: ['char-vaelen', 'pwr-resonansi-astral', 'nat-gondoria'],
      regionName: 'Kekaisaran Gondoria',
    },
    {
      id: 'time-1',
      era: 'Era Abu (Post-Gerhana)',
      year: 0,
      displayDate: 'Tahun 0 PG · Malam Tanpa Bayangan',
      seasonOrPhase: 'Gerhana Merah Ganda',
      title: 'Bencana Konvergensi Gerhana Merah',
      category: 'Bencana Arcane',
      summary:
        'Eksperimen penarikan energi kosmik terlarang meledak saat gerhana ganda, meruntuhkan ibu kota lama Aethelgard dan menenggelamkan lembah barat menjadi Teluk Naga.',
      consequenceImpact:
        'Runtuhnya dinasti lama, lahirnya kalender Post-Gerhana (PG), dan munculnya kabut spora abadi di Rimba Bayang-Bayang.',
      secretTruthNote:
        'Tragedi ini bukan sabotase bangsa Aelfir seperti yang tertulis di buku sejarah istana, melainkan keserakahan Kanselir Agung Gondoria yang memaksa cincin ketiga Astrolabe melampaui batas.',
      linkedEntityIds: [
        'hist-gerhana-merah',
        'nat-gondoria',
        'race-aelfir',
        'enc-astrolabe-surya',
      ],
      regionName: 'Teluk Naga',
    },
    {
      id: 'time-3',
      era: 'Era Abu (Post-Gerhana)',
      year: 52,
      displayDate: 'Tahun 52 PG · Musim Semi',
      seasonOrPhase: 'Bulan Sabit Pertama',
      title: 'Deklarasi Berdirinya Ordo Cakrawala Perak',
      category: 'Berdirinya Kerajaan',
      summary:
        'Para kartografer dan penyihir astral yang selamat dari Gerhana Merah mendirikan observatorium netral di Puncak Wyvern guna memantau anomali langit.',
      consequenceImpact:
        'Menjadi satu-satunya lembaga pemetaan dan penjaga arsip bintang yang diakui lintas batas negara.',
      secretTruthNote:
        'Ruang bawah tanah observatorium menyimpan salinan asli jurnal ritual Tahun 0 PG yang diburu oleh intelijen Gondoria.',
      linkedEntityIds: ['fac-ordo-cakrawala', 'reg-wyvern-peaks'],
      regionName: 'Puncak Wyvern',
    },
    {
      id: 'time-3b',
      era: 'Era Abu (Post-Gerhana)',
      year: 214,
      displayDate: 'Tahun 214 PG · Musim Gugur',
      seasonOrPhase: 'Angin Barat Lautan Abu',
      title: 'Perang Rantai Besi & Kemerdekaan Valdoria',
      category: 'Peperangan',
      summary:
        'Pemberontakan armada serikat dagang pelabuhan timur yang memutus blokade rantai laut Kekaisaran Gondoria dan mendirikan Republik Maritim Valdoria.',
      consequenceImpact:
        'Kekaisaran Gondoria kehilangan monopoli bea cukai samudra timur; lahirnya Dewan Nakhoda Sembilan.',
      secretTruthNote:
        'Kemenangan Valdoria dibiayai secara rahasia oleh Sindikat Gagak Senja dan pasokan torpedo uap dari klan Dvergr.',
      linkedEntityIds: [
        'hist-perang-rantai-besi',
        'nat-valdoria',
        'nat-gondoria',
        'fac-sindikat-gagak',
      ],
      regionName: 'Pelabuhan Bebas Valdoria',
    },
    {
      id: 'time-4',
      era: 'Era Abu (Post-Gerhana)',
      year: 398,
      displayDate: 'Tahun 398 PG · Musim Panas',
      seasonOrPhase: 'Zenith Surya Tahunan',
      title: 'Penobatan Empress Seraphina Valorian',
      category: 'Berdirinya Kerajaan',
      summary:
        'Seraphina Valorian naik takhta di Solis Prime pada usia muda dan memulai reformasi militer besar-besaran bersama Legiun Cinnabar.',
      consequenceImpact:
        'Kebijakan ekspansionis Gondoria kembali menguat; tekanan diplomatik terhadap Nidavellir dan Puncak Wyvern meningkat tajam.',
      secretTruthNote:
        'Seraphina bersumpah akan menyatukan kembali seluruh pecahan benua sebelum siklus Gerhana Merah kedua tiba.',
      linkedEntityIds: ['char-seraphina', 'nat-gondoria', 'skl-tombak-surya'],
      regionName: 'Solis Prime',
      linkedChapterId: 'chap-2',
    },
    {
      id: 'time-5',
      era: 'Era Abu (Post-Gerhana)',
      year: 410,
      displayDate: 'Tahun 410 PG · Malam Titik Balik Dingin',
      seasonOrPhase: 'Badai Salju Puncak Utara',
      title: 'Pengadilan & Pengasingan Archmage Vaelen Thorne',
      category: 'Peperangan',
      summary:
        'Setelah mengorbankan mata kirinya untuk menghentikan kebocoran cincin Astrolabe Api Surya, Vaelen menolak menyerahkan relik itu kepada takhta dan melarikan diri ke Puncak Wyvern.',
      consequenceImpact:
        'Vaelen dicap sebagai pengkhianat negara; memicu krisis diplomatik yang menjadi pembuka alur cerita utama di Bab 1.',
      secretTruthNote:
        'Jika Vaelen tidak membawa pergi Astrolabe malam itu, pemaksaan aktivasi oleh Senat Solis Prime akan memicu ledakan kedua di jantung ibu kota.',
      linkedEntityIds: [
        'hist-pengasingan-vaelen',
        'char-vaelen',
        'char-seraphina',
        'enc-astrolabe-surya',
        'reg-wyvern-peaks',
      ],
      regionName: 'Puncak Wyvern',
      linkedChapterId: 'chap-1',
    },
  ],

  chapters: [
    {
      id: 'chap-1',
      chapterNumber: 1,
      act: 'Babak I: Bayang-Bayang di Atas Kertas Perkamen',
      title: 'Jarum Kuningan yang Bergetar',
      status: 'Selesai',
      storyDateOrTime: 'Tahun 412 PG · Malam Badai Salju Bulan Kesebelas',
      primaryPov: 'Archmage Vaelen Thorne',
      primaryLocation: 'Puncak Wyvern',
      synopsis:
        'Di puncak menara observatorium yang membeku, Archmage Vaelen Thorne mendapati cincin ketiga Astrolabe Api Surya berputar sendiri saat badai salju melanda Puncak Wyvern.',
      chapterGoal:
        'Memperkenalkan anomali bangkitnya [[Astrolabe Api Surya]] dan memaksa [[Archmage Vaelen Thorne]] meninggalkan menara pengasingannya di [[Puncak Wyvern]].',
      centralConflict:
        'Badai eter membuat mata kuningan Vaelen mengalami perdarahan kristal, sementara kurir [[Sylvan Aelfir]] yang sekarat membawa bukti bahwa pasukan [[Kekaisaran Gondoria]] telah memasuki [[Rimba Bayang-Bayang (Shadowwood)]].',
      endingHookOrTwist:
        'Di balik jubah kurir Aelfir yang gugur, Vaelen menemukan lencana operasi hitam [[Sindikat Gagak Senja]] yang dicap dengan segel pribadi [[Empress Seraphina Valorian]].',
      foreshadowingNotes:
        'Getaran jarum Astrolabe pada frekuensi 7-Oktaf memberi petunjuk awal bahwa segel di dasar Teluk Naga mulai retak.',
      draftNotes: `Udara di Observatorium [[Puncak Wyvern]] cukup dingin untuk membekukan tinta di ujung pena bulu. [[Archmage Vaelen Thorne]] menatap permukaan meja kartografinya; di sana, [[Astrolabe Api Surya]] memancarkan denyut merah samar meskipun malam sedang gelap gulita tanpa bulan.

Menurut hukum [[Resonansi Eteris Astral]], artefak jalur surya seharusnya tertidur di malam hari. Namun jarum penunjuknya terus bergetar menunjuk ke arah tenggara—tepat ke jantung [[Rimba Bayang-Bayang (Shadowwood)]].

Ketika pintu menara digedor dari luar, seekor [[Wyvern Sayap-Kaca Utara]] mendarat darurat di balkon batu dengan penunggang kurir [[Sylvan Aelfir]] yang terluka parah oleh tombak surya.`,
      featuredEntityIds: [
        'char-vaelen',
        'reg-wyvern-peaks',
        'enc-astrolabe-surya',
        'pwr-resonansi-astral',
        'reg-shadowwood',
      ],
      wordCountTarget: 3500,
      currentWordCount: 3420,
      scenes: [
        {
          id: 'sc-1a',
          title: 'Anomali Tengah Malam di Observatorium',
          povCharacter: 'Archmage Vaelen Thorne',
          settingRegion: 'Puncak Wyvern',
          timeOfDay: 'Tengah Malam · Badai Salju',
          summary:
            'Vaelen mencatat pergeseran bintang dan merasakan nyeri hebat pada mata kristal kuningannya saat cincin ketiga Astrolabe berputar sendiri.',
          sceneGoalOrConflict:
            'Menahan lonjakan energi [[Astrolabe Api Surya]] agar tidak terdeteksi oleh menara pengawas [[Kekaisaran Gondoria]].',
          sceneOutcome:
            'Vaelen berhasil meredam pancaran suar dengan glif [[Aksara Bintang Aethel & Glif Khaz-Runa]], namun mengetahui lokasi retakan berada di Shadowwood.',
        },
        {
          id: 'sc-1b',
          title: 'Utusan Bersayap dari Shadowwood',
          povCharacter: 'Archmage Vaelen Thorne',
          settingRegion: 'Puncak Wyvern',
          timeOfDay: 'Menjelang Fajar',
          summary:
            'Seorang kurir Sylvan Aelfir tiba di balkon observatorium dengan luka bakar senjata surya milik Kekaisaran Gondoria.',
          sceneGoalOrConflict:
            'Menyelamatkan nyawa kurir dan menggali informasi sebelum racun abu merenggut kesadarannya.',
          sceneOutcome:
            'Kurir menyerahkan peta jalur rahasia [[Rimba Bayang-Bayang (Shadowwood)]] dan memperingatkan Vaelen tentang perburuan [[Bunga Lentera Malam]].',
        },
      ],
    },
    {
      id: 'chap-2',
      chapterNumber: 2,
      act: 'Babak I: Bayang-Bayang di Atas Kertas Perkamen',
      title: 'Dekrit Segel Merah Solis Prime',
      status: 'Sedang Ditulis',
      storyDateOrTime: 'Tahun 412 PG · Tiga Hari Setelah Anomali Puncak Wyvern',
      primaryPov: 'Empress Seraphina Valorian',
      primaryLocation: 'Ibu Kota Solis Prime',
      synopsis:
        'Empress Seraphina Valorian menghadapi ultimatum utusan Dvergr dari Nidavellir sembari memerintahkan ekspedisi rahasia memburu keberadaan Vaelen.',
      chapterGoal:
        'Memperlihatkan tekanan geopolitik yang dihadapi [[Empress Seraphina Valorian]] di [[Ibu Kota Solis Prime]] serta alasan mendesaknya menguasai kembali [[Astrolabe Api Surya]].',
      centralConflict:
        'Delegasi [[Kerajaan Bawah Tanah Nidavellir]] mengancam embargo baja meteorit berdasarkan [[Traktat Baja-Surya Aethelgard]], sementara Senat menuntut perang terbuka.',
      endingHookOrTwist:
        'Seraphina diam-diam menandatangani surat perintah rahasia kepada [[Sindikat Gagak Senja]] untuk menangkap Vaelen hidup-hidup sebelum Legiun Cinnabar menemukannya.',
      foreshadowingNotes:
        'Luka bakar halus di telapak tangan Seraphina menunjukkan bahwa ia telah berlatih [[Keputusan Tombak Surya]] melampaui batas aman.',
      draftNotes: `Di ruang takhta [[Ibu Kota Solis Prime]], jantung pemerintahan [[Kekaisaran Gondoria]], [[Empress Seraphina Valorian]] membuka gulungan peta perbatasan timur. Utusan dari [[Kerajaan Bawah Tanah Nidavellir]] baru saja mengancam akan menghentikan pasokan baja meteorit jika [[Astrolabe Api Surya]] tidak dikembalikan sebelum musim dingin berakhir.

Seraphina tahu ia tidak bisa menyerahkan relik itu kepada bangsa [[Dvergr Besi-Bintang]]. Tanpa Astrolabe tersebut, teknik [[Keputusan Tombak Surya]] tidak akan cukup kuat menahan gelombang gerhana yang akan datang.`,
      featuredEntityIds: [
        'char-seraphina',
        'nat-gondoria',
        'reg-solis-prime',
        'nat-nidavellir',
        'skl-tombak-surya',
      ],
      wordCountTarget: 4000,
      currentWordCount: 2150,
      scenes: [
        {
          id: 'sc-2a',
          title: 'Sidang Dewan Perang di Solis Prime',
          povCharacter: 'Empress Seraphina Valorian',
          settingRegion: 'Ibu Kota Solis Prime',
          timeOfDay: 'Siang Hari · Zenit Surya',
          summary:
            'Perdebatan sengit antara jenderal Gondoria dan delegasi penempa Dvergr di Aula Senat Surya.',
          sceneGoalOrConflict:
            'Mengulur waktu tuntutan [[Kerajaan Bawah Tanah Nidavellir]] selama 30 hari tanpa memicu perang dua front.',
          sceneOutcome:
            'Delegasi Dvergr memberikan tenggat waktu satu purnama; Seraphina mengerahkan agen bayangan ke utara.',
        },
      ],
    },
    {
      id: 'chap-3',
      chapterNumber: 3,
      act: 'Babak I: Bayang-Bayang di Atas Kertas Perkamen',
      title: 'Kabut Pohon Memori',
      status: 'Rencana',
      storyDateOrTime: 'Tahun 412 PG · Pekan Kedua Bulan Kedua Belas',
      primaryPov: 'Archmage Vaelen Thorne',
      primaryLocation: 'Rimba Bayang-Bayang (Shadowwood)',
      synopsis:
        'Vaelen turun dari Puncak Wyvern menuju Rimba Bayang-Bayang untuk mencari Bunga Lentera Malam dan memeriksa retakan lempeng eter.',
      chapterGoal:
        'Menemukan sarang tumbuh [[Bunga Lentera Malam]] dan bernegosiasi dengan tetua [[Sylvan Aelfir]] di bawah Pohon Memori Eldath.',
      centralConflict:
        'Kanopi hutan yang rapat melemahkan sihir [[Resonansi Eteris Astral]] milik Vaelen tepat ketika skuadron pemburu bayaran menyergap rombongannya.',
      endingHookOrTwist:
        'Pohon Memori Eldath memperlihatkan kilas balik masa lalu yang membuktikan bahwa [[Konvergensi Gerhana Merah]] disengaja oleh pendahulu takhta Gondoria.',
      foreshadowingNotes:
        'Penggunaan [[Langkah Kabut Sylvan]] oleh penjaga hutan memberi petunjuk hubungan darah lama keluarga Thorne dengan Aelfir.',
      draftNotes: `Perjalanan menembus [[Rimba Bayang-Bayang (Shadowwood)]] menguji batas fisik [[Archmage Vaelen Thorne]]. Karena kanopi pohon yang begitu rapat menutup cahaya langit, efisiensi [[Resonansi Eteris Astral]] berkurang drastis sesuai hukum konservasi cahaya. Ia harus mengandalkan cadangan kristal di tongkatnya dan kelopak [[Bunga Lentera Malam]] saat berhadapan dengan patroli perbatasan [[Sylvan Aelfir]].`,
      featuredEntityIds: [
        'char-vaelen',
        'reg-shadowwood',
        'race-aelfir',
        'enc-bunga-lentera',
      ],
      wordCountTarget: 3800,
      currentWordCount: 640,
      scenes: [
        {
          id: 'sc-3a',
          title: 'Gerbang Kabut Perak',
          povCharacter: 'Archmage Vaelen Thorne',
          settingRegion: 'Rimba Bayang-Bayang (Shadowwood)',
          timeOfDay: 'Senja Berkabut',
          summary:
            'Pertemuan menegangkan dengan penjaga perbatasan Sylvan Aelfir dan negosiasi izin masuk menuju Pohon Memori.',
          sceneGoalOrConflict:
            'Meyakinkan komandan pemanah [[Sylvan Aelfir]] bahwa Vaelen bukan lagi utusan [[Kekaisaran Gondoria]].',
          sceneOutcome:
            'Vaelen diizinkan masuk setelah menunjukkan lencana [[Ordo Cakrawala Perak]] dan menyerahkan tongkat senjatanya sementara.',
        },
      ],
    },
  ],
};
