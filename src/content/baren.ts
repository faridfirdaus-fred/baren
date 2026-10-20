export interface NavItem {
  label: string;
  href: string;
  hasMenu?: boolean;
  external?: boolean;
}

export interface LegalLink {
  label: string;
  href: string;
}

export interface TextSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface EventContent extends TextSection {
  eyebrow: string;
}

export const site = {
  name: "BAREN",
  tagline: "Rebut benteng. Kuasai arena.",
  description:
    "BAREN adalah game aksi tim 5v5 yang terinspirasi dari permainan tradisional benteng-bentengan.",
  email: "halo@baren.game",
};

export const nav: NavItem[] = [
  { label: "INFO GAME", href: "#fitur" },
  { label: "CARA MAIN", href: "#cara-main" },
  { label: "ARTIKEL", href: "#berita" },
  { label: "FAQ", href: "#faq" },
  { label: "GALERI", href: "#galeri" },
];

export const event: EventContent = {
  eyebrow: "TURNAMEN",
  title: "TURNAMEN BENTENG NUSANTARA",
  subtitle: "",
  paragraphs: [
    "Saksikan tim-tim terbaik dari seluruh nusantara berebut benteng utama. Babak penyisihan berlangsung 24 September hingga 18 Oktober.",
  ],
  ctaLabel: "TONTON SEKARANG",
  ctaHref: "#",
};

export const about: TextSection = {
  eyebrow: "TENTANG GAME",
  title: "KAMI BAREN",
  subtitle: "TAKUKAN BATAS, REBUT BENTENG",
  paragraphs: [
    "BAREN menghidupkan kembali semangat permainan benteng-bentengan dalam arena aksi tim yang cepat, kompetitif, dan penuh strategi. Serang benteng lawan, lindungi wilayahmu, dan jadilah tim terakhir yang berdiri.",
    "Setiap pertandingan berlangsung selama 13 ronde. Setiap pemain hanya memiliki satu nyawa di tiap ronde, sehingga setiap keputusan, keberanian, dan kerja sama dapat menentukan kemenangan.",
  ],
  ctaLabel: "TONTON SEKARANG",
  ctaHref: "#",
};

export const agents: TextSection = {
  eyebrow: "KARAKTER",
  title: "PEMAIN",
  subtitle: "KREATIVITAS ADALAH SENJATA TERBAIKMU",
  paragraphs: [
    "Pilih pemain dengan peran dan gaya bermain yang sesuai dengan strategimu. Setiap kemampuan membuka cara baru untuk menyerang, bertahan, dan membantu tim merebut benteng.",
  ],
  ctaLabel: "LIHAT SEMUA PEMAIN",
  ctaHref: "#",
};

export const maps: TextSection = {
  eyebrow: "LOKASI",
  title: "ARENA",
  subtitle: "BERTEMPUR DI SELURUH BELAHAN DUNIA",
  paragraphs: [
    "Jelajahi arena-arena dengan karakter dan tantangan yang berbeda. Kenali setiap jalur, manfaatkan lingkungan, dan jadikan peta sebagai bagian dari strategimu.",
  ],
  ctaLabel: "LIHAT SEMUA ARENA",
  ctaHref: "#",
};

export const legalLinks: LegalLink[] = [
  { label: "KEBIJAKAN PRIVASI", href: "/kebijakan-privasi" },
  { label: "KETENTUAN PENGGUNAAN", href: "/ketentuan-penggunaan" },
];

export const cta = {
  login: "MASUK",
  joinWishlist: "GABUNG WISHLIST",
  newsAll: "BUKA HALAMAN ARTIKEL",
};
