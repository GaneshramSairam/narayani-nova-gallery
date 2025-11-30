import React, { createContext, useContext, useState, useEffect } from 'react';
import { artworks as initialArtworks } from '../data/artworks';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    // --- Activity Logging ---
    const [activityLogs, setActivityLogs] = useState(() => {
        const savedLogs = localStorage.getItem('activityLogs');
        return savedLogs ? JSON.parse(savedLogs) : [];
    });

    useEffect(() => {
        localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
    }, [activityLogs]);

    const logActivity = (actionType, details = '', relatedId = null, userInfo = {}) => {
        const newLog = {
            id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            actionType,
            details,
            orderId: relatedId,
            userName: userInfo.name || 'Super Admin',
            userEmail: userInfo.email || 'admin',
            phone: userInfo.phone || '',
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    // --- Authentication State ---
    const DEFAULT_ADMIN = {
        email: 'admin@nova.local',
        password: 'Nova@123'
    };

    const [adminUser, setAdminUser] = useState(() => {
        const savedUser = localStorage.getItem('adminUser');
        return savedUser ? JSON.parse(savedUser) : DEFAULT_ADMIN;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAdminAuthenticated') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
    }, [adminUser]);

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
        setAdminUser({ email: newEmail, password: newPassword });
        logActivity('ADMIN_CREDENTIALS_CHANGED', `Admin email changed to ${newEmail}`);
    };

    // --- Products State ---
    const [products, setProducts] = useState(() => {
        const savedProducts = localStorage.getItem('products');
        return savedProducts ? JSON.parse(savedProducts) : initialArtworks;
    });

    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    const addProduct = (product) => {
        const newProduct = { ...product, id: Date.now() };
        setProducts(prev => [...prev, newProduct]);
        logActivity('PRODUCT_ADDED', `Added product: ${product.title}`);
    };

    const updateProduct = (id, updatedData) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
        logActivity('PRODUCT_UPDATED', `Updated product ID: ${id}`);
    };

    const deleteProduct = (id) => {
        const product = products.find(p => p.id === id);
        setProducts(prev => prev.filter(p => p.id !== id));
        logActivity('PRODUCT_DELETED', `Deleted product: ${product ? product.title : id}`);
    };

    // --- Orders State ---
    const [orders, setOrders] = useState(() => {
        const savedOrders = localStorage.getItem('orders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [orders]);

    const addOrder = (order) => {
        const newOrder = {
            ...order,
            id: `ORD-${Date.now()}`,
            date: new Date().toISOString(),
            status: 'Pending'
        };
        setOrders(prev => [newOrder, ...prev]);

        logActivity(
            'CHECKOUT_SUBMITTED',
            `Order placed for $${order.total}`,
            newOrder.id,
            order.customer
        );

        return newOrder;
    };

    const verifyOrder = (orderId) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: 'Verified' } : order
        ));
        logActivity('ORDER_VERIFIED', `Order verified`, orderId);
    };

    // --- QR Code State ---
    const [qrCode, setQrCode] = useState(() => {
        return localStorage.getItem('upiQrCode') || null;
    });

    const updateQrCode = (newQrUrl) => {
        setQrCode(newQrUrl);
        localStorage.setItem('upiQrCode', newQrUrl);
        logActivity('QR_UPDATED', 'UPI QR Code updated');
    };

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
            logActivity
        }}>
            {children}
        </AdminContext.Provider>
    );
};
