/**
 * Production Migration Script
 * Updates products and categories with their store assignments and initializes deliverySettings.
 * Idempotent: Can be run multiple times safely.
 */
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, update, set, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAwVn4Z8R4jH3E5k7l2m9o0p1q",
    authDomain: "nova-gallery-default-rtdb.firebaseapp.com",
    databaseURL: "https://nova-gallery-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nova-gallery-default-rtdb",
    storageBucket: "nova-gallery-default-rtdb.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function runProductionMigration() {
    console.log('--- Starting Production Migration ---');

    // 1. Load Dry Run Migrated Data
    const productsData = JSON.parse(fs.readFileSync('data_backup/dry_run_migrated_products.json', 'utf8'));
    const categoriesData = JSON.parse(fs.readFileSync('data_backup/dry_run_migrated_categories.json', 'utf8'));
    const { INITIAL_DELIVERY_SETTINGS } = await import('../src/utils/deliveryUtils.js');

    console.log(`Updating ${Object.keys(productsData).length} products in Firebase RTDB...`);
    const productUpdates = {};
    for (const [id, prod] of Object.entries(productsData)) {
        productUpdates[`products/${id}/store`] = prod.store;
    }
    await update(ref(db), productUpdates);
    console.log('Products successfully updated with store assignments.');

    console.log(`Updating ${Object.keys(categoriesData).length} categories in Firebase RTDB...`);
    const categoryUpdates = {};
    for (const [id, cat] of Object.entries(categoriesData)) {
        categoryUpdates[`categories/${id}/store`] = cat.store;
    }
    await update(ref(db), categoryUpdates);
    console.log('Categories successfully updated with store assignments.');

    // Initialize deliverySettings if not present
    const deliverySnapshot = await get(ref(db, 'deliverySettings'));
    if (!deliverySnapshot.exists()) {
        console.log('Initializing deliverySettings node in Firebase RTDB...');
        await set(ref(db, 'deliverySettings'), INITIAL_DELIVERY_SETTINGS);
        console.log('deliverySettings initialized.');
    } else {
        console.log('deliverySettings already exists. Retaining current configuration.');
    }

    // Initialize storeWatermarks if not present
    const watermarkSnapshot = await get(ref(db, 'storeWatermarks'));
    if (!watermarkSnapshot.exists()) {
        const initialWatermarks = {
            jewels: {
                isEnabled: true,
                imageUrl: '',
                opacity: 0.08,
                scale: 70,
                position: 'center',
                rotation: 0
            },
            drapes: {
                isEnabled: true,
                imageUrl: '',
                opacity: 0.08,
                scale: 70,
                position: 'center',
                rotation: 0
            }
        };
        console.log('Initializing storeWatermarks node in Firebase RTDB...');
        await set(ref(db, 'storeWatermarks'), initialWatermarks);
        console.log('storeWatermarks initialized.');
    } else {
        console.log('storeWatermarks already exists. Retaining current configuration.');
    }

    console.log('--- Production Migration Completed Successfully ---');
    process.exit(0);
}

runProductionMigration().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
