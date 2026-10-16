import assert from "node:assert/strict";

import { verifiedGoogleEmail } from "../src/lib/google-profile.mjs";

assert.equal(
  verifiedGoogleEmail({
    email: " Pemilik@Example.Test ",
    email_verified: true,
  }),
  "pemilik@example.test",
);
assert.equal(
  verifiedGoogleEmail({ email: "pemilik@example.test", email_verified: false }),
  null,
);
assert.equal(verifiedGoogleEmail({ email_verified: true }), null);
console.log("E11 Google profile checks passed");
