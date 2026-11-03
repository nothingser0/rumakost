export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * @template T, C
 * @param {T[]} rows
 * @param {number} limit
 * @param {(item: T) => C} cursorFor
 * @returns {{ items: T[]; nextCursor: C | null }}
 */
export function createCursorPage(rows, limit, cursorFor) {
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const lastItem = items.at(-1);

  return {
    items,
    nextCursor: hasMore && lastItem ? cursorFor(lastItem) : null,
  };
}
