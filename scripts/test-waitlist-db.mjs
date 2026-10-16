import assert from "node:assert/strict";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";

const url = process.env.NEON_DATABASE_URL;
if (!url) throw new Error("NEON_DATABASE_URL wajib diisi.");

const email = `waitlist-e11-${Date.now()}@example.test`;
const updatedName = "Pengguna Berulang";
const updatedPhotoUrl = "https://example.test/photo-baru.png";
const execFileAsync = promisify(execFile);

function psql(query) {
  return execFileSync(
    "psql",
    [url, "-At", "-v", "ON_ERROR_STOP=1", "-c", query],
    {
      encoding: "utf8",
    },
  );
}

try {
  psql(
    `INSERT INTO waitlist (email, name, photo_url, provider) VALUES ('${email}', 'Pengguna Baru', 'https://example.test/photo-lama.png', 'google');`,
  );
  await Promise.all(
    Array.from({ length: 8 }, () =>
      execFileAsync("psql", [
        url,
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        `INSERT INTO waitlist (email, name, photo_url, provider) VALUES ('${email}', '${updatedName}', '${updatedPhotoUrl}', 'google') ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, photo_url = EXCLUDED.photo_url;`,
      ]),
    ),
  );
  const [count, name, photoUrl] = psql(
    `SELECT count(*), max(name), max(photo_url) FROM waitlist WHERE email = '${email}';`,
  )
    .trim()
    .split("|");
  assert.equal(count, "1");
  assert.equal(name, updatedName);
  assert.equal(photoUrl, updatedPhotoUrl);
  console.log("E11 waitlist concurrency checks passed");
} finally {
  psql(`DELETE FROM waitlist WHERE email = '${email}';`);
}
