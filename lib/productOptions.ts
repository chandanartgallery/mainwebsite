export interface SizeOption {
  value: string;
  modifier: number;
}

export interface MaterialOption {
  label: string;
  value: string;
  tag: string;
  modifier: number;
}

export interface ColorOption {
  label: string;
  modifier: number;
}

export const DEFAULT_MATERIALS: MaterialOption[] = [
  { label: 'Pine Wood', value: 'Solid Pine Wood', tag: 'Natural', modifier: 0 },
  { label: 'Teak Wood', value: 'Teak Wood', tag: '+ ₹800', modifier: 800 },
  { label: 'Acrylic Stand', value: 'Premium Cast Plexiglass', tag: '+ ₹1,200', modifier: 1200 },
];

export const DEFAULT_COLORS: ColorOption[] = [
  { label: 'Walnut Brown', modifier: 0 },
  { label: 'Gold & Crimson', modifier: 0 },
  { label: 'Distressed White Wash', modifier: 0 },
  { label: 'Matte Black', modifier: 0 },
];

export function serializeSizes(sizes: SizeOption[]): string {
  return sizes
    .filter((s) => s.value.trim() !== '')
    .map((s) => `${s.value.trim()}:${s.modifier}`)
    .join(', ');
}

export function parseSizes(dimensions: string | null | undefined): SizeOption[] {
  const fallback: SizeOption[] = [{ value: '12 x 15 inches', modifier: 0 }];
  if (!dimensions?.trim()) return fallback;

  try {
    if (dimensions.includes(':')) {
      const parsed = dimensions.split(',').map((part) => {
        const [val, mod] = part.split(':');
        return { value: val.trim(), modifier: parseInt(mod?.trim() || '0', 10) || 0 };
      });
      return parsed.length > 0 ? parsed : fallback;
    }
    const parsed = dimensions.split(',').map((val, idx) => ({
      value: val.trim(),
      modifier: idx === 0 ? 0 : idx === 1 ? 1000 : 2500,
    }));
    return parsed.length > 0 ? parsed : fallback;
  } catch {
    return [{ value: dimensions.trim(), modifier: 0 }];
  }
}

export function sizesToDisplay(sizes: SizeOption[]) {
  return sizes.map((s) => {
    const label = s.value.replace(/ inches?/i, ' in').replace(/ inch/i, ' in');
    const tag = s.modifier === 0 ? 'Standard' : `+ ₹${s.modifier.toLocaleString()}`;
    return { label, value: s.value, tag, priceModifier: s.modifier };
  });
}

export function serializeMaterials(materials: MaterialOption[]): string {
  return JSON.stringify(materials);
}

export function parseMaterials(raw: string | null | undefined): MaterialOption[] {
  if (!raw?.trim()) return [...DEFAULT_MATERIALS];
  if (raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw) as MaterialOption[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* fall through */
    }
  }
  const defaults = [...DEFAULT_MATERIALS];
  const hint = raw.toLowerCase();
  if (hint.includes('teak')) {
    return defaults.map((m) =>
      m.value === 'Teak Wood' ? { ...m } : m
    );
  }
  return defaults;
}

export function serializeColors(colors: ColorOption[]): string {
  return JSON.stringify(colors);
}

export function parseColors(raw: string | null | undefined): ColorOption[] {
  if (!raw?.trim()) return [...DEFAULT_COLORS];
  if (raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw) as ColorOption[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* fall through */
    }
  }
  const label = raw.split(',')[0].trim();
  const exists = DEFAULT_COLORS.some((c) => c.label === label);
  if (exists) return DEFAULT_COLORS;
  return [{ label, modifier: 0 }, ...DEFAULT_COLORS.filter((c) => c.label !== label)].slice(0, 6);
}

export function formatDimensionsForSpecs(dimensions: string | null | undefined): string {
  if (!dimensions?.trim()) return '12 x 15 inches';
  if (!dimensions.includes(':')) return dimensions;
  return parseSizes(dimensions)
    .map((s) => s.value)
    .join(', ');
}
