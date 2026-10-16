import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BAREN | Rebut benteng. Kuasai arena.",
  description: "BAREN adalah game aksi tim 5v5 terinspirasi benteng-bentengan.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://baren.example.com"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "BAREN | Rebut benteng. Kuasai arena.",
    description: "BAREN adalah game aksi tim 5v5 terinspirasi benteng-bentengan.",
  },
  twitter: {
    card: "summary_large_image",
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
      className={`${inter.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
