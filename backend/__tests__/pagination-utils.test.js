const {
  parsePagination,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require("../src/utils/pagination.utils");

describe("parsePagination", () => {
  it("returns defaults when no query params are provided", () => {
    expect(parsePagination({})).toEqual({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    });
  });

  it("parses integer query strings", () => {
    expect(parsePagination({ page: "3", limit: "25" })).toEqual({
      page: 3,
      limit: 25,
    });
  });

  it("handles bare numbers", () => {
    expect(parsePagination({ page: 2, limit: 50 })).toEqual({
      page: 2,
      limit: 50,
    });
  });

  it("falls back on zero, empty, and non-numeric values", () => {
    expect(parsePagination({ page: "0", limit: "abc" })).toEqual({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    });
    expect(parsePagination({ page: "", limit: "0" })).toEqual({
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    });
  });

  it("preserves negative integers for downstream service clamping", () => {
    expect(parsePagination({ page: "-5" })).toEqual({
      page: -5,
      limit: DEFAULT_PAGE_SIZE,
    });
  });

  it("clamps oversized limits to the maximum page size", () => {
    expect(parsePagination({ limit: "500" })).toEqual({
      page: 1,
      limit: MAX_PAGE_SIZE,
    });
  });

  it("honours custom defaults", () => {
    expect(parsePagination({}, { page: 3, limit: 50 })).toEqual({
      page: 3,
      limit: 50,
    });
  });
});