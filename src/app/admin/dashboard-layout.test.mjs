#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile("src/app/admin/page.tsx", "utf8");

assert.match(source, /<section className="space-y-8">/);
assert.match(source, /className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"/);
assert.doesNotMatch(source, /<main>/);

// E16-2: metrik dibangun dari konfigurasi dan dirender sebagai tautan.
assert.match(source, /buildDashboardMetrics\(dashboard\)/);
assert.match(source, /metrics\.map\(\(metric\)/);
assert.match(source, /<Link\s+href=\{metric\.href\}/);
assert.match(source, /data-testid=\{`metric-\$\{metric\.key\}`\}/);
assert.match(source, /aria-labelledby="ringkasan-metrik"/);
assert.match(source, /formatDateTimeId\(latestContentUpdatedAt\)/);

// E16-4: widget komentar terbaru memakai satu kueri terbatas.
assert.match(source, /<RecentComments comments=\{recentComments\} \/>/);
assert.match(source, /\.limit\(3\)/);

// Waktu tidak boleh dirender sebagai ISO mentah di UI.
assert.doesNotMatch(source, /toISOString\(\)/);

console.log("Dashboard admin memakai metrik tertaut, waktu lokal, dan widget.");
