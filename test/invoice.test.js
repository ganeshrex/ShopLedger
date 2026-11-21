var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function order(id, coupon, items) {
  return { id: id, coupon: coupon, items: items };
}

function item(id, name, sku, price, qty, hsn, gstRate) {
  return {
    id: id,
    name: name,
    sku: sku,
    price: price,
    qty: qty,
    hsn: hsn,
    gstRate: gstRate
  };
}

test('CURRENT BEHAVIOUR: #1001 computes mixed 5% and 12% GST from gstRate without a coupon', function () {
  var o = order(1001, '', [
    item(1, 'Rice', 'GRN-001', 640, 1, '1006', 5),
    item(7, 'Butter', 'DRY-002', 260, 1, '0405', 12)
  ]);
  var result = invoice.computeInvoiceFigures(o);
  var checkout = pricing.computeTotals(o.items, o.coupon);

  assert.deepEqual(result, {
    subtotal: 900,
    discount: 0,
    tax: 63.2,
    cgst: 31.6,
    sgst: 31.6,
    total: 963.2,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 32 },
      { name: 'Butter', sku: 'DRY-002', hsn: '0405', qty: 1, price: 260, gstPercent: 12, line: 260, lineTax: 31.2 }
    ]
  });
  assert.equal(result.total, checkout.total);
  assert.equal(result.tax, checkout.tax);
});

test('CURRENT BEHAVIOUR: #1002 matches checkout after applying SAVE10 before GST', function () {
  var o = order(1002, 'SAVE10', [
    item(1, 'Rice', 'GRN-001', 640, 1, '1006', 5),
    item(4, 'Sunflower Oil', 'OIL-001', 190, 2, '1512', 5)
  ]);
  var result = invoice.computeInvoiceFigures(o);
  var checkout = pricing.computeTotals(o.items, o.coupon);

  assert.deepEqual(result, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Sunflower Oil', sku: 'OIL-001', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  });
  assert.equal(result.discount, checkout.discount);
  assert.equal(result.tax, checkout.tax);
  assert.equal(result.total, checkout.total);
});

test('CURRENT BEHAVIOUR: #1004 observes the SAVE10 cap before GST', function () {
  var o = order(1004, 'SAVE10', [
    item(5, 'Groundnut Oil', 'OIL-002', 1120, 2, '1508', 5)
  ]);
  var result = invoice.computeInvoiceFigures(o);
  var checkout = pricing.computeTotals(o.items, o.coupon);

  assert.deepEqual(result, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: 'OIL-002', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.equal(result.discount, checkout.discount);
  assert.equal(result.tax, checkout.tax);
  assert.equal(checkout.total, 2194.5);
});

test('CURRENT BEHAVIOUR: #1008 computes an all-18% uncouponed invoice equal to checkout', function () {
  var o = order(1008, '', [
    item(8, 'Tea', 'BEV-001', 140, 2, '0902', 18),
    item(9, 'Coffee', 'BEV-002', 310, 1, '0901', 18)
  ]);
  var result = invoice.computeInvoiceFigures(o);
  var checkout = pricing.computeTotals(o.items, o.coupon);

  assert.deepEqual(result, {
    subtotal: 590,
    discount: 0,
    tax: 106.2,
    cgst: 53.1,
    sgst: 53.1,
    total: 696.2,
    rows: [
      { name: 'Tea', sku: 'BEV-001', hsn: '0902', qty: 2, price: 140, gstPercent: 18, line: 280, lineTax: 50.4 },
      { name: 'Coffee', sku: 'BEV-002', hsn: '0901', qty: 1, price: 310, gstPercent: 18, line: 310, lineTax: 55.8 }
    ]
  });
  assert.equal(result.total, checkout.total);
  assert.equal(result.tax, checkout.tax);
});

test('invoice shows the same HSN GST, capped coupon discount, and total that checkout billed for #1004', function () {
  var o = order(1004, 'SAVE10', [
    {
      id: 5,
      name: 'Groundnut Oil',
      sku: 'OIL-002',
      price: 1120,
      qty: 2,
      hsn: '1508'
    }
  ]);
  var billed = pricing.computeTotals(o.items, o.coupon);

  assert.deepEqual(invoice.computeInvoiceFigures(o), {
    subtotal: billed.subtotal,
    discount: billed.discount,
    tax: billed.tax,
    cgst: billed.cgst,
    sgst: billed.sgst,
    total: billed.total,
    rows: [
      { name: 'Groundnut Oil', sku: 'OIL-002', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
});
