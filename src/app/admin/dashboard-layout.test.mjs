#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile("src/app/admin/page.tsx", "utf8");

assert.match(source, /<section className="space-y-8">/);
assert.match(source, /className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"/);
assert.doesNotMatch(source, /<main>/);

console.log("Dashboard admin memakai section dan grid responsif.");
