/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Rewrite a Supabase Storage public URL into a resized/compressed (CDN-transformed)
// variant so we don't ship multi-MB originals. Non-Supabase URLs are returned as-is.
export function cdn(url: string | null | undefined, width: number, quality = 68): string | undefined {
  if (!url) return undefined;
  if (!url.includes('/storage/v1/object/public/')) return url;
  const base = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}width=${width}&quality=${quality}`;
}
