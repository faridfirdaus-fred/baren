// E1-5: seed idempoten settings + admin via SQL langsung (psql-compatible).
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
const sql = `INSERT INTO site_settings ("key", value) VALUES ('nama_game','BAREN'),('tagline','Rebut benteng. Kuasai arena.'),('email_kontak','halo@baren.game') ON CONFLICT ("key") DO NOTHING;
INSERT INTO users (id, name, email, role, password_hash) VALUES (gen_random_uuid(), '${esc(name)}', '${esc(email)}', 'admin', '${esc(hash)}') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role='admin', password_hash=EXCLUDED.password_hash;`;
try {
  execFileSync("psql", [url, "-v", "ON_ERROR_STOP=1", "-c", sql], {
    stdio: "inherit",
  });
  console.log(`seed ok (idempoten): ${email}`);
} catch (error) {
  console.error("seed gagal via psql:", error.message);
  process.exit(1);
}
