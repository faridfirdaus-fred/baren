export interface NavItem {
  label: string
  href: string
  hasMenu?: boolean
  external?: boolean
}

export interface NewsItem {
  category: string
  date: string
  title: string
  href: string
}

export interface FeatureItem {
  index: string
  title: string
  description: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface SocialItem {
  label: string
  href: string
  icon: 'instagram' | 'youtube' | 'discord' | 'tiktok'
}

export interface LegalLink {
  label: string
  href: string
}

export interface HeroContent {
  tagline: string
  ctaLabel: string
  ctaHref: string
  platforms: string[]
  platformsNote: string
}

export interface TextSection {
  eyebrow: string
  title: string
  subtitle: string
  paragraphs: string[]
  ctaLabel: string
  ctaHref: string
}

export interface EventContent extends TextSection {
  eyebrow: string
}

export const site = {
  name: 'BAREN',
  tagline: 'Rebut benteng. Kuasai arena.',
  description:
    'BAREN adalah game aksi tim 5v5 yang terinspirasi dari permainan tradisional benteng-bentengan.',
  email: 'halo@baren.game',
}

export const nav: NavItem[] = [
  { label: 'INFO GAME', href: '#fitur', hasMenu: true },
  { label: 'MEDIA', href: '#galeri', hasMenu: true },
  { label: 'ARTIKEL', href: '#berita' },
  { label: 'SUPPORT', href: '#faq', hasMenu: true },
  { label: 'MEDIA SOSIAL', href: '#kontak', hasMenu: true },
  { label: 'ESPORTS', href: 'https://esports.example.com', external: true },
  { label: 'LEBIH BANYAK', href: '#kontak', hasMenu: true },
]

export const hero: HeroContent = {
  tagline: 'BAREN — GAME AKSI TIM 5V5 TERINSPIRASI BENTENG-BENTENGAN',
  ctaLabel: 'MAIN GRATIS',
  ctaHref: '#daftar',
  platforms: ['Steam', 'Play Store', 'App Store'],
  platformsNote: 'Segera Hadir',
}

export const news: NewsItem[] = [
  {
    category: 'ESPORTS',
    date: '23/9/2026',
    title: 'Turnamen Baren Nusantara: Jadwal dan Hadiah',
    href: '#berita',
  },
  {
    category: 'PENGUMUMAN',
    date: '22/9/2026',
    title: 'Main dengan Respek',
    href: '#berita',
  },
  {
    category: 'PEMBARUAN GAME',
    date: '22/9/2026',
    title: 'Catatan Patch Baren 0.9',
    href: '#berita',
  },
]

export const event: EventContent = {
  eyebrow: 'TURNAMEN',
  title: 'TURNAMEN BENTENG NUSANTARA',
  subtitle: '',
  paragraphs: [
    'Saksikan tim-tim terbaik dari seluruh nusantara berebut benteng utama. Babak penyisihan berlangsung 24 September hingga 18 Oktober.',
  ],
  ctaLabel: 'TONTON SEKARANG',
  ctaHref: '#',
}

export const about: TextSection = {
  eyebrow: 'TENTANG GAME',
  title: 'KAMI BAREN',
  subtitle: 'TAKUKAN BATAS, REBUT BENTENG',
  paragraphs: [
    'BAREN menghidupkan kembali semangat permainan benteng-bentengan dalam arena aksi tim yang cepat, kompetitif, dan penuh strategi. Serang benteng lawan, lindungi wilayahmu, dan jadilah tim terakhir yang berdiri.',
    'Setiap pertandingan berlangsung selama 13 ronde. Setiap pemain hanya memiliki satu nyawa di tiap ronde, sehingga setiap keputusan, keberanian, dan kerja sama dapat menentukan kemenangan.',
  ],
  ctaLabel: 'TONTON SEKARANG',
  ctaHref: '#',
}

export const features: FeatureItem[] = [
  {
    index: '01',
    title: 'PERTAHANKAN BENTENGMU',
    description: 'Susun pertahanan, baca pergerakan lawan, dan lindungi benteng sampai ronde terakhir.',
  },
  {
    index: '02',
    title: 'KERJA SAMA TIM 5V5',
    description: 'Gabungkan kemampuan setiap pemain untuk menciptakan serangan dan strategi yang tak terduga.',
  },
  {
    index: '03',
    title: 'PETA ARENA BERAGAM',
    description: 'Kuasai jalur, sudut, dan rahasia setiap arena untuk mengubah medan menjadi keunggulanmu.',
  },
]

export const agents: TextSection = {
  eyebrow: 'KARAKTER',
  title: 'PEMAIN',
  subtitle: 'KREATIVITAS ADALAH SENJATA TERBAIKMU',
  paragraphs: [
    'Pilih pemain dengan peran dan gaya bermain yang sesuai dengan strategimu. Setiap kemampuan membuka cara baru untuk menyerang, bertahan, dan membantu tim merebut benteng.',
  ],
  ctaLabel: 'LIHAT SEMUA PEMAIN',
  ctaHref: '#',
}

export const maps: TextSection = {
  eyebrow: 'LOKASI',
  title: 'ARENA',
  subtitle: 'BERTEMPUR DI SELURUH BELAHAN DUNIA',
  paragraphs: [
    'Jelajahi arena-arena dengan karakter dan tantangan yang berbeda. Kenali setiap jalur, manfaatkan lingkungan, dan jadikan peta sebagai bagian dari strategimu.',
  ],
  ctaLabel: 'LIHAT SEMUA ARENA',
  ctaHref: '#',
}

export const faqs: FaqItem[] = [
  { question: 'Kapan BAREN dirilis?', answer: 'BAREN sedang dalam tahap pengembangan dan akan segera hadir. Ikuti waiting list untuk mendapatkan kabar terbaru.' },
  { question: 'BAREN tersedia di platform apa?', answer: 'BAREN akan hadir di Steam, Play Store, dan App Store.' },
  { question: 'Apakah BAREN bisa dimainkan gratis?', answer: 'BAREN dirancang sebagai game aksi tim 5v5 yang dapat dimainkan gratis.' },
  { question: 'Bagaimana cara ikut waiting list?', answer: 'Klik tombol Gabung Waiting List dan isi alamat emailmu untuk menerima informasi akses awal.' },
]

export const social: SocialItem[] = [
  { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
  { label: 'YouTube', href: 'https://youtube.com/', icon: 'youtube' },
  { label: 'Discord', href: 'https://discord.com/', icon: 'discord' },
  { label: 'TikTok', href: 'https://tiktok.com/', icon: 'tiktok' },
]

export const legalLinks: LegalLink[] = [
  { label: 'KEBIJAKAN PRIVASI', href: '#' },
  { label: 'KETENTUAN PENGGUNAAN', href: '#' },
  { label: 'PREFERENSI COOKIE', href: '#' },
]

export const cta = {
  login: 'LOGIN',
  joinWaitlist: 'GABUNG WAITING LIST',
  newsAll: 'BUKA HALAMAN ARTIKEL',
}
