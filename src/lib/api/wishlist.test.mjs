import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readWishlistPage, WISHLIST_PER_PAGE } from "./wishlist.ts";

describe("readWishlistPage", () => {
  it("should pass through query parameters", () => {
    const mockLister = {
      items: [
        {
          id: 1,
          email: "user1@test.com",
          name: "User One",
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      total: 1,
    };

    const result = readWishlistPage(mockLister, { page: 2, search: "test" });

    assert.equal(result.page, 2);
    assert.equal(result.items.length, 1);
  });

  it("should keep perPage constant at 25", () => {
    const mockLister = {
      items: [],
      total: 0,
    };

    const result = readWishlistPage(mockLister, { page: 1 });

    assert.equal(result.perPage, 25);
    assert.equal(WISHLIST_PER_PAGE, 25);
  });

  it("should calculate totalPages correctly for zero total", () => {
    const mockLister = {
      items: [],
      total: 0,
    };

    const result = readWishlistPage(mockLister, { page: 1 });

    assert.equal(result.total, 0);
    assert.equal(result.totalPages, 0);
  });

  it("should calculate totalPages correctly for non-zero totals", () => {
    // Exactly one page
    const result1 = readWishlistPage({ items: [], total: 25 }, { page: 1 });
    assert.equal(result1.total, 25);
    assert.equal(result1.totalPages, 1);

    // Partial second page
    const result2 = readWishlistPage({ items: [], total: 26 }, { page: 1 });
    assert.equal(result2.total, 26);
    assert.equal(result2.totalPages, 2);

    // Exactly two pages
    const result3 = readWishlistPage({ items: [], total: 50 }, { page: 1 });
    assert.equal(result3.total, 50);
    assert.equal(result3.totalPages, 2);

    // Multiple pages
    const result4 = readWishlistPage({ items: [], total: 100 }, { page: 1 });
    assert.equal(result4.total, 100);
    assert.equal(result4.totalPages, 4);

    // Partial last page
    const result5 = readWishlistPage({ items: [], total: 63 }, { page: 1 });
    assert.equal(result5.total, 63);
    assert.equal(result5.totalPages, 3);
  });

  it("should pass through items array", () => {
    const items = [
      {
        id: 1,
        email: "user1@test.com",
        name: "User 1",
        createdAt: "2026-01-01T00:00:00Z",
      },
      {
        id: 2,
        email: "user2@test.com",
        name: "User 2",
        createdAt: "2026-01-02T00:00:00Z",
      },
      {
        id: 3,
        email: "user3@test.com",
        name: "User 3",
        createdAt: "2026-01-03T00:00:00Z",
      },
    ];

    const result = readWishlistPage({ items, total: 3 }, { page: 1 });

    assert.equal(result.items.length, 3);
    assert.deepEqual(result.items, items);
  });

  it("should handle edge case with 1 item", () => {
    const result = readWishlistPage(
      {
        items: [
          {
            id: 1,
            email: "solo@test.com",
            name: "Solo",
            createdAt: "2026-01-01T00:00:00Z",
          },
        ],
        total: 1,
      },
      { page: 1 },
    );

    assert.equal(result.total, 1);
    assert.equal(result.totalPages, 1);
    assert.equal(result.items.length, 1);
  });

  it("should calculate totalPages for large datasets", () => {
    const result = readWishlistPage({ items: [], total: 1000 }, { page: 1 });

    assert.equal(result.total, 1000);
    assert.equal(result.totalPages, 40); // 1000 / 25 = 40
  });

  it("should handle different page numbers correctly", () => {
    const mockData = { items: [], total: 100 };

    const result1 = readWishlistPage(mockData, { page: 1 });
    assert.equal(result1.page, 1);
    assert.equal(result1.totalPages, 4);

    const result2 = readWishlistPage(mockData, { page: 4 });
    assert.equal(result2.page, 4);
    assert.equal(result2.totalPages, 4);
  });
});
