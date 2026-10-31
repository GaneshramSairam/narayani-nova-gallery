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

async function inspectFull() {
    console.log("Fetching orders, settings, and full data from Firebase RTDB (read-only)...");
    try {
        const ordersSnap = await get(ref(db, 'orders'));
        const deliverySnap = await get(ref(db, 'deliverySettings'));
        const stateDeliverySnap = await get(ref(db, 'stateDeliveryCharges'));

        const orders = ordersSnap.val() || {};
        const deliverySettings = deliverySnap.val() || null;
        const stateDelivery = stateDeliverySnap.val() || null;

        console.log(`Total orders found: ${Object.keys(orders).length}`);
        if (Object.keys(orders).length > 0) {
            const sampleOrder = Object.values(orders)[0];
            console.log("Sample order structure:", JSON.stringify({
                id: sampleOrder.id,
                date: sampleOrder.date,
                total: sampleOrder.total,
                customer: sampleOrder.customer,
                itemsCount: sampleOrder.items ? sampleOrder.items.length : 0,
                deliveryFee: sampleOrder.deliveryFee,
                deliveryCharge: sampleOrder.deliveryCharge
            }, null, 2));
        }

        console.log("Existing deliverySettings:", JSON.stringify(deliverySettings));
        console.log("Existing stateDeliveryCharges:", JSON.stringify(stateDelivery));

        if (!fs.existsSync('./data_backup')) {
            fs.mkdirSync('./data_backup', { recursive: true });
        }
        fs.writeFileSync('./data_backup/orders_backup.json', JSON.stringify(orders, null, 2));
        console.log("Saved orders backup to ./data_backup/orders_backup.json");
        process.exit(0);
    } catch (err) {
        console.error("Full inspect error:", err);
        process.exit(1);
    }
}

inspectFull();
