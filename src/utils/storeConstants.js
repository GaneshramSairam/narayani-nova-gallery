// Store definitions and classification rules
export const STORES = {
    JEWELS: 'jewels',
    DRAPES: 'drapes'
};

export const STORE_CONFIG = {
    jewels: {
        id: 'jewels',
        name: 'Narayani Gallery',
        subtitle: 'Jewellery',
        tagline: 'Curated jewels – Styled for you',
        emptyMessage: 'No jewellery found matching your criteria.'
    },
    drapes: {
        id: 'drapes',
        name: 'Signature Sarees',
        subtitle: 'Sarees',
        tagline: 'Timeless weaves – Curated sarees',
        emptyMessage: 'No sarees found matching your criteria.'
    }
};

// Deterministic, explicit category-to-store mapping based on database inspection
export const CATEGORY_STORE_MAP = {
    // Narayani Gallery (Jewellery)
    'Necklace Sets': 'jewels',
    'Bracelets': 'jewels',
    'A.D NECKLACE SETS': 'jewels',
    'CHOKER SETS': 'jewels',
    'Earrings': 'jewels',
    'Oxidized sets': 'jewels',
    'Bangles': 'jewels',
    'Necklace': 'jewels',
    'Combo Sets': 'jewels',
    'Haram': 'jewels',
    'BRIDAL JEWELLERY': 'jewels',
    'Rings': 'jewels',
    'Sets': 'jewels',

    // Signature Sarees (Sarees)
    'Cotton Sarees': 'drapes',
    'Grape Silk': 'drapes',
    'Silk Sarees': 'drapes',
    'Chanderi Sarees': 'drapes',
    'Linen Sarees': 'drapes',
    'Party Wear Sarees': 'drapes'
};

/**
 * Resolves which store a product belongs to.
 * 1. Checks explicit `product.store` attribute.
 * 2. Fallbacks to `CATEGORY_STORE_MAP[product.category]`.
 * 3. Fallbacks to default 'jewels'.
 */
export const resolveProductStore = (product) => {
    if (!product) return 'jewels';
    if (product.store === 'jewels' || product.store === 'drapes') {
        return product.store;
    }
    const cat = product.category ? product.category.trim() : '';
    if (CATEGORY_STORE_MAP[cat]) {
        return CATEGORY_STORE_MAP[cat];
    }
    // Inspect title for saree clues if category was missing or custom
    const titleLower = (product.title || '').toLowerCase();
    if (titleLower.includes('saree') || titleLower.includes('silk') || titleLower.includes('drape')) {
        return 'drapes';
    }
    return 'jewels';
};

/**
 * Resolves which store a category belongs to.
 */
export const resolveCategoryStore = (category) => {
    if (!category) return 'jewels';
    if (category.store === 'jewels' || category.store === 'drapes') {
        return category.store;
    }
    const name = category.name ? category.name.trim() : '';
    return CATEGORY_STORE_MAP[name] || 'jewels';
};
