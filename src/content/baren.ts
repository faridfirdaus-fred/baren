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

export const site = {
  name: "BAREN",
  tagline: "Lari, sembunyi, dan rebut benteng lawan bersama sahabatmu!",
  description:
    "Party game lokal 2 vs 2 terinspirasi permainan tradisional Baren atau Bebentengan.",
  email: "halo@baren.game",
};

export const nav: NavItem[] = [
  { label: "BERANDA", href: "/#top" },
  { label: "TENTANG", href: "/#tentang" },
  { label: "FITUR", href: "/#fitur" },
  { label: "JAGOAN", href: "/#karakter" },
  { label: "CARA MAIN", href: "/#cara-main" },
  { label: "GALERI", href: "/#galeri" },
  { label: "BERITA", href: "/#berita" },
  { label: "FAQ", href: "/#faq" },
  { label: "KOMENTAR", href: "/#komentar" },
];

export const legalLinks: LegalLink[] = [
  { label: "KEBIJAKAN PRIVASI", href: "/kebijakan-privasi" },
  { label: "KETENTUAN PENGGUNAAN", href: "/ketentuan-penggunaan" },
];

export const cta = {
  login: "MASUK",
  joinWishlist: "GABUNG WISHLIST",
  newsAll: "SEMUA BERITA",
};
