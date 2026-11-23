import type { Metadata } from "next";
import { Anton, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display-custom",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BAREN | Party Game Lokal 2 vs 2 Nusantara",
  description:
    "Party game lokal 2 vs 2 terinspirasi permainan tradisional Baren atau Bebentengan. Lari, sembunyi, dan rebut benteng lawan bersama sahabatmu!",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://baren.example.com",
  ),
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "BAREN | Party Game Lokal 2 vs 2 Nusantara",
    description:
      "Party game lokal 2 vs 2 terinspirasi permainan tradisional Baren atau Bebentengan. Lari, sembunyi, dan rebut benteng lawan bersama sahabatmu!",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${anton.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
