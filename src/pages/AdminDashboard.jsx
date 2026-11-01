import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from 'react-router-dom';
import { generateInvoice } from '../utils/generateInvoice';
import { INDIAN_STATES_AND_UTS, normalizeIndianState, INITIAL_DELIVERY_SETTINGS, validateDeliverySettings } from '../utils/deliveryUtils';
import { STORES, STORE_CONFIG, resolveProductStore } from '../utils/storeConstants';
import { compressImage } from '../utils/compressImage';
import { DEFAULT_STORE_WATERMARKS, validateWatermarkImage } from '../utils/watermarkConstants';
import watermarkJewelsDefault from '../assets/watermark_jewels.svg';
import watermarkDrapesDefault from '../assets/watermark_drapes.svg';

const AdminDashboard = () => {
    const {
        products, addProduct, updateProduct, deleteProduct,
        orders, verifyOrder,
        qrCode, updateQrCode,
        activityLogs,
        adminUser, updateAdminCredentials,
        logout,
        categories, addCategory, deleteCategory,
        socialLinks, updateSocialLinks,
        invoiceSettings, updateInvoiceSettings,
        messages,
        contactSettings, updateContactSettings,
        promotions, addPromotion, updatePromotion, deletePromotion, togglePromotionActive,
        promoSettings, updatePromoSettings,
        deliverySettings, updateDeliverySettings, bulkUpdateProductsStore,
        storeWatermarks, updateStoreWatermarks
    } = useAdmin();

    const [activeTab, setActiveTab] = useState('products');
    const navigate = useNavigate();

    // Promo Bar State
    const [promoForm, setPromoForm] = useState({
        text: '',
        badge: '⚡ FLASH DEAL',
        link: '',
        isActive: true
    });
    const [editingPromoId, setEditingPromoId] = useState(null);
    const [promoMsg, setPromoMsg] = useState('');

    // Product Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        title: '',
        artist: '',
        basePrice: '',
        discountPercent: '',
        price: '',
        category: 'Cyberpunk',
        description: '',
        imageUrl: '',
        categoryId: 'cat1', // Default category ID if needed
        isNewArrival: false,
        keywords: '',
        stock: 1,
        images: []
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    // Delivery Charges State
    const [localDeliverySettings, setLocalDeliverySettings] = useState(deliverySettings || INITIAL_DELIVERY_SETTINGS);
    const [deliverySearch, setDeliverySearch] = useState('');
    const [deliverySavedMsg, setDeliverySavedMsg] = useState('');
    const [deliveryError, setDeliveryError] = useState('');

    useEffect(() => {
        if (deliverySettings) {
            setLocalDeliverySettings(deliverySettings);
        }
    }, [deliverySettings]);

    const handleSaveDeliverySettings = (e) => {
        e.preventDefault();
        setDeliveryError('');
        const validation = validateDeliverySettings(localDeliverySettings);
        if (!validation.isValid) {
            setDeliveryError(validation.error);
            return;
        }
        try {
            updateDeliverySettings(localDeliverySettings);
            setDeliverySavedMsg('Delivery charges and quantity settings updated successfully!');
            setTimeout(() => setDeliverySavedMsg(''), 4000);
        } catch (err) {
            setDeliveryError(err.message || 'Failed to update delivery settings.');
        }
    };

    const handleStateRateChange = (stateName, value) => {
        setLocalDeliverySettings(prev => ({
            ...prev,
            stateRates: {
                ...(prev?.stateRates || {}),
                [stateName]: value === '' ? '' : Math.max(0, parseFloat(value) || 0)
            }
        }));
    };


    // Watermark Settings State
    const [localWatermarks, setLocalWatermarks] = useState(storeWatermarks || DEFAULT_STORE_WATERMARKS);
    const [watermarkMsg, setWatermarkMsg] = useState('');
    const [watermarkError, setWatermarkError] = useState('');

    useEffect(() => {
        if (storeWatermarks) {
            setLocalWatermarks(storeWatermarks);
        }
    }, [storeWatermarks]);

    const handleWatermarkImageUpload = (storeKey, file) => {
        setWatermarkError('');
        const validation = validateWatermarkImage(file);
        if (!validation.valid) {
            setWatermarkError(validation.error);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            setLocalWatermarks(prev => ({
                ...prev,
                [storeKey]: {
                    ...(prev?.[storeKey] || DEFAULT_STORE_WATERMARKS[storeKey]),
                    imageUrl: dataUrl
                }
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleResetWatermarkDefault = (storeKey) => {
        const defaultImg = storeKey === 'drapes' ? watermarkDrapesDefault : watermarkJewelsDefault;
        setLocalWatermarks(prev => ({
            ...prev,
            [storeKey]: {
                ...(prev?.[storeKey] || DEFAULT_STORE_WATERMARKS[storeKey]),
                imageUrl: defaultImg
            }
        }));
    };

    const handleRemoveWatermarkImage = (storeKey) => {
        setLocalWatermarks(prev => ({
            ...prev,
            [storeKey]: {
                ...(prev?.[storeKey] || DEFAULT_STORE_WATERMARKS[storeKey]),
                imageUrl: ''
            }
        }));
    };

    const handleSaveWatermarks = (e) => {
        e.preventDefault();
        updateStoreWatermarks(localWatermarks);
        setWatermarkMsg('Store background watermark settings saved successfully!');
        setTimeout(() => setWatermarkMsg(''), 3000);
    };

    // Product Filter & Bulk Assignment State
    const [productStoreFilter, setProductStoreFilter] = useState('all');
    const [productAdminSearch, setProductAdminSearch] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [newCategoryStore, setNewCategoryStore] = useState('jewels');

    // Account Form State
    const [accountForm, setAccountForm] = useState({
        email: adminUser.email,
        password: adminUser.password
    });
    const [accountMsg, setAccountMsg] = useState('');

    // Category Form State
    const [newCategory, setNewCategory] = useState('');

    // Social Form State
    const [socialForm, setSocialForm] = useState({ whatsapp: '', instagram: '' });

    // Update form when context data loads
    React.useEffect(() => {
        if (socialLinks) {
            setSocialForm(socialLinks);
        }
    }, [socialLinks]);

    // Invoice Form State
    const [invoiceForm, setInvoiceForm] = useState({
        address: '',
        email: '',
        website: ''
    });

    useEffect(() => {
        if (invoiceSettings) {
            setInvoiceForm(invoiceSettings);
        }
    }, [invoiceSettings]);

    const handleInvoiceSettingsUpdate = (e) => {
        e.preventDefault();
        updateInvoiceSettings(invoiceForm);
        alert('Invoice settings updated successfully!');
    };

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    // --- Product Handlers ---
    const handleProductSubmit = (e) => {
        e.preventDefault();
        if (!productForm.title || !productForm.basePrice || !productForm.category) return;

        const basePrice = parseFloat(productForm.basePrice);
        const discountPercent = parseFloat(productForm.discountPercent) || 0;
        const finalPrice = Math.round(basePrice * (1 - discountPercent / 100));

        // Ensure images array is populated
        const images = productForm.images && productForm.images.length > 0
            ? productForm.images
            : (productForm.imageUrl ? [productForm.imageUrl] : []);

        const productData = {
            ...productForm,
            isNewArrival: productForm.isNewArrival,
            basePrice: basePrice,
            discountPercent: discountPercent,
            price: finalPrice,
            images: images,
            imageUrl: images[0] || '', // Main image is the first one
            id: isEditing && currentProduct ? currentProduct.id : Date.now().toString(),
            createdAt: isEditing && currentProduct ? (currentProduct.createdAt || new Date().toISOString()) : new Date().toISOString()
        };

        if (isEditing && currentProduct) {
            updateProduct(currentProduct.id, productData);
        } else {
            addProduct(productData);
        }
        resetForm();
    };

    const startEdit = (product) => {
        setIsEditing(true);
        setCurrentProduct(product);
        setProductForm({
            ...product,
            basePrice: product.basePrice || product.price,
            discountPercent: product.discountPercent || 0,
            images: product.images || (product.imageUrl ? [product.imageUrl] : []),
            isNewArrival: product.isNewArrival || false
        });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentProduct(null);
        setProductForm({
            title: '',
            artist: '',
            basePrice: '',
            discountPercent: '',
            price: '',
            category: 'Cyberpunk',
            isNewArrival: false,
            description: '',
            imageUrl: '',
            images: []
        });
    };


    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const uploadedUrls = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                let fileToUpload = file;

                // Show explicit status
                setUploadProgress(`Processing ${i + 1}/${files.length}: Compressing...`);
                console.log(`[Upload ${i + 1}] Starting processing for ${file.name}`);

                // 1. Compress with Timeout
                try {
                    if (file.type.startsWith('image/') && file.size > 500 * 1024) {
                        // Create a race between compression and a 3-second timeout
                        const compressionPromise = compressImage(file);
                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error("Timeout")), 3000)
                        );

                        try {
                            const compressedBlob = await Promise.race([compressionPromise, timeoutPromise]);
                            fileToUpload = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
                            console.log(`[Upload ${i + 1}] Compression successful.`);
                        } catch (timeoutErr) {
                            console.warn(`[Upload ${i + 1}] Compression timed out or failed. Uploading original.`, timeoutErr);
                        }
                    }
                } catch (err) {
                    console.warn(`[Upload ${i + 1}] Compression skipped:`, err);
                }

                // 2. Upload
                setUploadProgress(`Processing ${i + 1}/${files.length}: Uploading...`);
                console.log(`[Upload ${i + 1}] uploading to Firebase...`);

                const fileRef = storageRef(storage, `products/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`);
                await uploadBytes(fileRef, fileToUpload);
                const url = await getDownloadURL(fileRef);
                uploadedUrls.push(url);

                console.log(`[Upload ${i + 1}] Finished. URL:`, url);
            }

            setProductForm(prev => {
                const newImages = [...(prev.images || []), ...uploadedUrls];
                return {
                    ...prev,
                    images: newImages,
                    imageUrl: prev.imageUrl || newImages[0]
                };
            });

        } catch (error) {
            console.error("Critical Error uploading images:", error);
            alert("Upload failed. Please try again or use smaller images.");
        } finally {
            setUploading(false);
            setUploadProgress('');
            e.target.value = null;
        }
    };

    const removeImage = (index) => {
        setProductForm(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);
            return {
                ...prev,
                images: newImages,
                imageUrl: newImages.length > 0 ? newImages[0] : ''
            };
        });
    };

    // --- QR Handlers ---
    const handleQrUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateQrCode(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Order Handlers ---
    const handleVerify = (orderId) => {
        verifyOrder(orderId);
    };

    const handleDownloadInvoice = (order) => {
        generateInvoice(order, invoiceSettings);
    };

    // --- Category Handlers ---
    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategory.trim()) {
            addCategory(newCategory.trim(), newCategoryStore);
            setNewCategory('');
        }
    };

    // --- Promo Bar Handlers ---
    const handlePromoSubmit = (e) => {
        e.preventDefault();
        if (!promoForm.text.trim()) return;

        if (editingPromoId) {
            updatePromotion(editingPromoId, {
                text: promoForm.text.trim(),
                badge: promoForm.badge.trim(),
                link: promoForm.link.trim(),
                isActive: promoForm.isActive
            });
            setPromoMsg('Promotion updated successfully!');
            setEditingPromoId(null);
        } else {
            addPromotion({
                text: promoForm.text.trim(),
                badge: promoForm.badge.trim(),
                link: promoForm.link.trim(),
                isActive: promoForm.isActive
            });
            setPromoMsg('New promotion added to live banner!');
        }

        setPromoForm({
            text: '',
            badge: '⚡ FLASH DEAL',
            link: '',
            isActive: true
        });

        setTimeout(() => setPromoMsg(''), 3000);
    };

    const startPromoEdit = (promo) => {
        setEditingPromoId(promo.id);
        setPromoForm({
            text: promo.text || '',
            badge: promo.badge || '',
            link: promo.link || '',
            isActive: promo.isActive !== false
        });
        window.scrollTo({ top: 350, behavior: 'smooth' });
    };

    const cancelPromoEdit = () => {
        setEditingPromoId(null);
        setPromoForm({
            text: '',
            badge: '⚡ FLASH DEAL',
            link: '',
            isActive: true
        });
    };

    // --- Account Handlers ---
    const handleAccountUpdate = (e) => {
        e.preventDefault();
        updateAdminCredentials(accountForm.email, accountForm.password);
        setAccountMsg('Credentials updated successfully!');
        setTimeout(() => setAccountMsg(''), 3000);
    };

    // --- Export Handlers ---
    const safeCSV = (str) => {
        // Convert to string, escape double quotes by doubling them, and wrap in quotes
        return `"${String(str || '').replace(/"/g, '""')}"`;
    };

    const exportLogsToCSV = () => {
        const headers = ['Timestamp', 'Action Type', 'User Name', 'User Email', 'Order ID', 'Details'];
        const rows = activityLogs.map(log => [
            safeCSV(new Date(log.timestamp).toLocaleString()),
            safeCSV(log.actionType),
            safeCSV(log.userName),
            safeCSV(log.userEmail),
            safeCSV(log.orderId || '-'),
            safeCSV(log.details)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.download = `narayanis-nila-activity-log-${dateStr}.csv`;
        link.click();
    };

    const exportOrdersToCSV = () => {
        // Exact header requirement: Order ID,Date,Time,Customer Name,Email,Phone,Address,Items,Total,Status
        const headers = ['Order ID', 'Date', 'Time', 'Customer Name', 'Email', 'Phone', 'Address', 'Shipping State', 'Items', 'Subtotal', 'Delivery Charge', 'Total Amount', 'Status'];

        const rows = orders.map(order => {
            const dateObj = new Date(order.date || Date.now());
            // Date: DD-MM-YYYY
            const dateStr = dateObj.toLocaleDateString('en-GB').replace(/\//g, '-');
            // Time: hh:mm:ss pm
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour12: true }).toLowerCase();

            return [
                safeCSV(order.id),
                safeCSV(dateStr),
                safeCSV(timeStr),
                safeCSV(order.customer?.name || 'Unknown'),
                safeCSV(order.customer?.email || '-'),
                safeCSV(order.customer?.phone || '-'),
                safeCSV(order.customer?.address || '-'),
                safeCSV((order.items || []).map(i => {
                    const basePrice = i.basePrice || i.price;
                    const discount = i.discountPercent || 0;
                    const details = `${i.title} (x${i.quantity})`;
                    return discount > 0
                        ? `${details} [MRP: ${basePrice}, Disc: ${discount}%, Price: ${i.price}]`
                        : `${details} [Price: ${i.price}]`;
                }).join('; ')),
                safeCSV((order.total || 0).toFixed(2)),
                safeCSV(order.status || 'Pending')
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        link.download = `narayanis-nila-orders-${dateStr}.csv`;
        link.click();
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Super Admin Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>

            <div className="dashboard-content">
                <nav className="sidebar">
                    <button
                        className={activeTab === 'products' ? 'active' : ''}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                    <button
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button
                        className={activeTab === 'categories' ? 'active' : ''}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categories
                    </button>
                    <button
                        className={activeTab === 'delivery' ? 'active' : ''}
                        onClick={() => setActiveTab('delivery')}
                    >
                        🚚 Delivery Charges
                    </button>
                    <button
                        className={activeTab === 'watermarks' ? 'active' : ''}
                        onClick={() => setActiveTab('watermarks')}
                    >
                        🎨 Store Watermarks
                    </button>
                    <button
                        className={activeTab === 'logs' ? 'active' : ''}
                        onClick={() => setActiveTab('logs')}
                    >
                        Logs
                    </button>
                    <button
                        className={activeTab === 'account' ? 'active' : ''}
                        onClick={() => setActiveTab('account')}
                    >
                        Settings
                    </button>
                    <button
                        className={activeTab === 'messages' ? 'active' : ''}
                        onClick={() => setActiveTab('messages')}
                    >
                        Messages
                    </button>
                    <button
                        className={activeTab === 'promotions' ? 'active' : ''}
                        onClick={() => setActiveTab('promotions')}
                    >
                        Promo Bar
                    </button>
                </nav>

                <main className="main-panel">
                    {activeTab === 'products' && (
                        <div className="products-section">
                            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                            <form onSubmit={handleProductSubmit} className="product-form">
                                <div className="form-row">
                                    <input
                                        placeholder="Product Name"
                                        value={productForm.title}
                                        onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                                        required
                                    />
                                    <input
                                        placeholder="Base Price (₹)"
                                        type="number"
                                        value={productForm.basePrice || ''}
                                        onChange={e => setProductForm({ ...productForm, basePrice: e.target.value })}
                                        required
                                    />
                                    <input
                                        placeholder="Discount (%)"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={productForm.discountPercent || ''}
                                        onChange={e => setProductForm({ ...productForm, discountPercent: e.target.value })}
                                    />
                                    <div className="price-preview">
                                        Selling Price: ₹
                                        {Math.round((productForm.basePrice || 0) * (1 - (productForm.discountPercent || 0) / 100))}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <select
                                        value={productForm.category}
                                        onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        placeholder="Product Code"
                                        value={productForm.artist}
                                        onChange={e => setProductForm({ ...productForm, artist: e.target.value })}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            id="newArrival"
                                            checked={productForm.isNewArrival || false}
                                            onChange={e => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                                            style={{ width: 'auto', margin: 0 }}
                                        />
                                        <label htmlFor="newArrival" style={{ marginBottom: 0, fontWeight: 'bold', color: '#D4AF37' }}>Mark as New Arrival</label>
                                    </div>

                                </div>
                                <textarea
                                    placeholder="Description"
                                    value={productForm.description}
                                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                />

                                <div className="url-input-wrapper" style={{ marginTop: '1rem', marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>OR Add Image via URL (One per line)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <textarea
                                            placeholder="Paste image links here (one per line)..."
                                            id="imageUrlInput"
                                            rows="3"
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                                        />
                                        <button
                                            type="button"
                                            className="save-btn"
                                            style={{ alignSelf: 'flex-start' }}
                                            onClick={() => {
                                                const input = document.getElementById('imageUrlInput');
                                                const rawValue = input.value.trim();
                                                if (!rawValue) return;

                                                const urls = rawValue.split(/[\n,]+/).map(u => u.trim()).filter(u => u);

                                                const processedUrls = urls.map(url => {
                                                    // Google Drive Link Converter
                                                    if (url.includes('drive.google.com')) {
                                                        try {
                                                            const idMatch = url.match(/[-\w]{25,}/);
                                                            if (idMatch) {
                                                                // Use the lh3.googleusercontent.com endpoint for best reliability
                                                                return `https://lh3.googleusercontent.com/d/${idMatch[0]}=w1000`;
                                                            }
                                                        } catch {
                                                            console.warn('Failed to convert Drive link:', url);
                                                        }
                                                    }
                                                    return url;
                                                });

                                                setProductForm(prev => {
                                                    const newImages = [...(prev.images || []), ...processedUrls];
                                                    return {
                                                        ...prev,
                                                        images: newImages,
                                                        imageUrl: prev.imageUrl || newImages[0]
                                                    };
                                                });
                                                input.value = '';
                                            }}
                                        >
                                            Add URLs
                                        </button>
                                    </div>
                                    <p className="text-sm" style={{ color: '#666', marginTop: '0.5rem' }}>
                                        Note: For Google Drive, ensure the file access is set to <strong>"Anyone with the link"</strong>.
                                    </p>
                                </div>

                                <div className="file-input-wrapper">
                                    <label>Product Images (Select multiple):</label>
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                                    {uploading && (
                                        <p className="loading-text" style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                                            Uploading... {uploadProgress ? `(${uploadProgress} completed)` : ''}
                                        </p>
                                    )}
                                    <div className="image-previews">
                                        {(productForm.images || []).map((img, index) => (
                                            <div key={index} className="preview-item">
                                                <img src={img} alt={`Preview ${index}`} className="img-preview-small" />
                                                <button type="button" onClick={() => removeImage(index)} className="remove-img-btn">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="save-btn">{isEditing ? 'Update Product' : 'Add Product'}</button>
                                    {isEditing && <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>}
                                </div>
                            </form>

                            <div className="products-list">
                                <h3>Current Products</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Price</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(p => (
                                            <tr key={p.id}>
                                                <td><img src={p.imageUrl} alt={p.title} className="table-img" /></td>
                                                <td>{p.title} {p.isNewArrival && <span className="badge" style={{ background: '#D4AF37', color: '#000', fontSize: '0.7em' }}>NEW</span>}</td>
                                                <td>
                                                    <div>MRP: ₹{p.basePrice || p.price}</div>
                                                    {p.discountPercent > 0 && (
                                                        <div className="discount-info">
                                                            <span className="badge">{p.discountPercent}% OFF</span>
                                                            <span className="final-price">₹{p.price}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <button onClick={() => startEdit(p)} className="edit-btn">Edit</button>
                                                    <button onClick={() => deleteProduct(p.id)} className="delete-btn">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'qr' && (
                        <div className="qr-section">
                            <h2>UPI QR Code Management</h2>
                            <div className="qr-upload-area">
                                <div className="current-qr">
                                    <h3>Current QR Code</h3>
                                    {qrCode ? (
                                        <img src={qrCode} alt="Current QR" className="qr-preview" />
                                    ) : (
                                        <div className="no-qr">No QR Code Uploaded</div>
                                    )}
                                </div>
                                <div className="upload-controls">
                                    <label className="upload-btn-label">
                                        Upload New QR Image
                                        <input type="file" accept="image/*" onChange={handleQrUpload} hidden />
                                    </label>
                                    <p className="help-text">Upload a clear image of your UPI QR code. This will be shown to customers at checkout.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="orders-section">
                            <div className="section-header">
                                <h2>Orders & Verification</h2>
                                <button onClick={exportOrdersToCSV} className="export-btn">
                                    Export Orders (Excel)
                                </button>
                            </div>

                            {orders.length === 0 ? (
                                <p className="no-data">No orders yet.</p>
                            ) : (
                                <div className="orders-table-wrapper">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Date</th>
                                                <th>Customer Details</th>
                                                <th>Address</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id}>
                                                    <td>{order.id}</td>
                                                    <td>{order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</td>
                                                    <td>
                                                        <div className="font-bold">{order.customer?.name || 'Unknown'}</div>
                                                        <div className="text-sm">{order.customer?.email || '-'}</div>
                                                        <div className="text-sm">{order.customer?.phone || '-'}</div>
                                                    </td>
                                                    <td className="address-cell">{order.customer?.address || '-'}</td>
                                                    <td>
                                                        <div className="font-bold">₹{(order.total || 0).toFixed(2)}</div>
                                                        {order.deliveryCharge !== undefined && (
                                                            <div style={{ fontSize: '0.75rem', color: '#B58D3D', marginTop: '2px' }}>
                                                                Del: {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                                                                {order.deliveryBreakdown && (order.deliveryBreakdown.sareeSurcharge > 0 || order.deliveryBreakdown.jewelsSurcharge > 0) && (
                                                                    <span> (Base: ₹{order.deliveryBreakdown.effectiveBaseCharge}{order.deliveryBreakdown.sareeSurcharge > 0 ? `, Sarees: +₹${order.deliveryBreakdown.sareeSurcharge}` : ''}{order.deliveryBreakdown.jewelsSurcharge > 0 ? `, Jewels: +₹${order.deliveryBreakdown.jewelsSurcharge}` : ''})</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${(order.status || 'pending').toLowerCase()}`}>
                                                            {order.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {order.status === 'Pending' ? (
                                                            <button
                                                                onClick={() => handleVerify(order.id)}
                                                                className="verify-btn"
                                                            >
                                                                Verify Payment
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDownloadInvoice(order)}
                                                                className="invoice-btn"
                                                            >
                                                                Download Invoice
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="logs-section">
                            <div className="section-header">
                                <h2>Activity Logs</h2>
                                <button onClick={exportLogsToCSV} className="export-btn">
                                    Export All Activity (Excel)
                                </button>
                            </div>
                            <div className="logs-table-wrapper">
                                <table className="logs-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Action</th>
                                            <th>User</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activityLogs.map(log => (
                                            <tr key={log.id}>
                                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                <td><span className="action-badge">{log.actionType}</span></td>
                                                <td>
                                                    <div>{log.userName}</div>
                                                    <div className="text-sm">{log.userEmail}</div>
                                                </td>
                                                <td className="details-cell">{log.details}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="messages-section">
                            <div className="section-header">
                                <h2>Customer Messages</h2>
                            </div>
                            {messages.length === 0 ? (
                                <p className="no-data">No messages found.</p>
                            ) : (
                                <div className="logs-table-wrapper">
                                    <table className="logs-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Name</th>
                                                <th>Contact</th>
                                                <th>Message</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {messages.map((msg, index) => (
                                                <tr key={msg.id || index}>
                                                    <td>{new Date(msg.timestamp).toLocaleString()}</td>
                                                    <td>{msg.name}</td>
                                                    <td>
                                                        <div>{msg.email}</div>
                                                        <div className="text-sm">{msg.phone}</div>
                                                    </td>
                                                    <td className="details-cell">{msg.message}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'promotions' && (
                        <div className="promotions-section">
                            <div className="section-header">
                                <h2>Promo Bar & Announcements</h2>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                                    Manage the top flashing promotional ticker displayed to customers across the website.
                                </p>
                            </div>

                            {/* Global Banner Settings Card */}
                            <div className="account-card" style={{ marginBottom: '2rem' }}>
                                <h3>Global Banner Settings</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', marginTop: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                        <input
                                            type="checkbox"
                                            checked={promoSettings?.isEnabled !== false}
                                            onChange={(e) => updatePromoSettings({ ...promoSettings, isEnabled: e.target.checked })}
                                            style={{ width: '18px', height: '18px', accentColor: '#D4AF37' }}
                                        />
                                        <span>Show Promo Bar on Website</span>
                                    </label>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <label style={{ fontWeight: 'bold' }}>Rotation Speed:</label>
                                        <select
                                            value={promoSettings?.speed || 4000}
                                            onChange={(e) => updatePromoSettings({ ...promoSettings, speed: Number(e.target.value) })}
                                            style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff' }}
                                        >
                                            <option value={3000}>3 Seconds (Fast)</option>
                                            <option value={4000}>4 Seconds (Recommended)</option>
                                            <option value={5000}>5 Seconds (Relaxed)</option>
                                            <option value={6000}>6 Seconds (Slow)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Live Storefront Preview */}
                            <div className="account-card" style={{ marginBottom: '2rem', background: '#1c080b', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
                                <h3 style={{ color: '#D4AF37', marginBottom: '0.5rem' }}>Live Storefront Preview</h3>
                                <p style={{ color: '#E5C978', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    {promoSettings?.isEnabled === false
                                        ? '⚠️ Promo Bar is currently hidden on the website.'
                                        : 'Preview of how your deals appear at the top of the storefront with the flashing badge:'}
                                </p>
                                <div style={{
                                    background: 'linear-gradient(90deg, #240406 0%, #3D080A 50%, #240406 100%)',
                                    border: '1px solid rgba(212, 175, 55, 0.5)',
                                    borderRadius: '6px',
                                    padding: '10px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                    minHeight: '44px'
                                }}>
                                    {promoForm.badge && (
                                        <span style={{
                                            background: 'linear-gradient(135deg, #D4AF37 0%, #B08D1E 100%)',
                                            color: '#240406',
                                            padding: '3px 9px',
                                            borderRadius: '999px',
                                            fontWeight: '800',
                                            fontSize: '0.72rem',
                                            letterSpacing: '0.06em',
                                            boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)'
                                        }}>
                                            {promoForm.badge}
                                        </span>
                                    )}
                                    <span style={{ color: '#FFF3CD', fontWeight: '600', fontSize: '0.9rem' }}>
                                        {promoForm.text || '✨ Flat 20% OFF on all Temple Jewellery | Use code NILA20'}
                                    </span>
                                </div>
                            </div>

                            {/* Add / Edit Promo Form */}
                            <div className="account-card" style={{ marginBottom: '2rem' }}>
                                <h3>{editingPromoId ? 'Edit Promotion' : 'Add New Promotion'}</h3>
                                <form onSubmit={handlePromoSubmit} style={{ marginTop: '1rem' }}>
                                    <div className="form-group">
                                        <label>Select Flashing Badge Preset</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                            {['⚡ FLASH DEAL', '🔥 LIMITED OFFER', '🚚 FREE DELIVERY', '✨ NEW ARRIVAL', '🎉 FESTIVE SALE', '💎 SPECIAL OFFER'].map(preset => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => setPromoForm({ ...promoForm, badge: preset })}
                                                    style={{
                                                        background: promoForm.badge === preset ? '#D4AF37' : '#f0f0f0',
                                                        color: promoForm.badge === preset ? '#240406' : '#444',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.78rem',
                                                        padding: '5px 12px',
                                                        borderRadius: '20px',
                                                        border: '1px solid #ccc',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            value={promoForm.badge}
                                            onChange={(e) => setPromoForm({ ...promoForm, badge: e.target.value })}
                                            placeholder="Or enter custom badge (e.g. ⚡ FLASH DEAL)"
                                            style={{ marginTop: '4px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Announcement / Offer Text <span style={{ color: '#dc3545' }}>*</span></label>
                                        <textarea
                                            rows="2"
                                            required
                                            value={promoForm.text}
                                            onChange={(e) => setPromoForm({ ...promoForm, text: e.target.value })}
                                            placeholder="e.g. Flat 20% OFF on all Temple & Antique Jewellery | Use Code: NILA20"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Optional Link (e.g. #contact or external URL)</label>
                                        <input
                                            type="text"
                                            value={promoForm.link || ''}
                                            onChange={(e) => setPromoForm({ ...promoForm, link: e.target.value })}
                                            placeholder="e.g. #contact"
                                        />
                                    </div>

                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            id="promoActiveCheck"
                                            checked={promoForm.isActive !== false}
                                            onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                                            style={{ width: '18px', height: '18px', accentColor: '#D4AF37' }}
                                        />
                                        <label htmlFor="promoActiveCheck" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 'bold' }}>
                                            Active on website
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button type="submit" className="save-btn" style={{ background: '#28a745' }}>
                                            {editingPromoId ? 'Update Promotion' : 'Add Promotion'}
                                        </button>
                                        {editingPromoId && (
                                            <button
                                                type="button"
                                                onClick={cancelPromoEdit}
                                                className="cancel-btn"
                                                style={{ background: '#6c757d', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                    {promoMsg && <p className="success-msg" style={{ marginTop: '1rem' }}>{promoMsg}</p>}
                                </form>
                            </div>

                            {/* Current Promotions List */}
                            <div className="account-card">
                                <h3>Current Promotions ({promotions ? promotions.length : 0})</h3>
                                {(!promotions || promotions.length === 0) ? (
                                    <p style={{ color: '#777', padding: '1rem 0' }}>No promotions configured yet. Add your first promotion above!</p>
                                ) : (
                                    <div className="logs-table-wrapper" style={{ marginTop: '1rem' }}>
                                        <table className="logs-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '150px' }}>Badge</th>
                                                    <th>Announcement Text</th>
                                                    <th style={{ width: '120px' }}>Status</th>
                                                    <th style={{ width: '220px', textAlign: 'center' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {promotions.map((p) => (
                                                    <tr key={p.id}>
                                                        <td>
                                                            {p.badge ? (
                                                                <span style={{
                                                                    background: '#D4AF37',
                                                                    color: '#240406',
                                                                    padding: '3px 8px',
                                                                    borderRadius: '999px',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.75rem'
                                                                }}>
                                                                    {p.badge}
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: '#999', fontSize: '0.8rem' }}>None</span>
                                                            )}
                                                        </td>
                                                        <td style={{ fontWeight: '500' }}>
                                                            {p.text}
                                                            {p.link && (
                                                                <div style={{ fontSize: '0.75rem', color: '#007bff' }}>
                                                                    Link: {p.link}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {p.isActive !== false ? (
                                                                <span style={{ background: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.78rem' }}>
                                                                    ● Active
                                                                </span>
                                                            ) : (
                                                                <span style={{ background: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.78rem' }}>
                                                                    ⏸ Paused
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                                <button
                                                                    onClick={() => togglePromotionActive(p.id, p.isActive !== false)}
                                                                    style={{
                                                                        background: p.isActive !== false ? '#ffc107' : '#28a745',
                                                                        color: p.isActive !== false ? '#212529' : '#fff',
                                                                        border: 'none',
                                                                        padding: '5px 10px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.78rem',
                                                                        fontWeight: 'bold',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    {p.isActive !== false ? 'Pause' : 'Activate'}
                                                                </button>
                                                                <button
                                                                    onClick={() => startPromoEdit(p)}
                                                                    style={{
                                                                        background: '#007bff',
                                                                        color: '#fff',
                                                                        border: 'none',
                                                                        padding: '5px 10px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.78rem',
                                                                        fontWeight: 'bold',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm('Delete this promotion?')) {
                                                                            deletePromotion(p.id);
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        background: '#dc3545',
                                                                        color: '#fff',
                                                                        border: 'none',
                                                                        padding: '5px 10px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.78rem',
                                                                        fontWeight: 'bold',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="account-section">
                            <h2>Settings & Configuration</h2>

                            {/* Invoice Settings */}
                            <div className="account-card" style={{ marginBottom: '2rem' }}>
                                <h3>Invoice Details</h3>
                                <p className="text-sm" style={{ marginBottom: '1rem' }}>These details will appear on the generated PDF invoices.</p>
                                <form onSubmit={handleInvoiceSettingsUpdate}>
                                    <div className="form-group">
                                        <label>Store Address</label>
                                        <input
                                            type="text"
                                            value={invoiceForm.address || ''}
                                            onChange={e => setInvoiceForm({ ...invoiceForm, address: e.target.value })}
                                            placeholder="123 Gallery St, Art City..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Support Email</label>
                                        <input
                                            type="email"
                                            value={invoiceForm.email || ''}
                                            onChange={e => setInvoiceForm({ ...invoiceForm, email: e.target.value })}
                                            placeholder="support@nilagallery.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Website URL</label>
                                        <input
                                            type="text"
                                            value={invoiceForm.website || ''}
                                            onChange={e => setInvoiceForm({ ...invoiceForm, website: e.target.value })}
                                            placeholder="www.nilagallery.com"
                                        />
                                    </div>
                                    <button type="submit" className="save-btn">Save Invoice Details</button>
                                </form>
                            </div>

                            {/* Social Links */}
                            <div className="account-card" style={{ marginBottom: '2rem' }}>
                                <h3>Social Media Links</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    updateSocialLinks(socialForm);
                                    alert('Social links updated!');
                                }}>
                                    <div className="form-group">
                                        <label>WhatsApp Number</label>
                                        <input
                                            type="text"
                                            value={socialForm.whatsapp}
                                            onChange={e => setSocialForm({ ...socialForm, whatsapp: e.target.value })}
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Instagram URL</label>
                                        <input
                                            type="text"
                                            value={socialForm.instagram}
                                            onChange={e => setSocialForm({ ...socialForm, instagram: e.target.value })}
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                    <button type="submit" className="save-btn">Update Social Links</button>
                                </form>
                            </div>

                            {/* Contact Page Settings */}
                            <div className="account-card" style={{ marginBottom: '2rem' }}>
                                <h3>Contact Page Details</h3>
                                <p className="text-sm" style={{ marginBottom: '1rem' }}>Edit the "Get in Touch" section on the contact page.</p>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    updateContactSettings({
                                        subtitle: formData.get('subtitle'),
                                        email: formData.get('email'),
                                        phone: formData.get('phone'),
                                        address: formData.get('address'),
                                        mapSrc: (() => {
                                            let raw = (formData.get('mapSrc') || '').trim();
                                            if (raw.includes('<iframe')) {
                                                const match = raw.match(/src=["']([^"']+)["']/);
                                                if (match && match[1]) raw = match[1];
                                            }
                                            return raw;
                                        })()
                                    });
                                    alert('Contact page details updated!');
                                }}>
                                    <div className="form-group">
                                        <label>Subtitle Text</label>
                                        <input
                                            name="subtitle"
                                            defaultValue={contactSettings?.subtitle || ''}
                                            placeholder="Book a styling session..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Google Map Embed Code or URL</label>
                                        <input
                                            name="mapSrc"
                                            defaultValue={contactSettings?.mapSrc || ''}
                                            placeholder="Paste iframe embed code from Google Maps or URL..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            name="email"
                                            type="email"
                                            defaultValue={contactSettings?.email || ''}
                                            placeholder="contact@example.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            name="phone"
                                            defaultValue={contactSettings?.phone || ''}
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Studio Address</label>
                                        <textarea
                                            name="address"
                                            defaultValue={contactSettings?.address || ''}
                                            placeholder="Full address..."
                                            rows="3"
                                            style={{ width: '100%', padding: '0.75rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <button type="submit" className="save-btn">Update Contact Details</button>
                                </form>
                            </div>

                            {/* Admin Credentials */}
                            <div className="account-card">
                                <h3>Admin Credentials</h3>
                                <form onSubmit={handleAccountUpdate}>
                                    <div className="form-group">
                                        <label>Admin Email</label>
                                        <input
                                            type="email"
                                            value={accountForm.email}
                                            onChange={e => setAccountForm({ ...accountForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="text"
                                            value={accountForm.password}
                                            onChange={e => setAccountForm({ ...accountForm, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="save-btn" style={{ background: '#dc3545' }}>Update Credentials</button>
                                    {accountMsg && <p className="success-msg">{accountMsg}</p>}
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'categories' && (
                        <div className="categories-section">
                            <h2>Manage Categories</h2>
                            <div className="category-form-card">
                                <form onSubmit={handleAddCategory} className="add-category-form">
                                    <input
                                        placeholder="New Category Name"
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="save-btn">Add Category</button>
                                </form>
                            </div>

                            <div className="categories-list">
                                <h3>Current Categories</h3>
                                {categories.length === 0 ? (
                                    <p>No categories found.</p>
                                ) : (
                                    <ul className="category-items">
                                        {categories.map(cat => (
                                            <li key={cat.id} className="category-item">
                                                <div>
                                                    <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{cat.name}</span>
                                                    <span className={`store-pill ${cat.store === 'drapes' ? 'drapes' : 'jewels'}`}>
                                                        {cat.store === 'drapes' ? '🥻 Signature Sarees' : '💎 Narayani Gallery'}
                                                    </span>
                                                </div>
                                                <button onClick={() => deleteCategory(cat.id)} className="delete-btn">Delete</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    
                    {activeTab === 'delivery' && (
                        <div className="delivery-section">
                            <div className="section-header">
                                <div>
                                    <h2>State-wise Delivery Charges (India)</h2>
                                    <p style={{ color: '#666', fontSize: '0.92rem', marginTop: '4px' }}>
                                        Configure delivery rates for all 28 states and 8 union territories. Delivery is calculated dynamically at checkout based on shipping state.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveDeliverySettings}>
                                {deliveryError && (
                                    <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.85rem 1.2rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #f5c6cb', fontWeight: '500' }}>
                                        ⚠️ {deliveryError}
                                    </div>
                                )}
                                {deliverySavedMsg && (
                                    <div style={{ background: '#d4edda', color: '#155724', padding: '0.85rem 1.2rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #c3e6cb', fontWeight: '500' }}>
                                        ✅ {deliverySavedMsg}
                                    </div>
                                )}

                                {/* Global Delivery Parameters */}
                                <div className="account-card" style={{ maxWidth: '800px', marginBottom: '1.5rem' }}>
                                    <h3>General Delivery Settings</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={localDeliverySettings?.isEnabled !== false}
                                                    onChange={e => setLocalDeliverySettings({ ...localDeliverySettings, isEnabled: e.target.checked })}
                                                    style={{ width: '18px', height: '18px', margin: 0 }}
                                                />
                                                <span>Enable Delivery Charges</span>
                                            </label>
                                            <span className="text-sm">When disabled, delivery is free for all orders.</span>
                                        </div>

                                        <div className="form-group">
                                            <label>Default Rate (₹) for unlisted states</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={localDeliverySettings?.defaultRate !== undefined ? localDeliverySettings.defaultRate : 100}
                                                onChange={e => setLocalDeliverySettings({ ...localDeliverySettings, defaultRate: Math.max(0, parseFloat(e.target.value) || 0) })}
                                                required
                                            />
                                            <span className="text-sm">Applies if a state's rate is unset.</span>
                                        </div>

                                        <div className="form-group">
                                            <label>Free Delivery for Narayani Gallery (Jewellery) (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="5000"
                                                value={localDeliverySettings?.jewelsFreeDeliveryThreshold !== undefined ? localDeliverySettings.jewelsFreeDeliveryThreshold : 5000}
                                                onChange={e => setLocalDeliverySettings({ ...localDeliverySettings, jewelsFreeDeliveryThreshold: Math.max(0, parseFloat(e.target.value) || 0) })}
                                            />
                                            <span className="text-sm">Orders with Narayani Gallery items at or above this amount get free delivery.</span>
                                        </div>

                                        <div className="form-group">
                                            <label>Free Delivery for Signature Sarees (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="10000"
                                                value={localDeliverySettings?.drapesFreeDeliveryThreshold !== undefined ? localDeliverySettings.drapesFreeDeliveryThreshold : 10000}
                                                onChange={e => setLocalDeliverySettings({ ...localDeliverySettings, drapesFreeDeliveryThreshold: Math.max(0, parseFloat(e.target.value) || 0) })}
                                            />
                                            <span className="text-sm">Orders with Signature Sarees items at or above this amount get free delivery.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Signature Sarees Quantity-based Delivery Card */}
                                <div className="account-card" style={{ maxWidth: '800px', marginBottom: '1.5rem', borderTop: '4px solid #880e4f' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h3 style={{ margin: 0 }}>🥻 Signature Sarees — Quantity-based Delivery</h3>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={localDeliverySettings?.sareeQuantityDelivery?.isEnabled === true}
                                                onChange={e => {
                                                    const current = localDeliverySettings?.sareeQuantityDelivery || { blockSize: 5, chargePerBlock: 50 };
                                                    setLocalDeliverySettings({
                                                        ...localDeliverySettings,
                                                        sareeQuantityDelivery: {
                                                            ...current,
                                                            isEnabled: e.target.checked
                                                        }
                                                    });
                                                }}
                                                style={{ width: '18px', height: '18px', margin: 0 }}
                                            />
                                            <span>Enable Saree Quantity Surcharge</span>
                                        </label>
                                    </div>
                                    <p style={{ color: '#666', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
                                        The first block of sarees is covered by the shipping state's base delivery charge. Each additional block (or partial block) incurs the configured fee.
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Sarees per delivery block *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                placeholder="5"
                                                value={localDeliverySettings?.sareeQuantityDelivery?.blockSize !== undefined ? localDeliverySettings.sareeQuantityDelivery.blockSize : 5}
                                                onChange={e => {
                                                    const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                                    setLocalDeliverySettings({
                                                        ...localDeliverySettings,
                                                        sareeQuantityDelivery: {
                                                            ...(localDeliverySettings?.sareeQuantityDelivery || {}),
                                                            blockSize: val
                                                        }
                                                    });
                                                }}
                                            />
                                            <span className="text-sm">Positive whole number (e.g. 5). The first block is covered by the base charge.</span>
                                        </div>

                                        <div className="form-group">
                                            <label>Additional delivery charge per saree block (₹) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="50"
                                                value={localDeliverySettings?.sareeQuantityDelivery?.chargePerBlock !== undefined ? localDeliverySettings.sareeQuantityDelivery.chargePerBlock : 50}
                                                onChange={e => {
                                                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                    setLocalDeliverySettings({
                                                        ...localDeliverySettings,
                                                        sareeQuantityDelivery: {
                                                            ...(localDeliverySettings?.sareeQuantityDelivery || {}),
                                                            chargePerBlock: val
                                                        }
                                                    });
                                                }}
                                            />
                                            <span className="text-sm">Applies once for each additional block. A partially filled additional block incurs the full additional charge.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Narayani Gallery Quantity-based Delivery Card */}
                                <div className="account-card" style={{ maxWidth: '800px', marginBottom: '1.5rem', borderTop: '4px solid #D4AF37' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h3 style={{ margin: 0 }}>💎 Narayani Gallery — Quantity-based Delivery</h3>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={localDeliverySettings?.jewelsQuantityDelivery?.isEnabled === true}
                                                onChange={e => {
                                                    const current = localDeliverySettings?.jewelsQuantityDelivery || { blockSize: 3, chargePerBlock: 30 };
                                                    setLocalDeliverySettings({
                                                        ...localDeliverySettings,
                                                        jewelsQuantityDelivery: {
                                                            ...current,
                                                            isEnabled: e.target.checked
                                                        }
                                                    });
                                                }}
                                                style={{ width: '18px', height: '18px', margin: 0 }}
                                            />
                                            <span>Enable Jewellery Quantity Surcharge</span>
                                        </label>
                                    </div>
                                    <p style={{ color: '#666', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
                                        The first block of jewellery items is covered by the shipping state's base delivery charge. Each additional block (or partial block) incurs the configured fee.
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Jewellery units per delivery block *</label>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                placeholder="3"
                                                value={localDeliverySettings?.jewelsQuantityDelivery?.blockSize !== undefined ? localDeliverySettings.jewelsQuantityDelivery.blockSize : 3}
                                                onChange={e => {
                                                    const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                                    setLocalDeliverySettings({
                                                        ...localDeliverySettings,
                                                        jewelsQuantityDelivery: {
                                                            ...(localDeliverySettings?.jewelsQuantityDelivery || {}),
                                                            blockSize: val
                                                        }
                                                    });
                                                }}
                                            />
                                            <span className="text-sm">Positive whole number (e.g. 3). The first block is covered by the base charge.</span>
                                        </div>

                                        <div className="form-group">
                                            <label>Additional delivery charge per jewellery block (₹) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="30"
                                                value={localDeliverySettings?.jewelsQuantityDelivery?.chargePerBlock !== undefined ? localDeliverySettings.jewelsQuantityDelivery.chargePerBlock : 30}
                                                onChange={e => {
                                                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                    setLocalDeliverySettings({
                                                        ...localDeliverySettings,
                                                        jewelsQuantityDelivery: {
                                                            ...(localDeliverySettings?.jewelsQuantityDelivery || {}),
                                                            chargePerBlock: val
                                                        }
                                                    });
                                                }}
                                            />
                                            <span className="text-sm">Applies once for each additional block. A partially filled additional block incurs the full additional charge.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* State Rates Table */}
                                <div className="account-card" style={{ maxWidth: '800px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h3>State & Union Territory Rates ({INDIAN_STATES_AND_UTS.length} Total)</h3>
                                        <input
                                            type="text"
                                            placeholder="Search state/UT (e.g. Tamil Nadu, Kerala)..."
                                            value={deliverySearch}
                                            onChange={e => setDeliverySearch(e.target.value)}
                                            style={{ maxWidth: '300px', marginBottom: 0, padding: '0.5rem' }}
                                        />
                                    </div>

                                    <div style={{ maxHeight: '520px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: '#1a0b0e', color: '#D4AF37', zIndex: 5 }}>
                                                <tr>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>State / Union Territory</th>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left', width: '180px' }}>Delivery Charge (₹)</th>
                                                    <th style={{ padding: '0.75rem', textAlign: 'left', width: '180px' }}>Status / Quick Set</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {INDIAN_STATES_AND_UTS
                                                    .filter(st => !deliverySearch || st.toLowerCase().includes(deliverySearch.toLowerCase()))
                                                    .map(st => {
                                                        const rates = localDeliverySettings?.stateRates || {};
                                                        const rawVal = rates[st];
                                                        const isExplicitlyConfigured = rawVal !== undefined && rawVal !== null && rawVal !== '';
                                                        const displayVal = isExplicitlyConfigured ? rawVal : '';
                                                        const isZero = Number(rawVal) === 0 && isExplicitlyConfigured;

                                                        return (
                                                            <tr key={st} style={{ borderBottom: '1px solid #eee', background: st === 'Tamil Nadu' ? 'rgba(212, 175, 55, 0.08)' : 'transparent' }}>
                                                                <td style={{ padding: '0.75rem', fontWeight: st === 'Tamil Nadu' ? 'bold' : 'normal' }}>
                                                                    {st} {st === 'Tamil Nadu' && <span style={{ fontSize: '0.75rem', background: '#D4AF37', color: '#1a0b0e', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Primary Base</span>}
                                                                </td>
                                                                <td style={{ padding: '0.75rem' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                        <span style={{ fontWeight: 'bold' }}>₹</span>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            step="1"
                                                                            placeholder={`Default (${localDeliverySettings?.defaultRate ?? 100})`}
                                                                            value={displayVal}
                                                                            onChange={e => handleStateRateChange(st, e.target.value)}
                                                                            style={{ margin: 0, padding: '0.4rem 0.6rem', width: '130px', fontWeight: isExplicitlyConfigured ? 'bold' : 'normal' }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '0.75rem' }}>
                                                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                                        {isZero ? (
                                                                            <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '0.85rem' }}>FREE</span>
                                                                        ) : isExplicitlyConfigured ? (
                                                                            <span style={{ color: '#333', fontSize: '0.85rem' }}>Configured</span>
                                                                        ) : (
                                                                            <span style={{ color: '#888', fontStyle: 'italic', fontSize: '0.85rem' }}>Uses Default</span>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleStateRateChange(st, '0')}
                                                                            style={{ padding: '2px 6px', fontSize: '0.75rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '3px', cursor: 'pointer' }}
                                                                            title="Set Free Delivery for this state"
                                                                        >
                                                                            Free
                                                                        </button>
                                                                        {isExplicitlyConfigured && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const nextRates = { ...(localDeliverySettings?.stateRates || {}) };
                                                                                    delete nextRates[st];
                                                                                    setLocalDeliverySettings({ ...localDeliverySettings, stateRates: nextRates });
                                                                                }}
                                                                                style={{ padding: '2px 6px', fontSize: '0.75rem', background: '#f5f5f5', color: '#666', border: '1px solid #ddd', borderRadius: '3px', cursor: 'pointer' }}
                                                                                title="Reset to default rate"
                                                                            >
                                                                                Reset
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>

                                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button type="submit" className="save-btn" style={{ background: '#28a745', padding: '0.8rem 2rem', fontSize: '1rem' }}>
                                            Save Delivery Settings
                                        </button>
                                        {deliverySavedMsg && (
                                            <span className="success-msg" style={{ margin: 0 }}>{deliverySavedMsg}</span>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}


                    {activeTab === 'watermarks' && (
                        <div className="watermarks-section">
                            <div className="section-header">
                                <div>
                                    <h2>Store Background Watermark Settings</h2>
                                    <p style={{ color: '#666', fontSize: '0.92rem', marginTop: '4px' }}>
                                        Set independent background watermarks for <strong>Narayani Gallery</strong> and <strong>Signature Sarees</strong> (similar to Microsoft Word page watermarks). Watermarks switch automatically as visitors toggle stores. Shared cart and checkout remain on clean neutral backgrounds.
                                    </p>
                                </div>
                            </div>

                            {watermarkError && (
                                <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #f5c6cb' }}>
                                    ⚠️ {watermarkError}
                                </div>
                            )}

                            <form onSubmit={handleSaveWatermarks}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', maxWidth: '1050px', marginBottom: '2rem' }}>
                                    
                                    {/* Store Watermark Cards */}
                                    {['jewels', 'drapes'].map((storeKey) => {
                                        const isJewels = storeKey === 'jewels';
                                        const storeTitle = isJewels ? '💎 Narayani Gallery (Jewellery)' : '🥻 Signature Sarees (Sarees)';
                                        const currentConfig = localWatermarks?.[storeKey] || DEFAULT_STORE_WATERMARKS[storeKey];
                                        const defaultAsset = isJewels ? watermarkJewelsDefault : watermarkDrapesDefault;

                                        return (
                                            <div key={storeKey} className="account-card" style={{ borderTop: `4px solid ${isJewels ? '#D4AF37' : '#C2185B'}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <h3 style={{ margin: 0 }}>{storeTitle}</h3>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 'bold' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={currentConfig.isEnabled !== false}
                                                            onChange={e => {
                                                                setLocalWatermarks(prev => ({
                                                                    ...prev,
                                                                    [storeKey]: {
                                                                        ...(prev?.[storeKey] || DEFAULT_STORE_WATERMARKS[storeKey]),
                                                                        isEnabled: e.target.checked
                                                                    }
                                                                }));
                                                            }}
                                                            style={{ width: '16px', height: '16px', margin: 0 }}
                                                        />
                                                        <span>Enable</span>
                                                    </label>
                                                </div>

                                                {/* Live Visual Preview Box */}
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>
                                                        Live Background Preview:
                                                    </label>
                                                    <div className="watermark-preview-canvas" style={{
                                                        background: '#1a0b0e',
                                                        borderRadius: '8px',
                                                        height: '190px',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        alignItems: currentConfig.position === 'top' ? 'flex-start' : (currentConfig.position === 'bottom' ? 'flex-end' : 'center'),
                                                        justifyContent: 'center',
                                                        border: '1.5px solid rgba(212, 175, 55, 0.3)',
                                                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
                                                    }}>
                                                        {currentConfig.isEnabled !== false && currentConfig.imageUrl ? (
                                                            <img
                                                                src={currentConfig.imageUrl}
                                                                alt="Watermark preview"
                                                                style={{
                                                                    maxWidth: `${currentConfig.scale || 70}%`,
                                                                    maxHeight: `${currentConfig.scale || 70}%`,
                                                                    objectFit: 'contain',
                                                                    opacity: currentConfig.opacity !== undefined ? currentConfig.opacity : 0.08,
                                                                    transform: `rotate(${currentConfig.rotation || 0}deg)`,
                                                                    pointerEvents: 'none',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                            />
                                                        ) : (
                                                            <div style={{ color: '#888', fontStyle: 'italic', fontSize: '0.85rem', alignSelf: 'center' }}>
                                                                Watermark Disabled
                                                            </div>
                                                        )}

                                                        {/* Simulated sample card overlay to show clear readability */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '12px',
                                                            left: '12px',
                                                            right: '12px',
                                                            background: 'rgba(61, 8, 10, 0.85)',
                                                            border: '1px solid rgba(212, 175, 55, 0.4)',
                                                            borderRadius: '6px',
                                                            padding: '6px 10px',
                                                            color: '#E5C978',
                                                            fontSize: '0.75rem',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            pointerEvents: 'none'
                                                        }}>
                                                            <span>✨ Sample Product Card (100% Readable)</span>
                                                            <strong style={{ color: '#D4AF37' }}>₹4,999</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Upload & Actions */}
                                                <div className="form-group">
                                                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Watermark Image File (PNG, SVG, WEBP)</label>
                                                    <input
                                                        type="file"
                                                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleWatermarkImageUpload(storeKey, e.target.files[0]);
                                                                e.target.value = null;
                                                            }
                                                        }}
                                                        style={{ fontSize: '0.85rem' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResetWatermarkDefault(storeKey)}
                                                            style={{ fontSize: '0.78rem', background: '#f0f0f0', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            Reset to Default Motif
                                                        </button>
                                                        {currentConfig.imageUrl && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveWatermarkImage(storeKey)}
                                                                style={{ fontSize: '0.78rem', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                            >
                                                                Remove Image
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Opacity Slider */}
                                                <div className="form-group">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                            Watermark Opacity:
                                                        </label>
                                                        <span style={{ fontWeight: 'bold', color: '#D4AF37', fontSize: '0.85rem' }}>
                                                            {Math.round((currentConfig.opacity !== undefined ? currentConfig.opacity : 0.08) * 100)}%
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0.02"
                                                        max="0.30"
                                                        step="0.01"
                                                        value={currentConfig.opacity !== undefined ? currentConfig.opacity : 0.08}
                                                        onChange={e => {
                                                            const val = parseFloat(e.target.value);
                                                            setLocalWatermarks(prev => ({
                                                                ...prev,
                                                                [storeKey]: {
                                                                    ...(prev?.[storeKey] || DEFAULT_STORE_WATERMARKS[storeKey]),
                                                                    opacity: val
                                                                }
                                                            }));
                                                        }}
                                                        style={{ width: '100%', margin: '0.3rem 0', accentColor: '#D4AF37' }}
                                                    />
                                                    <span className="text-sm">Recommended subtle range: 5% - 12% (similar to Word documents).</span>
                                                </div>

                                                {/* Size & Position in 2 columns */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                                    <div className="form-group">
                                                        <label style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>
                                                            Scale: {currentConfig.scale || 70}%
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="30"
                                                            max="100"
                                                            step="5"
                                                            value={currentConfig.scale || 70}
                                                            onChange={e => {
                                                                const val = parseInt(e.target.value, 10);
                                                                setLocalWatermarks(prev => ({
                                                                    ...prev,
                                                                    [storeKey]: {
                                                                        ...(prev?.[storeKey] || DEFAULT_STORE_WATERMARKS[storeKey]),
                                                                        scale: val
                                                                    }
                                                                }));
                                                            }}
                                                            style={{ width: '100%', margin: '0.2rem 0', accentColor: '#D4AF37' }}
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>Vertical Position</label>
                                                        <select
                                                            value={currentConfig.position || 'center'}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                setLocalWatermarks(prev => ({
                                                                    ...prev,
                                                                    [storeKey]: {
                                                                        ...(prev?.[storeKey] || DEFAULT_STORE_WATERMARKS[storeKey]),
                                                                        position: val
                                                                    }
                                                                }));
                                                            }}
                                                            style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                                        >
                                                            <option value="center">Center (Standard)</option>
                                                            <option value="top">Top Header Area</option>
                                                            <option value="bottom">Bottom Footer Area</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Rotation Option */}
                                                <div className="form-group">
                                                    <label style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>Watermark Angle / Rotation</label>
                                                    <select
                                                        value={currentConfig.rotation || 0}
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value, 10);
                                                            setLocalWatermarks(prev => ({
                                                                ...prev,
                                                                [storeKey]: {
                                                                    ...(prev?.[storeKey] || DEFAULT_STORE_WATERMARKS[storeKey]),
                                                                    rotation: val
                                                                }
                                                            }));
                                                        }}
                                                        style={{ padding: '0.4rem', fontSize: '0.85rem', marginBottom: 0 }}
                                                    >
                                                        <option value="0">0° Horizontal (Default)</option>
                                                        <option value="-15">-15° Gentle Diagonal</option>
                                                        <option value="-30">-30° Classic Word Diagonal</option>
                                                        <option value="15">15° Upward Angle</option>
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="save-btn" style={{ background: '#28a745', padding: '0.8rem 2rem', fontSize: '1rem' }}>
                                        Save Watermark Settings
                                    </button>
                                    {watermarkMsg && (
                                        <span className="success-msg" style={{ margin: 0 }}>{watermarkMsg}</span>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

{activeTab === 'social' && (
                        <div className="social-section">
                            <h2>Social Media Links</h2>
                            <div className="account-card">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    updateSocialLinks(socialForm);
                                    alert('Social links updated!');
                                }}>
                                    <div className="form-group">
                                        <label>WhatsApp Number (e.g., +919876543210)</label>
                                        <input
                                            type="text"
                                            placeholder="+91..."
                                            value={socialForm.whatsapp}
                                            onChange={e => setSocialForm({ ...socialForm, whatsapp: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Instagram URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://instagram.com/..."
                                            value={socialForm.instagram}
                                            onChange={e => setSocialForm({ ...socialForm, instagram: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="save-btn">Update Links</button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
        
        /* Store and Bulk Toolbar Styles */
        .store-pill {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.78rem;
            font-weight: 600;
            letter-spacing: 0.03em;
        }
        .store-pill.jewels {
            background: #fff8e1;
            color: #b08d1e;
            border: 1px solid #ffe082;
        }
        .store-pill.drapes {
            background: #fce4ec;
            color: #c2185b;
            border: 1px solid #f8bbd0;
        }

        .store-filter-pills {
            display: flex;
            gap: 0.5rem;
        }
        .store-filter-btn {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 0.4rem 0.9rem;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        }
        .store-filter-btn:hover {
            border-color: #D4AF37;
        }
        .store-filter-btn.active {
            background: #1a0b0e;
            color: #D4AF37;
            border-color: #D4AF37;
            font-weight: bold;
        }

        .bulk-actions-toolbar {
            background: #eef2f7;
            border: 1px solid #ccd7e4;
            border-radius: 6px;
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            flex-wrap: wrap;
        }
        .bulk-assign-btn {
            border: none;
            padding: 0.4rem 0.9rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
        }
        .bulk-assign-btn.jewels {
            background: #D4AF37;
            color: #1a0b0e;
        }
        .bulk-assign-btn.drapes {
            background: #880e4f;
            color: #fff;
        }
        .bulk-clear-btn {
            background: #6c757d;
            color: #fff;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.82rem;
        }

        .row-selected {
            background: #fffde7 !important;
        }

        .dashboard-container {
          min-height: 100vh;
          background: #f4f4f4;
          color: #333;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          background: #1a0b0e;
          color: #D4AF37;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .logout-btn {
          background: transparent;
          border: 1px solid #D4AF37;
          color: #D4AF37;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .dashboard-content {
          flex: 1;
          display: flex;
        }

        .sidebar {
          width: 250px;
          background: #2a1215;
          padding: 2rem 0;
          display: flex;
          flex-direction: column;
        }

        .sidebar button {
          background: transparent;
          border: none;
          color: #ccc;
          padding: 1rem 2rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 4px solid transparent;
        }

        .sidebar button:hover {
          background: rgba(212, 175, 55, 0.1);
          color: #fff;
        }

        .sidebar button.active {
          background: rgba(212, 175, 55, 0.2);
          color: #D4AF37;
          border-left-color: #D4AF37;
        }

        .main-panel {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        h2 {
          color: #1a0b0e;
          border-bottom: 2px solid #D4AF37;
          padding-bottom: 0.5rem;
          margin-bottom: 2rem;
        }

        /* Forms */
        .product-form, .account-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          max-width: 600px;
        }

        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        input, textarea, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .file-input-wrapper {
          margin-bottom: 1rem;
        }

        .img-preview-small {
          height: 60px;
          width: 60px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .image-previews {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }

        .preview-item {
            position: relative;
        }

        .remove-img-btn {
            position: absolute;
            top: -5px;
            right: -5px;
            background: red;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .save-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 1rem;
        }

        /* Tables */
        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
        }

        .table-img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
        }

        .edit-btn {
          color: #007bff;
          background: none;
          border: none;
          cursor: pointer;
          margin-right: 0.5rem;
        }

        .delete-btn {
          color: #dc3545;
          background: none;
          border: none;
          cursor: pointer;
        }

        /* QR Section */
        .qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-preview {
          width: 250px;
          height: 250px;
          object-fit: contain;
          border: 2px dashed #ccc;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .upload-btn-label {
          background: #D4AF37;
          color: #1a0b0e;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          display: inline-block;
        }

        /* Orders */
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: bold;
        }

        .status-badge.pending {
          background: #ffeeba;
          color: #856404;
        }

        .status-badge.verified {
          background: #d4edda;
          color: #155724;
        }

        .verify-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .invoice-btn {
          background: #17a2b8;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .text-sm {
          font-size: 0.85rem;
          color: #666;
        }
        
        .font-bold {
          font-weight: bold;
        }
        
        .address-cell {
          max-width: 200px;
          font-size: 0.9rem;
        }

        /* Logs & Headers */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .export-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .action-badge {
          background: #e9ecef;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .details-cell {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .success-msg {
          color: #28a745;
          margin-top: 1rem;
          font-weight: bold;
        }

        .category-form-card {
            background: #fff;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            max-width: 500px;
        }

        .add-category-form {
            display: flex;
            gap: 1rem;
        }

        .add-category-form input {
            margin-bottom: 0;
        }

        .category-items {
            list-style: none;
            padding: 0;
            max-width: 500px;
        }

        .category-item {
            background: #fff;
            padding: 1rem;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
      `}</style>
        </div>
    );
};

export default AdminDashboard;
