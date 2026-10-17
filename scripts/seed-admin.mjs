// E1-5 & E14-1: seed idempoten settings + admin + hero via SQL langsung (psql-compatible).
// Driver @neondatabase/serverless HTTP gagal fetch di sandbox ini, maka seed
// memakai postgres.js? Tidak — memakai `psql` CLI bila tersedia, fallback
// pg via dynamic import bila ada. Kredensial hanya via env (tidak hardcode).
import { execFileSync } from "node:child_process";
import bcrypt from "bcryptjs";

const url = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("NEON_DATABASE_URL is not set");
const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
const name =
  (process.env.ADMIN_NAME ?? "Administrator").trim() || "Administrator";
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
  throw new Error("ADMIN_EMAIL tidak valid");
if (password.length < 8) throw new Error("ADMIN_PASSWORD minimal 8 karakter");

const hash = await bcrypt.hash(password, 10);
const esc = (s) => s.replace(/'/g, "''");

const settingsValues = [
  ["nama_game", "BAREN"],
  ["tagline", "Rebut benteng. Kuasai arena."],
  ["email_kontak", "halo@baren.game"],
  ["features_eyebrow", "KEUNGGULAN"],
  ["features_title", "FITUR UTAMA"],
  [
    "features_empty_message",
    "Fitur belum tersedia. Tambahkan melalui panel admin.",
  ],
  ["how_to_play_title", "CARA BERMAIN"],
  ["gallery_eyebrow", "MEDIA RESMI"],
  ["gallery_title", "GALERI & AKSI"],
  [
    "gallery_description",
    "Tangkapan layar, ilustrasi konsep, dan video cuplikan arena pertempuran BAREN langsung dari studio pengembangan.",
  ],
  ["gallery_empty_title", "Segera Hadir"],
  [
    "gallery_empty_message",
    "Media resmi BAREN sedang disiapkan. Kunjungi kembali saat pembaruan dibuka.",
  ],
  ["news_title", "ARTIKEL TERBARU"],
  ["news_cta_label", "LIHAT SEMUA BERITA"],
  ["faq_eyebrow", "PERTANYAAN UMUM"],
  ["faq_title", "SEMUA YANG PERLU KAMU KETAHUI"],
  ["comments_title", "KOMENTAR KOMUNITAS"],
  [
    "comments_login_prompt",
    "Masuk dengan akun Google untuk meninggalkan komentar dan bergabung dalam diskusi komunitas BAREN.",
  ],
  [
    "comments_empty_message",
    "Belum ada komentar. Jadilah yang pertama memberikan masukan!",
  ],
  ["comments_submit_label", "KIRIM KOMENTAR"],
  ["comments_submit_error", "Gagal mengirim komentar. Silakan coba lagi."],
  ["contact_eyebrow", "HUBUNGI KAMI"],
  ["contact_title", "TETAP TERHUBUNG"],
  [
    "contact_description",
    "Punya pertanyaan seputar game, kemitraan, atau ingin bergabung dalam komunitas? Hubungi kami langsung melalui email atau saluran media sosial resmi.",
  ],
  ["contact_email_label", "EMAIL RESMI"],
  ["contact_social_title", "IKUTI MEDIA SOSIAL"],
  [
    "contact_social_empty_message",
    "Saluran media sosial resmi akan segera diumumkan.",
  ],
]
  .map(([k, v]) => `('${esc(k)}', '${esc(v)}')`)
  .join(",");

const sql = `INSERT INTO site_settings ("key", value) VALUES ${settingsValues} ON CONFLICT ("key") DO NOTHING;
INSERT INTO users (id, name, email, role, password_hash) VALUES (gen_random_uuid(), '${esc(name)}', '${esc(email)}', 'admin', '${esc(hash)}') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role='admin', password_hash=EXCLUDED.password_hash;
INSERT INTO hero (title, subtitle, background_url, video_url, primary_cta_label, primary_cta_url, is_published)
SELECT 'Rebut benteng. Kuasai arena.', 'Game aksi taktis multipemain berlatar benteng nusantara.', '/media/hero-poster.jpg', '/media/hero-loop.mp4', 'GABUNG WISHLIST', '#daftar', 1
WHERE NOT EXISTS (SELECT 1 FROM hero);`;

try {
  execFileSync("psql", [url, "-v", "ON_ERROR_STOP=1", "-c", sql], {
    stdio: "inherit",
  });
  console.log(`seed ok (idempoten): ${email}`);
} catch (error) {
  console.error("seed gagal via psql:", error.message);
  process.exit(1);
}
