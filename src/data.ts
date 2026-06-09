export const navItems = [
  { label: "Tentang", href: "/tentang" },
  { label: "Layanan", href: "/layanan" },
  { label: "Portofolio", href: "/portofolio" },
  { label: "Proses", href: "/proses" },
  { label: "Lacak Proyek", href: "/lacak-proyek" },
  { label: "Kontak", href: "/kontak" },
];

export const services = [
  {
    number: "01",
    title: "Custom Furniture",
    slug: "custom-furniture",
    summary: "Furnitur lepas dan statement piece yang dibuat sesuai ukuran, material, dan karakter ruang.",
    suitable: "Pemilik hunian, villa, butik, dan ruang privat yang membutuhkan furnitur presisi.",
    deliverables: ["Sketsa arah desain", "Gambar produksi", "Kurasi material", "Finishing sample"],
    process: ["Brief ruang", "Proporsi dan material", "Produksi workshop", "Quality control"],
  },
  {
    number: "02",
    title: "Interior Design",
    slug: "interior-design",
    summary: "Perencanaan interior menyeluruh dengan bahasa ruang yang tenang, hangat, dan tahan lama.",
    suitable: "Residensial baru, renovasi ruang utama, suite privat, dan ruang representatif.",
    deliverables: ["Mood direction", "Layout", "Material board", "Styling direction"],
    process: ["Konsultasi", "Konsep desain", "Revisi terarah", "Finalisasi dokumen"],
  },
  {
    number: "03",
    title: "Built-in Furniture",
    slug: "built-in-furniture",
    summary: "Kabinet, wardrobe, kitchen, panel dinding, dan storage yang menyatu dengan arsitektur ruang.",
    suitable: "Ruang yang membutuhkan penyimpanan rapi tanpa mengorbankan proporsi visual.",
    deliverables: ["Pengukuran", "Shop drawing", "Material specification", "Instalasi"],
    process: ["Site survey", "Detail teknis", "Produksi", "Pemasangan"],
  },
  {
    number: "04",
    title: "Residential Projects",
    slug: "residential-projects",
    summary: "Pendampingan desain dan furnitur untuk rumah, apartemen, villa, dan kediaman privat.",
    suitable: "Klien yang ingin hunian terasa personal, rapi, dan matang sejak awal.",
    deliverables: ["Konsep ruang", "Pilihan furnitur", "Koordinasi material", "Styling akhir"],
    process: ["Mendengar kebutuhan", "Menyusun konsep", "Produksi terukur", "Serah terima"],
  },
  {
    number: "05",
    title: "Commercial Projects",
    slug: "commercial-projects",
    summary: "Interior dan furnitur untuk butik, lounge, kantor privat, hospitality, dan ruang brand.",
    suitable: "Bisnis yang membutuhkan pengalaman ruang premium dan konsisten dengan identitas brand.",
    deliverables: ["Brand spatial direction", "Furnitur kustom", "Fixture", "Installation guide"],
    process: ["Brand brief", "Konsep pengalaman", "Prototype detail", "Implementasi"],
  },
  {
    number: "06",
    title: "Space Planning",
    slug: "space-planning",
    summary: "Studi alur, proporsi, cahaya, dan fungsi agar ruang bekerja halus sebelum masuk produksi.",
    suitable: "Ruang terbatas, layout baru, renovasi bertahap, dan proyek yang butuh keputusan awal.",
    deliverables: ["Layout options", "Zoning", "Flow study", "Furniture scale guide"],
    process: ["Analisis ruang", "Alternatif layout", "Diskusi", "Arahan final"],
  },
];

