import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import fs from "fs";

const firebaseConfig = {
    apiKey: "AIzaSyABoefxLx7GO2KQLOt_1761-xmj6p44Rzo",
    authDomain: "nova-gallery.firebaseapp.com",
    projectId: "nova-gallery",
    storageBucket: "nova-gallery.firebasestorage.app",
    messagingSenderId: "669742350648",
    appId: "1:669742350648:web:f05fa696379e2d5d30c1cd",
    databaseURL: "https://nova-gallery-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function inspect() {
    console.log("Fetching data from Firebase RTDB (read-only)...");
    try {
        const categoriesSnap = await get(ref(db, 'categories'));
        const productsSnap = await get(ref(db, 'products'));
        const settingsSnap = await get(ref(db, 'settings'));
        const deliverySnap = await get(ref(db, 'deliveryCharges'));

        const categories = categoriesSnap.val() || {};
        const products = productsSnap.val() || {};

        console.log("=== CATEGORIES ===");
        console.log(JSON.stringify(categories, null, 2));

        console.log("\n=== PRODUCTS SUMMARY ===");
        const prodList = Object.values(products);
        console.log(`Total products: ${prodList.length}`);
        
        // Group products by category
        const byCat = {};
        for (const p of prodList) {
            const cat = p.category || 'NO_CATEGORY';
            if (!byCat[cat]) byCat[cat] = [];
            byCat[cat].push({
                id: p.id,
                title: p.title,
                category: p.category,
                price: p.price,
                store: p.store || 'NONE'
            });
        }
        for (const [cat, items] of Object.entries(byCat)) {
            console.log(`- Category [${cat}]: ${items.length} products`);
        }

        // Save a local snapshot of production data to inspect safely
        if (!fs.existsSync('./data_backup')) {
            fs.mkdirSync('./data_backup', { recursive: true });
        }
        fs.writeFileSync('./data_backup/categories_backup.json', JSON.stringify(categories, null, 2));
        fs.writeFileSync('./data_backup/products_backup.json', JSON.stringify(products, null, 2));
        console.log("\nSaved read-only backup snapshot to ./data_backup/products_backup.json and categories_backup.json");

        process.exit(0);
    } catch (err) {
        console.error("Inspection error:", err);
        process.exit(1);
    }
}

inspect();
