import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

// Mock data
const cartItems = [
    { title: "Neon Dreams", quantity: 1, price: 150 },
    { title: "Ethereal Flow", quantity: 2, price: 200 }
];
const totalAmount = 550;

const generateSample = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header Background (Wine Red)
    doc.setFillColor(114, 47, 55);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Header Text (Gold)
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(22);
    doc.text("Narayani's Nova Gallery", pageWidth / 2, 25, { align: 'center' });

    // Invoice Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("INVOICE (SAMPLE)", 20, 60);

    // Table
    let yPos = 90;
    doc.setFontSize(12);
    cartItems.forEach((item) => {
        doc.text(`${item.title} x${item.quantity}`, 20, yPos);
        doc.text(`$${item.price * item.quantity}`, 180, yPos, { align: 'right' });
        yPos += 10;
    });

    // Total
    yPos += 10;
    doc.setFontSize(14);
    doc.text(`Total: $${totalAmount}`, 180, yPos, { align: 'right' });

    // Save to artifacts
    const outputPath = path.resolve('C:/Users/LENOVO/.gemini/antigravity/brain/6bac4c54-f2e5-4c09-8b6a-3535d0b13d66/sample_invoice.pdf');
    const pdfOutput = doc.output('arraybuffer');
    fs.writeFileSync(outputPath, Buffer.from(pdfOutput));
    console.log(`Saved to ${outputPath}`);
};

generateSample();
