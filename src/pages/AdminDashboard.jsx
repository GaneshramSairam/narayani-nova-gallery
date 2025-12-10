import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from 'react-router-dom';
import { generateInvoice } from '../utils/generateInvoice';
import { compressImage } from '../utils/compressImage';
// ... existing hooks
const {
    products, addProduct, updateProduct, deleteProduct,
    orders, verifyOrder,
    qrCode, updateQrCode,
    activityLogs,
    adminUser, updateAdminCredentials,
    logout,
    categories, addCategory, deleteCategory,
    socialLinks, updateSocialLinks,
    invoiceSettings, updateInvoiceSettings
} = useAdmin();

const [activeTab, setActiveTab] = useState('products');
const navigate = useNavigate();

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
    images: []
});
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState('');

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
        basePrice: basePrice,
        discountPercent: discountPercent,
        price: finalPrice,
        images: images,
        imageUrl: images[0] || '', // Main image is the first one
        id: isEditing && currentProduct ? currentProduct.id : Date.now().toString()
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
        images: product.images || (product.imageUrl ? [product.imageUrl] : [])
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
        description: '',
        imageUrl: '',
        images: []
    });
};


const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        setUploading(true);
        setUploadProgress(`0/${files.length}`);

        try {
            const uploadPromises = files.map(async (file, index) => {
                // 1. Compress
                let fileToUpload = file;
                try {
                    // Only compress if it's an image and larger than 500KB
                    if (file.type.startsWith('image/') && file.size > 500 * 1024) {
                        const compressedBlob = await compressImage(file);
                        // Keep original name but ensure .jpg extension if converted
                        fileToUpload = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
                    }
                } catch (err) {
                    console.warn("Compression failed, using original file:", err);
                }

                // 2. Upload
                const fileRef = storageRef(storage, `products/${Date.now()}-${fileToUpload.name}`);
                await uploadBytes(fileRef, fileToUpload);
                const url = await getDownloadURL(fileRef);

                // Update debug/progress locally if needed, but setState inside loop can be jittery.
                // Instead, we trust Promise.all to finish. 
                // To show real-time "N/Total", we can't easily sync React state in a tight loop without re-renders.
                // But we can trigger it:
                setUploadProgress(prev => {
                    const [curr, total] = prev.split('/').map(Number);
                    return `${curr + 1}/${total}`;
                });

                return url;
            });

            const urls = await Promise.all(uploadPromises);

            setProductForm(prev => {
                const newImages = [...(prev.images || []), ...urls];
                return {
                    ...prev,
                    images: newImages,
                    imageUrl: prev.imageUrl || newImages[0]
                };
            });
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Failed to upload images. Check console for details.");
        } finally {
            setUploading(false);
            setUploadProgress('');
        }
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
        addCategory(newCategory.trim());
        setNewCategory('');
    }
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
    link.download = `narayanis-nova-activity-log-${dateStr}.csv`;
    link.click();
};

const exportOrdersToCSV = () => {
    // Exact header requirement: Order ID,Date,Time,Customer Name,Email,Phone,Address,Items,Total,Status
    const headers = ['Order ID', 'Date', 'Time', 'Customer Name', 'Email', 'Phone', 'Address', 'Items', 'Total', 'Status'];

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
    link.download = `narayanis-nova-orders-${dateStr}.csv`;
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
                            </div>
                            <textarea
                                placeholder="Description"
                                value={productForm.description}
                                onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                            />
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
                                            <td>{p.title}</td>
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
                                                <td>₹{(order.total || 0).toFixed(2)}</td>
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
                                        placeholder="support@novagallery.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Website URL</label>
                                    <input
                                        type="text"
                                        value={invoiceForm.website || ''}
                                        onChange={e => setInvoiceForm({ ...invoiceForm, website: e.target.value })}
                                        placeholder="www.novagallery.com"
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
                                            <span>{cat.name}</span>
                                            <button onClick={() => deleteCategory(cat.id)} className="delete-btn">Delete</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
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
    </div >
);
};

export default AdminDashboard;