export const portfolioProjects = [
  {
    slug: "residensi-senja",
    title: "Residensi Senja",
    type: "Interior residensial",
    category: "Residensial",
    year: "2026",
    location: "Jakarta Selatan",
    tone: "from-[#efe8da] via-[#c9c1b3] to-[#282723]",
    concept: "Hunian keluarga dengan ruang publik yang teduh, garis rendah, dan transisi material yang lembut.",
    materials: ["Travertine honed", "Linen ivory", "Charcoal metal", "Oak veneer ringan"],
    challenge: "Menyatukan ruang keluarga dan ruang makan agar terasa terbuka tanpa kehilangan kehangatan privat.",
    solution: "AMBARA merancang furnitur rendah, kabinet built-in tipis, dan palet material yang bergerak pelan dari ivory ke stone gray.",
  },
  {
    slug: "villa-aksara",
    title: "Villa Aksara",
    type: "Furnitur kustom",
    category: "Villa",
    year: "2025",
    location: "Bali",
    tone: "from-[#f7f2e8] via-[#bdb8ae] to-[#c8a86a]",
    concept: "Villa tropis kontemporer dengan furnitur kustom yang ringan, terukur, dan tidak menutup arsitektur.",
    materials: ["Stone gray plaster", "Brushed champagne metal", "Outdoor-grade fabric", "Natural woven detail"],
    challenge: "Menghadirkan furnitur yang kuat untuk iklim villa tanpa terasa berat secara visual.",
    solution: "Setiap modul dibuat dengan struktur tahan lembap, siluet bersih, dan aksen metal tipis untuk memberi rasa premium.",
  },
  {
    slug: "studio-nara",
    title: "Studio Nara",
    type: "Commercial studio",
    category: "Komersial",
    year: "2025",
    location: "Bandung",
    tone: "from-[#e9e1d3] via-[#f9f6ef] to-[#171717]",
    concept: "Ruang konsultasi dan display yang terasa seperti galeri kecil, bukan showroom yang ramai.",
    materials: ["Matte plaster", "Blackened steel", "Textured glass", "Champagne trim"],
    challenge: "Membuat ruang komersial tetap fungsional, tetapi memiliki keheningan seperti studio desain privat.",
    solution: "Layout dibuat bertahap: area penerima, meja konsultasi, display material, dan ruang diskusi yang saling terhubung.",
  },
  {
    slug: "suite-dharma",
    title: "Suite Dharma",
    type: "Kurasi interior",
    category: "Hospitality",
    year: "2024",
    location: "Yogyakarta",
    tone: "from-[#fbf8f0] via-[#d7d0c2] to-[#77736a]",
    concept: "Suite tenang dengan layer tekstur tipis, pencahayaan rendah, dan furnitur berproporsi hotel butik.",
    materials: ["Boucle fabric", "Warm ivory wall", "Smoked mirror", "Soft stone top"],
    challenge: "Mengubah suite compact agar terasa luas, hangat, dan tetap mudah dirawat.",
    solution: "AMBARA memilih storage tertanam, meja melayang, dan pencahayaan indirect untuk menjaga ruang tetap ringan.",
  },
  {
    slug: "rumah-ambar",
    title: "Rumah Ambar",
    type: "Built-in furniture",
    category: "Residensial",
    year: "2024",
    location: "Surabaya",
    tone: "from-[#e4ded3] via-[#bdb8ae] to-[#2b2a27]",
    concept: "Rumah urban dengan storage tertutup, garis kabinet rapi, dan ruang utama yang tidak terasa penuh.",
    materials: ["Lacquer matte", "Stone laminate", "Linen panel", "Slim black handle"],
    challenge: "Menyimpan banyak kebutuhan keluarga tanpa membuat ruang tampak padat.",
    solution: "Kami membuat sistem built-in dari foyer sampai pantry dengan ritme garis yang konsisten.",
  },
];

export const processSteps = [
  "Konsultasi",
  "Pengukuran",
  "Konsep Desain",
  "Revisi",
  "Persetujuan",
  "Produksi",
  "Finishing",
  "Pengiriman",
  "Instalasi",
  "Serah Terima",
];

export const trackingStages = [
  "Konsultasi",
  "Konsep Desain",
  "Revisi",
  "Persetujuan",
  "Produksi",
  "Finishing",
  "Pengiriman",
  "Instalasi",
  "Selesai",
];

export const materialNotes = [
  "Kurasi material",
  "Detail finishing",
  "Harmoni ruang",
  "Konstruksi tahan lama",
];

export const whyAmbara = [
  "Desain personal sesuai ruang",
  "Produksi terukur",
  "Material terkurasi",
  "Komunikasi proyek yang jelas",
  "Hasil akhir rapi dan tahan lama",
];

export const featuredProject = {
  slug: "residensi-senja",
  name: "Residensi Senja",
  type: "Interior residensial dan built-in furniture",
  year: "2026",
  location: "Jakarta Selatan",
  area: "185 m2",
  mainMaterial: "Travertine honed, linen ivory, charcoal metal",
  duration: "14 minggu",
  story:
    "Sebuah rumah keluarga yang dirancang agar ruang publik terasa lapang, tenang, dan tetap hangat saat digunakan setiap hari. Furnitur dibuat rendah, storage disembunyikan di garis arsitektur, dan material dipilih agar cahaya pagi bergerak lembut di permukaan ruang.",
  tone: "from-[#f8f3ea] via-[#c9c1b3] to-[#24231f]",
};

