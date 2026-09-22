const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const parseIntOrFallback = (value, fallback) =>
  Number.parseInt(value, 10) || fallback;

const parsePagination = (query = {}, defaults = {}) => {
  const page = parseIntOrFallback(query.page, defaults.page ?? 1);
  const limit = Math.min(
    parseIntOrFallback(query.limit, defaults.limit ?? DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );

  return { page, limit };
};

module.exports = {
  parsePagination,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};