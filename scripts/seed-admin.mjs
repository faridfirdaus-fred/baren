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
  ["tagline", "Lari, sembunyi, dan rebut benteng lawan bersama sahabatmu!"],
  ["email_kontak", "halo@baren.game"],
  ["features_eyebrow", "FITUR GAME"],
  ["features_title", "Kenapa BAREN seru dimainkan?"],
  ["features_empty_message", "Fitur permainan sedang disiapkan."],
  ["how_to_play_title", "Mudah dipelajari dalam semenit"],
  ["gallery_eyebrow", "GALERI"],
  ["gallery_title", "Intip serunya kampung BAREN"],
  [
    "gallery_description",
    "Tangkapan layar langsung dari arena permainan dan keseruan acara komunitas BAREN.",
  ],
  ["gallery_empty_title", "Segera Hadir"],
  ["gallery_empty_message", "Dokumentasi visual BAREN sedang disiapkan."],
  ["news_title", "Kabar & Event BAREN"],
  ["news_cta_label", "Semua Berita"],
  ["faq_eyebrow", "FAQ"],
  ["faq_title", "Pertanyaan yang sering muncul"],
  ["comments_title", "Bagaimana pendapatmu?"],
  ["comments_login_prompt", "Masuk dengan Google untuk meninggalkan komentar"],
  [
    "comments_empty_message",
    "Belum ada komentar. Jadilah yang pertama memberikan masukan!",
  ],
  ["comments_submit_label", "Kirim"],
  ["comments_submit_error", "Gagal mengirim komentar. Silakan coba lagi."],
]
  .map(([k, v]) => `('${esc(k)}', '${esc(v)}')`)
  .join(",");

const sql = `INSERT INTO site_settings ("key", value) VALUES ${settingsValues} ON CONFLICT ("key") DO NOTHING;
INSERT INTO users (id, name, email, role, password_hash) VALUES (gen_random_uuid(), '${esc(name)}', '${esc(email)}', 'admin', '${esc(hash)}') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role='admin', password_hash=EXCLUDED.password_hash;
INSERT INTO hero (title, subtitle, background_url, video_url, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url, is_published)
SELECT 'Lari, sembunyi, dan rebut benteng lawan!', 'Party game lokal 2 vs 2 yang mengadaptasi keseruan permainan tradisional Baren/Bebentengan ke satu layar bersama.', '/media/hero-poster.jpg', '/media/hero-loop.mp4', 'Gabung Wishlist', '#daftar', 'Cara Bermain', '#cara-main', 1
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
