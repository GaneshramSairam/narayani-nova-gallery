import jsPDF from 'jspdf';
import logo from '../assets/Naranis Nova updated complete logo.png';

export const generateInvoice = async (order) => {
    const { items: cartItems, total: totalAmount } = order;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Helper to load image
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    // --- Premium Luxury Invoice Design ---

    // 1. Background & Header
    // Full page background (Very light cream for luxury feel)
    doc.setFillColor(253, 251, 247); // #fdfbf7
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top Header Bar (Deep Wine)
    doc.setFillColor(76, 11, 13); // #4C0B0D
    doc.rect(0, 0, pageWidth, 65, 'F'); // Increased height for logo

    // Gold Accent Line under header
    doc.setDrawColor(212, 175, 55); // #D4AF37
    doc.setLineWidth(1.5);
    doc.line(0, 65, pageWidth, 65);

    // 2. Branding (Header)
    try {
        const logoImg = await loadImage(logo);
        const logoWidth = 25;
        const logoHeight = 25;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(logoImg, 'PNG', logoX, 5, logoWidth, logoHeight);
    } catch (e) {
        console.warn("Could not load logo for invoice", e);
    }

    // Brand Name
    doc.setTextColor(212, 175, 55); // Gold
    doc.setFontSize(24);
    doc.setFont('times', 'bold'); // Serif font for luxury
    doc.text("Narayani's Nova Gallery", pageWidth / 2, 40, { align: 'center' });

    // Tagline
    doc.setTextColor(229, 201, 120); // Soft Gold
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("CURATED JEWELS - STYLED FOR YOU", pageWidth / 2, 50, { align: 'center' });

    // 3. Invoice Details Section
    doc.setTextColor(76, 11, 13); // Deep Wine
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.text("INVOICE", 20, 85); // Moved down from 70 to 85

    // Date & ID
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100); // Grey
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 95); // Moved down from 80 to 95
    doc.text(`Invoice ID: #NOV-${Date.now().toString().slice(-6)}`, 20, 101); // Moved down from 86 to 101

    // 4. Table Design
    let yPos = 115; // Moved table start down from 100 to 115

    // Table Header Background
    doc.setFillColor(76, 11, 13); // Deep Wine
    doc.rect(20, yPos - 8, pageWidth - 40, 12, 'F');

    // Table Header Text
    doc.setTextColor(255, 255, 255); // White
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text("ITEM DESCRIPTION", 25, yPos);
    doc.text("MRP", 115, yPos);
    doc.text("DISC", 135, yPos);
    doc.text("PRICE", 155, yPos);
    doc.text("TOTAL", 185, yPos, { align: 'right' });

    yPos += 15;

    // Table Content
    doc.setTextColor(60, 60, 60); // Dark Grey
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    cartItems.forEach((item, index) => {
        // Alternating row background
        if (index % 2 === 0) {
            doc.setFillColor(248, 245, 240); // Very subtle warm grey
            doc.rect(20, yPos - 6, pageWidth - 40, 10, 'F');
        }

        const basePrice = item.basePrice || item.price;
        const discount = item.discountPercent || 0;

        doc.text(item.title, 25, yPos);
        doc.text(`₹${basePrice}`, 115, yPos);
        doc.text(`${discount}%`, 135, yPos);
        doc.text(`₹${item.price.toFixed(2)}`, 155, yPos);
        doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 185, yPos, { align: 'right' });
        yPos += 10;
    });

    // 5. Totals Section
    yPos += 10;
    // Decorative Line
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);

    yPos += 15;

    // Total Label & Amount
    // Total Label & Amount
    const totalMRP = cartItems.reduce((acc, item) => acc + (item.basePrice || item.price) * item.quantity, 0);
    const totalSavings = totalMRP - totalAmount;

    if (totalSavings > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total MRP: ₹${totalMRP.toFixed(2)}`, 185, yPos - 10, { align: 'right' });
        doc.text(`Total Savings: -₹${totalSavings.toFixed(2)}`, 185, yPos - 5, { align: 'right' });
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(76, 11, 13); // Deep Wine
    doc.text("TOTAL AMOUNT", 140, yPos, { align: 'right' });

    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55); // Gold
    doc.text(`₹${totalAmount.toFixed(2)}`, 185, yPos, { align: 'right' });

    // 6. Footer (Luxury Band)
    const footerHeight = 30;
    const footerY = pageHeight - footerHeight;

    doc.setFillColor(58, 9, 10); // Secondary Wine #3A090A
    doc.rect(0, footerY, pageWidth, footerHeight, 'F');

    // Footer Text
    doc.setTextColor(229, 201, 120); // Soft Gold
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const centerX = pageWidth / 2;
    doc.text("123 Gallery St, Art City, AC 54321  |  support@novagallery.com  |  www.novagallery.com", centerX, footerY + 12, { align: 'center' });
    doc.text("Thank you for being part of the Nova Family", centerX, footerY + 22, { align: 'center' });

    // Save PDF
    try {
        doc.save(`Narayani_Invoice_${Date.now()}.pdf`);
    } catch (error) {
        console.error("Error generating invoice:", error);
        alert("There was an error generating your invoice. Please try again.");
    }
};
