import fs from 'fs';

// 1. Explicit Category Mappings
export const CATEGORY_STORE_MAP = {
    // Nila Jewels (Jewellery)
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

    // Nila Drapes (Sarees)
    'Cotton Sarees': 'drapes',
    'Grape Silk': 'drapes'
};

export const STORE_METADATA = {
    jewels: {
        id: 'jewels',
        name: 'Nila Jewels',
        tagline: 'Curated jewels – Styled for you',
        shortTitle: 'Jewellery'
    },
    drapes: {
        id: 'drapes',
        name: 'Nila Drapes',
        tagline: 'Timeless weaves – Curated sarees',
        shortTitle: 'Sarees'
    }
};

function runDryRun() {
    const productsRaw = JSON.parse(fs.readFileSync('./data_backup/products_backup.json', 'utf8'));
    const categoriesRaw = JSON.parse(fs.readFileSync('./data_backup/categories_backup.json', 'utf8'));

    const products = Object.values(productsRaw);
    const categories = Object.values(categoriesRaw);

    console.log("=================================================");
    console.log("       DATA MIGRATION DRY-RUN REPORT             ");
    console.log("=================================================\n");
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Total Products in Database: ${products.length}`);
    console.log(`Total Categories in Database: ${categories.length}\n`);

    console.log("--- 1. CATEGORY CLASSIFICATION MAPPINGS ---");
    const categoryStats = {};
    for (const cat of categories) {
        const assignedStore = CATEGORY_STORE_MAP[cat.name];
        categoryStats[cat.name] = {
            id: cat.id,
            name: cat.name,
            store: assignedStore || 'UNRESOLVED'
        };
        console.log(`  • Category "${cat.name}" (ID: ${cat.id}) => ${assignedStore ? STORE_METADATA[assignedStore].name : '⚠️ UNRESOLVED'}`);
    }

    console.log("\n--- 2. PRODUCT MAPPING & ASSIGNMENT ---");
    const jewelsProducts = [];
    const drapesProducts = [];
    const unresolvedProducts = [];

    for (const prod of products) {
        // If product already has an explicit manual store assignment, preserve it
        if (prod.store && (prod.store === 'jewels' || prod.store === 'drapes')) {
            if (prod.store === 'jewels') jewelsProducts.push(prod);
            else drapesProducts.push(prod);
            continue;
        }

        const catName = prod.category ? prod.category.trim() : null;
        const targetStore = catName ? CATEGORY_STORE_MAP[catName] : null;

        if (targetStore === 'jewels') {
            jewelsProducts.push({ ...prod, store: 'jewels' });
        } else if (targetStore === 'drapes') {
            drapesProducts.push({ ...prod, store: 'drapes' });
        } else {
            unresolvedProducts.push({
                id: prod.id,
                title: prod.title,
                category: prod.category || 'MISSING',
                artistCode: prod.artist || 'N/A'
            });
        }
    }

    console.log(`\n• Total Nila Jewels products: ${jewelsProducts.length}`);
    console.log(`• Total Nila Drapes products: ${drapesProducts.length}`);
    console.log(`• Unresolved / Ambiguous products: ${unresolvedProducts.length}`);

    if (unresolvedProducts.length > 0) {
        console.log("\n⚠️ UNRESOLVED PRODUCTS FLAGGED FOR MANUAL REVIEW:");
        unresolvedProducts.forEach((u, i) => {
            console.log(`  ${i + 1}. [${u.id}] "${u.title}" | Category: ${u.category} | Code: ${u.artistCode}`);
        });
    } else {
        console.log("\n✅ 100% of products successfully and deterministically mapped!");
    }

    // Breakdown per category
    console.log("\n--- 3. PRODUCT DISTRIBUTION BY CATEGORY ---");
    const dist = {};
    for (const p of products) {
        const c = p.category || 'NO_CATEGORY';
        if (!dist[c]) dist[c] = { count: 0, store: CATEGORY_STORE_MAP[c] || 'UNKNOWN' };
        dist[c].count++;
    }
    for (const [cat, data] of Object.entries(dist)) {
        console.log(`  - [${cat}]: ${data.count} items -> ${data.store === 'jewels' ? 'Nila Jewels' : data.store === 'drapes' ? 'Nila Drapes' : '⚠️ Unresolved'}`);
    }

    // Safety checks
    console.log("\n--- 4. DATA INTEGRITY CHECKS ---");
    let missingIdCount = 0;
    let missingPriceCount = 0;
    let missingImageCount = 0;

    for (const p of products) {
        if (!p.id) missingIdCount++;
        if (p.price === undefined || p.price === null) missingPriceCount++;
        if (!p.imageUrl && (!p.images || p.images.length === 0)) missingImageCount++;
    }

    console.log(`  • Missing Product IDs: ${missingIdCount}`);
    console.log(`  • Missing Prices: ${missingPriceCount}`);
    console.log(`  • Missing Images: ${missingImageCount}`);

    // Generate local migrated test snapshot
    const migratedProducts = {};
    for (const p of [...jewelsProducts, ...drapesProducts]) {
        migratedProducts[p.id] = p;
    }
    const migratedCategories = {};
    for (const c of categories) {
        migratedCategories[c.id] = {
            ...c,
            store: CATEGORY_STORE_MAP[c.name] || 'jewels'
        };
    }

    fs.writeFileSync('./data_backup/dry_run_migrated_products.json', JSON.stringify(migratedProducts, null, 2));
    fs.writeFileSync('./data_backup/dry_run_migrated_categories.json', JSON.stringify(migratedCategories, null, 2));

    console.log("\n✅ Generated local staging copies in ./data_backup/dry_run_migrated_*.json for local development.");
    console.log("=================================================");
}

runDryRun();