export const finishingDetails = [
  {
    title: "Solid wood",
    body: "Dipilih untuk bagian yang membutuhkan struktur kuat, sentuhan natural, dan karakter material yang bertambah matang seiring waktu.",
  },
  {
    title: "HPL premium",
    body: "Solusi rapi dan tahan pakai untuk kabinet harian, dengan pilihan tekstur yang tetap tenang dan mudah dirawat.",
  },
  {
    title: "Veneer",
    body: "Memberi kedalaman serat kayu yang lebih halus pada panel, meja, dan bidang besar tanpa membuat ruang terasa berat.",
  },
  {
    title: "Marble finish",
    body: "Digunakan sebagai aksen permukaan untuk menghadirkan rasa stone yang elegan, terukur, dan tidak berlebihan.",
  },
  {
    title: "Metal accent",
    body: "Detail tipis pada kaki, handle, trim, atau sambungan untuk memberi struktur visual dan sentuhan champagne yang premium.",
  },
  {
    title: "Soft-close hardware",
    body: "Hardware dipilih untuk gerak yang halus, senyap, dan konsisten, terutama pada kabinet, drawer, dan built-in storage.",
  },
];

export const faqItems = [
  {
    question: "Apakah bisa custom ukuran?",
    answer: "Bisa. Setiap furnitur dan built-in dapat disesuaikan dengan ukuran ruang, kebutuhan penyimpanan, proporsi visual, dan kebiasaan penggunaan harian.",
  },
  {
    question: "Apakah Ambara menerima proyek luar kota?",
    answer: "Bisa untuk proyek tertentu. Tim akan meninjau lokasi, skala pekerjaan, kebutuhan pengukuran, pengiriman, dan instalasi sebelum memberikan rekomendasi alur kerja.",
  },
  {
    question: "Berapa lama proses pengerjaan?",
    answer: "Durasi bergantung pada lingkup desain, jumlah item, kompleksitas detail, dan ketersediaan material. Proyek furnitur biasanya lebih singkat dibanding interior menyeluruh.",
  },
  {
    question: "Apakah bisa konsultasi terlebih dahulu?",
    answer: "Bisa. Konsultasi awal membantu membaca kebutuhan ruang, prioritas budget, timeline, dan arah desain sebelum masuk ke tahap konsep atau produksi.",
  },
  {
    question: "Apakah desain bisa direvisi?",
    answer: "Bisa. Revisi dilakukan secara terarah agar keputusan desain tetap rapi, tidak melebar, dan tetap sesuai dengan karakter ruang yang ingin dibangun.",
  },
  {
    question: "Apakah tersedia instalasi?",
    answer: "Tersedia untuk built-in, interior, dan furnitur tertentu. Instalasi direncanakan agar pengiriman, pemasangan, dan pengecekan akhir berjalan tertib.",
  },
  {
    question: "Apakah bisa menyesuaikan budget?",
    answer: "Bisa. Tim akan membantu memilah prioritas material, finishing, dan lingkup pekerjaan agar hasil tetap terasa premium dalam batas anggaran yang realistis.",
  },
];

export const moodOptions = [
  {
    name: "Minimal Modern",
    description: "Ruang bersih dengan garis tipis, storage tersembunyi, dan komposisi yang tidak banyak berbicara.",
    direction: "Ivory, stone gray, charcoal accent, panel matte, metal tipis.",
    service: "Interior Design dan Built-in Furniture",
  },
  {
    name: "Japandi",
    description: "Hangat, ringan, dan tertata. Cocok untuk hunian yang ingin terasa natural tanpa menjadi terlalu rustic.",
    direction: "Linen, veneer terang, tekstur woven, stone lembut.",
    service: "Residential Projects dan Custom Furniture",
  },
  {
    name: "Luxury Contemporary",
    description: "Elegan dengan detail material lebih tegas, tetap tenang, dan cocok untuk ruang representatif.",
    direction: "Charcoal, champagne metal, marble finish, glass detail.",
    service: "Interior Design dan Commercial Projects",
  },
  {
    name: "Warm Natural",
    description: "Ruang yang terasa dekat, nyaman, dan berlapis melalui material natural yang dikurasi.",
    direction: "Ivory hangat, veneer, kain linen, aksen stone.",
    service: "Custom Furniture dan Residential Projects",
  },
  {
    name: "Compact Living",
    description: "Solusi untuk ruang terbatas yang butuh storage rapi, flow jelas, dan furnitur multifungsi.",
    direction: "Panel terang, hardware soft-close, built-in storage, tone ringan.",
    service: "Space Planning dan Built-in Furniture",
  },
  {
    name: "Commercial Elegant",
    description: "Ruang brand, studio, butik, atau kantor privat yang perlu terasa profesional dan berkelas.",
    direction: "Charcoal, stone gray, champagne trim, lighting aksen.",
    service: "Commercial Projects dan Interior Design",
  },
  {
    name: "Lainnya",
    description:
      "Ceritakan referensi dan kebutuhan ruang Anda, tim Ambara akan membantu menerjemahkannya menjadi arah desain yang lebih personal.",
    direction: "Arah material dan warna disusun setelah membaca ruang, fungsi, dan preferensi Anda.",
    service: "Konsultasi awal AMBARA",
  },
];
