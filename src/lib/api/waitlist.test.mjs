import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { readWaitlistPage, WAITLIST_PER_PAGE } = await import("./waitlist.ts");

describe("readWaitlistPage", () => {
  it("uses fixed page size and returns pagination metadata", async () => {
    const calls = [];
    const store = {
      async list(search, page, perPage) {
        calls.push({ search, page, perPage });
        return {
          items: [
            {
              id: 7,
              email: "rani@example.com",
              name: "Rani",
              createdAt: "2026-10-16T00:00:00.000Z",
            },
          ],
          total: 26,
        };
      },
    };

    assert.equal(WAITLIST_PER_PAGE, 25);
    assert.deepEqual(
      await readWaitlistPage(store, { page: 2, search: "rani" }),
      {
        items: [
          {
            id: 7,
            email: "rani@example.com",
            name: "Rani",
            createdAt: "2026-10-16T00:00:00.000Z",
          },
        ],
        page: 2,
        perPage: 25,
        total: 26,
        totalPages: 2,
      },
    );
    assert.deepEqual(calls, [{ search: "rani", page: 2, perPage: 25 }]);
  });

  it("returns zero totalPages for an empty result", async () => {
    const store = {
      async list() {
        return { items: [], total: 0 };
      },
    };

    const page = await readWaitlistPage(store, { page: 1 });

    assert.equal(page.totalPages, 0);
  });
});
