import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, push, remove, update } from "firebase/database";
import { artworks as initialArtworks } from '../data/artworks';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {


    // --- Activity Logging ---
    const [activityLogs, setActivityLogs] = useState([]);

    useEffect(() => {
        const logsRef = ref(db, 'activityLogs');
        const unsubscribe = onValue(logsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert object to array and sort by timestamp desc
                const logsArray = Object.values(data).sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                setActivityLogs(logsArray);
            } else {
                setActivityLogs([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const logActivity = (actionType, details = '', relatedId = null, userInfo = {}) => {
        const newLog = {
            id: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            actionType,
            details,
            orderId: relatedId,
            userName: userInfo.name || 'Super Admin',
            userEmail: userInfo.email || 'admin',
            phone: userInfo.phone || '',
        };

        const newLogRef = push(ref(db, 'activityLogs'));
        set(newLogRef, newLog);
    };

    // --- Authentication State ---
    const DEFAULT_ADMIN = {
        email: 'admin@nova.local',
        password: 'Nova@123'
    };

    const [adminUser, setAdminUser] = useState(DEFAULT_ADMIN);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAdminAuthenticated') === 'true';
    });

    useEffect(() => {
        const adminRef = ref(db, 'adminUser');
        const unsubscribe = onValue(adminRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setAdminUser(data);
            } else {
                // Initialize if missing
                set(adminRef, DEFAULT_ADMIN);
            }
        });
        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        if (email === adminUser.email && password === adminUser.password) {
            setIsAuthenticated(true);
            localStorage.setItem('isAdminAuthenticated', 'true');
            logActivity('ADMIN_LOGIN', 'Admin logged in successfully');
            return true;
        }
        return false;
    };

    const logout = () => {
        logActivity('ADMIN_LOGOUT', 'Admin logged out');
        setIsAuthenticated(false);
        localStorage.removeItem('isAdminAuthenticated');
    };

    const updateAdminCredentials = (newEmail, newPassword) => {
        set(ref(db, 'adminUser'), { email: newEmail, password: newPassword });
        logActivity('ADMIN_CREDENTIALS_CHANGED', `Admin email changed to ${newEmail}`);
    };

    // --- Products State ---
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const productsRef = ref(db, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setProducts(Object.values(data));
            } else {
                // Initialize with default artworks if empty (only once)
                // We check if it's truly empty to avoid overwriting deletions
                // For simplicity in this prototype, we'll just set empty or manual init
                // But to keep the site working, let's seed if absolutely nothing exists
                // set(productsRef, initialArtworks); // Uncomment to auto-seed
                setProducts([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const addProduct = (product) => {
        const newProductRef = push(ref(db, 'products'));
        const newProduct = { ...product, id: newProductRef.key };
        set(newProductRef, newProduct);
        logActivity('PRODUCT_ADDED', `Added product: ${product.title}`);
    };

    const updateProduct = (id, updatedData) => {
        const productRef = ref(db, `products/${id}`);
        update(productRef, updatedData);
        logActivity('PRODUCT_UPDATED', `Updated product ID: ${id}`);
    };

    const deleteProduct = (id) => {
        const product = products.find(p => p.id === id);
        remove(ref(db, `products/${id}`));
        logActivity('PRODUCT_DELETED', `Deleted product: ${product ? product.title : id}`);
    };

    // --- Orders State ---
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const ordersRef = ref(db, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const ordersArray = Object.values(data).sort((a, b) =>
                    new Date(b.date) - new Date(a.date)
                );
                setOrders(ordersArray);
            } else {
                setOrders([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const addOrder = (order) => {
        const customId = `ORD-${Date.now()}`;
        const finalOrder = {
            ...order,
            id: customId,
            date: new Date().toISOString(),
            status: 'Pending'
        };

        set(ref(db, `orders/${customId}`), finalOrder);

        logActivity(
            'CHECKOUT_SUBMITTED',
            `Order placed for ₹${order.total}`,
            finalOrder.id,
            order.customer
        );

        return finalOrder;
    };

    const verifyOrder = (orderId) => {
        update(ref(db, `orders/${orderId}`), { status: 'Verified' });
        logActivity('ORDER_VERIFIED', `Order verified`, orderId);
    };

    // --- QR Code State ---
    const [qrCode, setQrCode] = useState(null);

    useEffect(() => {
        const qrRef = ref(db, 'upiQrCode');
        const unsubscribe = onValue(qrRef, (snapshot) => {
            const data = snapshot.val();
            setQrCode(data || null);
        });
        return () => unsubscribe();
    }, []);

    const updateQrCode = (newQrUrl) => {
        set(ref(db, 'upiQrCode'), newQrUrl);
        logActivity('QR_UPDATED', 'UPI QR Code updated');
    };

    // --- Categories State ---
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const categoriesRef = ref(db, 'categories');
        const unsubscribe = onValue(categoriesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCategories(Object.values(data));
            } else {
                // Seed default categories if empty
                const defaultCategories = [
                    { id: 'cat1', name: 'Necklaces' },
                    { id: 'cat2', name: 'Earrings' },
                    { id: 'cat3', name: 'Bracelets' },
                    { id: 'cat4', name: 'Rings' },
                    { id: 'cat5', name: 'Sets' }
                ];
                defaultCategories.forEach(cat => {
                    set(ref(db, `categories/${cat.id}`), cat);
                });
            }
        });
        return () => unsubscribe();
    }, []);

    const addCategory = (name) => {
        const newCatRef = push(ref(db, 'categories'));
        const newCat = { id: newCatRef.key, name };
        set(newCatRef, newCat);
        logActivity('CATEGORY_ADDED', `Added category: ${name}`);
    };

    const deleteCategory = (id) => {
        const cat = categories.find(c => c.id === id);
        remove(ref(db, `categories/${id}`));
        logActivity('CATEGORY_DELETED', `Deleted category: ${cat ? cat.name : id}`);
    };

    // --- Social Links State ---
    const [socialLinks, setSocialLinks] = useState({ whatsapp: '', instagram: '' });

    useEffect(() => {
        const socialRef = ref(db, 'socialLinks');
        const unsubscribe = onValue(socialRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setSocialLinks(data);
            }
        });
        return () => unsubscribe();
    }, []);

    const updateSocialLinks = (links) => {
        set(ref(db, 'socialLinks'), links);
        logActivity('SOCIAL_UPDATED', 'Updated social media links');
    };

    // --- Invoice Settings State ---
    const [invoiceSettings, setInvoiceSettings] = useState({
        address: '123 Gallery St, Art City, AC 54321',
        email: 'support@novagallery.com',
        website: 'www.novagallery.com'
    });

    useEffect(() => {
        const invoiceRef = ref(db, 'invoiceSettings');
        const unsubscribe = onValue(invoiceRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setInvoiceSettings(data);
            }
        });
        return () => unsubscribe();
    }, []);

    const updateInvoiceSettings = (settings) => {
        set(ref(db, 'invoiceSettings'), settings);
        logActivity('INVOICE_SETTINGS_UPDATED', 'Updated invoice details');
    };

    // --- Contact Page Settings ---
    const [contactSettings, setContactSettings] = useState({
        subtitle: 'Book a styling session or ask us about a specific piece.',
        email: 'hello@narayanisnova.com',
        phone: '+91-98765-43210',
        address: 'Parsn Karthik Apts, Vadapalani, Chennai - 600026',
        mapSrc: 'https://maps.google.com/maps?q=Parsn%20Karthik%20Apartments%2C%20Vadapalani%2C%20Chennai&t=&z=15&ie=UTF8&iwloc=&output=embed'
    });

    useEffect(() => {
        const contactRef = ref(db, 'contactSettings');
        const unsubscribe = onValue(contactRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setContactSettings(data);
            }
        });
        return () => unsubscribe();
    }, []);

    const updateContactSettings = (settings) => {
        set(ref(db, 'contactSettings'), settings);
        logActivity('CONTACT_SETTINGS_UPDATED', 'Updated contact page details');
    };

    // --- Messages State ---
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const messagesRef = ref(db, 'messages');
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const msgsArray = Object.values(data).sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                setMessages(msgsArray);
            } else {
                setMessages([]);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <AdminContext.Provider value={{
            isAuthenticated,
            adminUser,
            login,
            logout,
            updateAdminCredentials,
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            orders,
            addOrder,
            verifyOrder,
            qrCode,
            updateQrCode,
            activityLogs,
            logActivity,
            categories,
            addCategory,
            deleteCategory,
            socialLinks,
            updateSocialLinks,
            invoiceSettings,
            updateInvoiceSettings,
            contactSettings,
            updateContactSettings,
            messages
        }}>
            {children}
        </AdminContext.Provider>
    );
};
