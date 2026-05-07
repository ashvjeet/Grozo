const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Generate invoice PDF for an order
// @route   GET /api/orders/:id/invoice
exports.getInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images price unit')
    .populate('user', 'name email phone');

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Create PDF document
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Set response headers for PDF download
  const filename = `Grozo_Invoice_${order.orderNumber}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  const pageWidth = doc.page.width - 100; // accounting for margins

  // ===== HEADER =====
  // Green branded banner
  doc.rect(0, 0, doc.page.width, 120).fill('#065f46');

  // Logo text
  doc.fontSize(32).font('Helvetica-Bold').fillColor('#ffffff').text('grozo', 50, 35, { continued: true });
  doc.fontSize(32).fillColor('#f59e0b').text('.', { continued: false });
  doc.fontSize(11).fillColor('#d1fae5').text('Smart Grocery Platform', 50, 72);

  // Invoice title — right side
  doc.fontSize(22).fillColor('#ffffff').text('INVOICE', 400, 40, { align: 'right', width: pageWidth - 350 });
  doc.fontSize(10).fillColor('#d1fae5').text(`#${order.orderNumber}`, 400, 68, { align: 'right', width: pageWidth - 350 });
  doc.fontSize(9).fillColor('#a7f3d0').text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 400, 85, { align: 'right', width: pageWidth - 350 });

  // ===== CUSTOMER & COMPANY INFO =====
  const infoY = 145;

  // Bill To
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#6b7280').text('BILL TO', 50, infoY);
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(order.user.name || 'Customer', 50, infoY + 16);
  doc.fontSize(9).font('Helvetica').fillColor('#4b5563');
  if (order.user.email) doc.text(order.user.email, 50, infoY + 33);
  if (order.user.phone) doc.text(`Phone: ${order.user.phone}`, 50, infoY + 47);

  // Delivery Address
  if (order.deliveryAddress) {
    const addr = order.deliveryAddress;
    const addrText = [addr.street, addr.apartment, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
    doc.text(addrText, 50, infoY + 61, { width: 250 });
  }

  // Company info — right side
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#6b7280').text('FROM', 350, infoY, { align: 'right', width: pageWidth - 300 });
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text('Grozo Pvt. Ltd.', 350, infoY + 16, { align: 'right', width: pageWidth - 300 });
  doc.fontSize(9).font('Helvetica').fillColor('#4b5563');
  doc.text('123 Commerce Street, Mumbai', 350, infoY + 33, { align: 'right', width: pageWidth - 300 });
  doc.text('Maharashtra, India 400001', 350, infoY + 47, { align: 'right', width: pageWidth - 300 });
  doc.text('GSTIN: 27AAAAG0000A1Z5', 350, infoY + 61, { align: 'right', width: pageWidth - 300 });

  // ===== PAYMENT & ORDER INFO BAR =====
  const barY = infoY + 95;
  doc.rect(50, barY, pageWidth, 36).fill('#f0fdf4').stroke('#d1fae5');

  const colW = pageWidth / 4;
  const labels = ['Payment Method', 'Payment Status', 'Delivery Type', 'Order Status'];
  const values = [
    (order.paymentMethod || 'N/A').toUpperCase(),
    (order.paymentStatus || 'N/A').toUpperCase(),
    (order.deliveryType || 'instant').toUpperCase(),
    (order.status || 'N/A').toUpperCase()
  ];

  labels.forEach((label, i) => {
    const x = 58 + i * colW;
    doc.fontSize(7).font('Helvetica').fillColor('#6b7280').text(label, x, barY + 7);
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#065f46').text(values[i], x, barY + 19);
  });

  // ===== ITEMS TABLE =====
  const tableTop = barY + 56;

  // Table header
  doc.rect(50, tableTop, pageWidth, 28).fill('#111827');
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('#', 60, tableTop + 9, { width: 25 });
  doc.text('ITEM', 90, tableTop + 9, { width: 220 });
  doc.text('QTY', 310, tableTop + 9, { width: 50, align: 'center' });
  doc.text('PRICE', 365, tableTop + 9, { width: 75, align: 'right' });
  doc.text('TOTAL', 445, tableTop + 9, { width: 100, align: 'right' });

  // Table rows
  let y = tableTop + 28;
  const items = order.items || [];

  items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    doc.rect(50, y, pageWidth, 26).fill(isEven ? '#ffffff' : '#f9fafb');

    doc.fontSize(9).font('Helvetica').fillColor('#374151');
    doc.text(`${idx + 1}`, 60, y + 8, { width: 25 });
    doc.text(item.name || 'Product', 90, y + 8, { width: 220 });
    doc.text(`${item.quantity}`, 310, y + 8, { width: 50, align: 'center' });
    doc.text(`₹${item.price?.toFixed(2)}`, 365, y + 8, { width: 75, align: 'right' });

    const itemTotal = item.total || (item.price * item.quantity);
    doc.font('Helvetica-Bold').text(`₹${itemTotal.toFixed(2)}`, 445, y + 8, { width: 100, align: 'right' });

    y += 26;
  });

  // Table bottom border
  doc.moveTo(50, y).lineTo(50 + pageWidth, y).strokeColor('#e5e7eb').lineWidth(1).stroke();

  // ===== TOTALS SECTION =====
  const totalsX = 350;
  const totalsW = pageWidth - 300;
  y += 16;

  const addTotalRow = (label, value, isBold, color) => {
    doc.fontSize(10).font(isBold ? 'Helvetica-Bold' : 'Helvetica').fillColor(color || '#374151');
    doc.text(label, totalsX, y, { width: totalsW - 110, align: 'right' });
    doc.text(value, totalsX + totalsW - 105, y, { width: 105, align: 'right' });
    y += 20;
  };

  addTotalRow('Subtotal', `₹${(order.subtotal || 0).toFixed(2)}`);
  if (order.discount > 0) addTotalRow('Discount', `- ₹${order.discount.toFixed(2)}`, false, '#059669');
  addTotalRow('Delivery Fee', order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`, false, order.deliveryFee === 0 ? '#059669' : '#374151');
  addTotalRow('Taxes (5% GST)', `₹${(order.taxes || 0).toFixed(2)}`);
  if (order.loyaltyPointsUsed > 0) addTotalRow('Loyalty Points', `- ₹${order.loyaltyPointsUsed.toFixed(2)}`, false, '#059669');

  // Grand total with green background
  y += 4;
  doc.rect(totalsX - 10, y - 4, totalsW + 15, 32).fill('#065f46');
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('GRAND TOTAL', totalsX, y + 4, { width: totalsW - 110, align: 'right' });
  doc.text(`₹${(order.totalAmount || 0).toFixed(2)}`, totalsX + totalsW - 105, y + 4, { width: 105, align: 'right' });
  y += 48;

  // ===== PAYMENT TRANSACTION INFO =====
  if (order.paymentId) {
    doc.rect(50, y, pageWidth, 30).fill('#f0fdf4').stroke('#d1fae5');
    doc.fontSize(8).font('Helvetica').fillColor('#065f46');
    doc.text(`Transaction ID: ${order.paymentId}`, 60, y + 10);
    doc.text(`Payment completed on: ${new Date(order.updatedAt).toLocaleString('en-IN')}`, 300, y + 10, { align: 'right', width: pageWidth - 260 });
    y += 46;
  }

  // ===== FOOTER =====
  // Divider line
  const footerY = doc.page.height - 100;
  doc.moveTo(50, footerY).lineTo(50 + pageWidth, footerY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#065f46').text('Thank you for shopping with Grozo!', 50, footerY + 14, { align: 'center', width: pageWidth });
  doc.fontSize(8).font('Helvetica').fillColor('#9ca3af').text('This is a computer-generated invoice and does not require a physical signature.', 50, footerY + 34, { align: 'center', width: pageWidth });
  doc.fontSize(7).fillColor('#d1d5db').text('Grozo Pvt. Ltd. | support@grozo.in | www.grozo.in | +91 98765 43210', 50, footerY + 52, { align: 'center', width: pageWidth });

  // Finalize PDF
  doc.end();
});
