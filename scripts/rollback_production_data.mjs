/**
 * Rollback Script
 * Restores products and categories to their exact backup state.
 */
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAwVn4Z8R4jH3E5k7l2m9o0p1q",
    authDomain: "nova-gallery-default-rtdb.firebaseapp.com",
    databaseURL: "https://nova-gallery-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nova-gallery-default-rtdb",
    storageBucket: "nova-gallery-default-rtdb.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function runRollback() {
    console.log('--- Starting Rollback from Backups ---');

    const productsOriginal = JSON.parse(fs.readFileSync('data_backup/products_backup.json', 'utf8'));
    const categoriesOriginal = JSON.parse(fs.readFileSync('data_backup/categories_backup.json', 'utf8'));

    console.log('Restoring products to original snapshot...');
    await set(ref(db, 'products'), productsOriginal);

    console.log('Restoring categories to original snapshot...');
    await set(ref(db, 'categories'), categoriesOriginal);

    console.log('--- Rollback Completed Successfully ---');
    process.exit(0);
}

runRollback().catch(err => {
    console.error('Rollback failed:', err);
    process.exit(1);
});
