import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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
export const db = getDatabase(app);
