/** Whitelist product fields accepted from admin API bodies (mass-assignment guard). */

const PRODUCT_KEYS = [
  'name',
  'slug',
  'sku',
  'description',
  'short_description',
  'category_id',
  'subcategory_id',
  'tags',
  'dimensions',
  'material',
  'weight',
  'color',
  'is_customizable',
  'is_featured',
  'is_trending',
  'is_best_seller',
  'seo_title',
  'seo_description',
  'seo_keywords',
  'opengraph_image',
  'price',
  'product_config',
] as const;

export type ProductWrite = Partial<Record<(typeof PRODUCT_KEYS)[number], unknown>>;

export function pickProductFields(input: unknown): ProductWrite {
  if (!input || typeof input !== 'object') return {};
  const src = input as Record<string, unknown>;
  const out: ProductWrite = {};
  for (const key of PRODUCT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(src, key)) {
      out[key] = src[key];
    }
  }
  return out;
}

const BLOG_KEYS = [
  'title',
  'slug',
  'content',
  'category_id',
  'tags',
  'featured_image',
  'reading_time',
  'is_published',
  'seo_title',
  'seo_description',
] as const;

export function pickBlogFields(input: unknown): Partial<Record<(typeof BLOG_KEYS)[number], unknown>> {
  if (!input || typeof input !== 'object') return {};
  const src = input as Record<string, unknown>;
  const out: Partial<Record<(typeof BLOG_KEYS)[number], unknown>> = {};
  for (const key of BLOG_KEYS) {
    if (Object.prototype.hasOwnProperty.call(src, key)) {
      out[key] = src[key];
    }
  }
  return out;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}
