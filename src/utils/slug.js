/**
 * Generate a URL-friendly slug from a text string.
 *
 * Rules:
 * - lowercase
 * - trim
 * - spaces/hyphens/underscores → "-"
 * - remove non-alphanumeric characters (except "-")
 * - collapse consecutive "--" into "-"
 * - remove leading/trailing "-"
 *
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return ''
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_–—]+/g, '-')       // spaces, underscores, em/en-dashes → hyphen
    .replace(/[^a-z0-9\-]/g, '')     // remove non-alphanumeric except hyphen
    .replace(/-{2,}/g, '-')          // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '')         // trim leading/trailing hyphens
}