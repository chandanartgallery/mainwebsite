import { parseSizes, type ColorOption, type MaterialOption, type SizeOption } from './productOptions';

export interface TrustBadge {
  icon: 'truck' | 'shield' | 'authentic' | 'heart' | 'star';
  title: string;
  subtitle: string;
}

export interface ProductPageConfig {
  tagline: string;
  storyTitle: string;
  customizableYesText: string;
  customizableNoText: string;
  sectionLabels: {
    dimensions: string;
    materials: string;
    colors: string;
  };
  trustBadges: TrustBadge[];
  badgeLabels: {
    featured: string;
    bestSeller: string;
    trending: string;
  };
  showDimensions: boolean;
  showMaterials: boolean;
  showColors: boolean;
}

export const DEFAULT_PRODUCT_CONFIG: ProductPageConfig = {
  tagline: 'Bespoke Framing Collection',
  storyTitle: 'Artisan Story & Technical Details',
  customizableYesText: 'Yes — custom sizing available',
  customizableNoText: 'No',
  sectionLabels: {
    dimensions: 'Select Dimensions (Customizable)',
    materials: 'Select Frame Wood / Material',
    colors: 'Select Premium Color Finish',
  },
  trustBadges: [
    { icon: 'truck', title: 'Free Delivery', subtitle: 'Across India' },
    { icon: 'shield', title: 'Secured Frame', subtitle: 'Damage Protection' },
    { icon: 'authentic', title: '100% Genuine', subtitle: 'Teak & Pine Woods' },
  ],
  badgeLabels: {
    featured: 'Featured',
    bestSeller: 'Bestseller',
    trending: 'Trending',
  },
  showDimensions: true,
  showMaterials: true,
  showColors: true,
};

export function parseProductConfig(raw: unknown): ProductPageConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PRODUCT_CONFIG };
  const c = raw as Partial<ProductPageConfig>;
  return {
    tagline: c.tagline || DEFAULT_PRODUCT_CONFIG.tagline,
    storyTitle: c.storyTitle || DEFAULT_PRODUCT_CONFIG.storyTitle,
    customizableYesText: c.customizableYesText || DEFAULT_PRODUCT_CONFIG.customizableYesText,
    customizableNoText: c.customizableNoText || DEFAULT_PRODUCT_CONFIG.customizableNoText,
    sectionLabels: {
      dimensions: c.sectionLabels?.dimensions || DEFAULT_PRODUCT_CONFIG.sectionLabels.dimensions,
      materials: c.sectionLabels?.materials || DEFAULT_PRODUCT_CONFIG.sectionLabels.materials,
      colors: c.sectionLabels?.colors || DEFAULT_PRODUCT_CONFIG.sectionLabels.colors,
    },
    trustBadges:
      Array.isArray(c.trustBadges) && c.trustBadges.length > 0
        ? c.trustBadges.map((b) => ({
            icon: (['truck', 'shield', 'authentic', 'heart', 'star'] as const).includes(
              b.icon as TrustBadge['icon']
            )
              ? (b.icon as TrustBadge['icon'])
              : 'truck',
            title: b.title || '',
            subtitle: b.subtitle || '',
          }))
        : DEFAULT_PRODUCT_CONFIG.trustBadges,
    badgeLabels: {
      featured: c.badgeLabels?.featured || DEFAULT_PRODUCT_CONFIG.badgeLabels.featured,
      bestSeller: c.badgeLabels?.bestSeller || DEFAULT_PRODUCT_CONFIG.badgeLabels.bestSeller,
      trending: c.badgeLabels?.trending || DEFAULT_PRODUCT_CONFIG.badgeLabels.trending,
    },
    showDimensions: c.showDimensions !== false,
    showMaterials: c.showMaterials !== false,
    showColors: c.showColors !== false,
  };
}

export interface ExtendedSizeOption extends SizeOption {
  label?: string;
  tag?: string;
}

export function serializeSizesExtended(sizes: ExtendedSizeOption[]): string {
  const cleaned = sizes.filter((s) => s.value.trim() !== '');
  if (cleaned.some((s) => s.label || s.tag)) {
    return JSON.stringify(
      cleaned.map((s) => ({
        value: s.value.trim(),
        modifier: s.modifier,
        label: s.label?.trim() || undefined,
        tag: s.tag?.trim() || undefined,
      }))
    );
  }
  return cleaned.map((s) => `${s.value.trim()}:${s.modifier}`).join(', ');
}

export function parseSizesExtended(dimensions: string | null | undefined): ExtendedSizeOption[] {
  if (!dimensions?.trim()) return [{ value: '12 x 15 inches', modifier: 0 }];
  if (dimensions.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(dimensions) as ExtendedSizeOption[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* legacy */
    }
  }
  return parseSizes(dimensions);
}

export function sizesToDisplayExtended(sizes: ExtendedSizeOption[]) {
  return sizes.map((s) => {
    const label =
      s.label?.trim() ||
      s.value.replace(/ inches?/i, ' in').replace(/ inch/i, ' in');
    const tag =
      s.tag?.trim() ||
      (s.modifier === 0 ? 'Standard' : `+ ₹${s.modifier.toLocaleString()}`);
    return { label, value: s.value, tag, priceModifier: s.modifier };
  });
}

export type { MaterialOption, ColorOption };
