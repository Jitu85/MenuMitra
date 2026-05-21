const express = require('express');
const router = express.Router();
const { authenticateToken, requireOwner } = require('../middleware/auth');

// Public or authenticated receipt rendering
// (Keep public so printing can easily load it into standard print frames / new tabs)
router.get('/receipt/:id', async (req, res, next) => {
  const prisma = req.app.get('prisma');
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        owner: true,
        items: true
      }
    });

    if (!order) {
      return res.status(404).send('<h3>Error: Receipt order not found.</h3>');
    }

    const businessName = order.owner?.business_name || 'MenuMitra Restaurant';
    const address = order.owner?.address || 'N/A';
    const city = order.owner?.city || '';
    const phone = order.owner?.phone || 'N/A';
    const gstin = order.owner?.gstin ? `GSTIN: ${order.owner.gstin}` : '';

    // Calculate dates
    const dateStr = new Date(order.created_at).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true
    });

    // Render beautiful pre-styled thermal HTML page
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${order.order_number}</title>
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      margin: 0;
      padding: 10px;
      background: #fff;
    }
    .receipt-container {
      max-width: 280px; /* Perfect for 58mm / 80mm thermal printers */
      margin: 0 auto;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }
    .double-divider {
      border-top: 2px double #000;
      margin: 5px 0;
    }
    .header-title {
      font-size: 16px;
      font-weight: bold;
      margin: 2px 0;
    }
    .table-info {
      font-size: 14px;
      font-weight: bold;
      background: #eee;
      padding: 4px;
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 2px 0;
    }
    .footer {
      font-size: 10px;
      margin-top: 15px;
    }
    @media print {
      body {
        padding: 0;
      }
      .receipt-container {
        width: 100%;
        max-width: 100%;
      }
    }
  </style>
</head>
<body onload="window.print()">
  <div class="receipt-container">
    <div class="text-center">
      <div class="header-title">${businessName}</div>
      <div>${address}, ${city}</div>
      <div>Phone: ${phone}</div>
      ${gstin ? `<div>${gstin}</div>` : ''}
    </div>
    
    <div class="divider"></div>
    
    <div>Order: ${order.order_number}</div>
    <div>Date: ${dateStr}</div>
    <div>Pay Method: ${order.payment_method ? order.payment_method.toUpperCase() : 'CASH'}</div>
    <div>Pay Status: ${order.payment_status.toUpperCase()}</div>
    
    <div class="table-info text-center">
      TABLE NUMBER: ${order.table_number}
    </div>
    
    <div class="divider"></div>
    
    <table>
      <thead>
        <tr>
          <th style="width: 50%">Item</th>
          <th class="text-center" style="width: 15%">Qty</th>
          <th class="text-right" style="width: 35%">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>${item.item_name_en}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">₹${item.total_price.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="divider"></div>
    
    <table>
      <tr>
        <td>Subtotal:</td>
        <td class="text-right">₹${order.subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>GST / Tax:</td>
        <td class="text-right">₹${order.tax_amount.toFixed(2)}</td>
      </tr>
      <tr style="font-weight: bold; font-size: 13px;">
        <td>GRAND TOTAL:</td>
        <td class="text-right">₹${order.total_amount.toFixed(2)}</td>
      </tr>
    </table>
    
    <div class="double-divider"></div>
    
    <div class="text-center footer">
      <strong>Thank You! Visit Again</strong>
      <br/>
      MenuMitra - Scan. Order. Pay.
      <br/>
      <em>Developed by Abhijit Kumar Misra</em>
    </div>
  </div>
</body>
</html>
    `;

    res.send(html);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
