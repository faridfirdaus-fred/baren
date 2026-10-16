/**
 * Landing page public helpers
 */

export function shouldShowNews<T>(items: T[]): T[] | false {
  if (items.length === 0) return false;
  return items.slice(0, 3);
}
