/**
 * `THE THREE SHELVES` -> `the-three-shelves`.
 *
 * Kept out of `Page.tsx` so that file exports components and nothing else,
 * which is what lets Fast Refresh replace a page without remounting it.
 */
export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
