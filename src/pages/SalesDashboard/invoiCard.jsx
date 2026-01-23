import React from "react";

const InvoiceTableCard = () => {
  const invoiceDetails = {
    invoiceId: "INV-2025-2845",
    orderId: "#28745-72809bjk",
    date: "14 Oct 2025",
    customer: "Suriyanarayanan Rajendran",
    email: "ssuriya1806@gmail.com",
    address: "Kallikuppam, Ambattur, Chennai - 53",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
  };

  const items = [
    { name: "Men’s Casual Shirt", qty: 2, price: 1299 },
    { name: "Blue Denim Jeans", qty: 1, price: 1599 },
    { name: "Sports Shoes", qty: 1, price: 2199 },
  ];

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Invoice</h2>
          <p className="text-sm text-gray-500">{invoiceDetails.invoiceId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Date: {invoiceDetails.date}</p>
          <p className="text-sm text-gray-500">Order ID: {invoiceDetails.orderId}</p>
        </div>
      </div>

      {/* Customer Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="font-semibold text-gray-700 mb-1">Billed To:</p>
          <p className="text-gray-600 text-sm">{invoiceDetails.customer}</p>
          <p className="text-gray-600 text-sm">{invoiceDetails.email}</p>
          <p className="text-gray-600 text-sm">{invoiceDetails.address}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-700 mb-1">Payment Info:</p>
          <p className="text-gray-600 text-sm">Status: {invoiceDetails.paymentStatus}</p>
          <p className="text-gray-600 text-sm">Method: {invoiceDetails.paymentMethod}</p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="text-left p-3">Item</th>
              <th className="text-center p-3">Qty</th>
              <th className="text-right p-3">Price (₹)</th>
              <th className="text-right p-3">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3">{item.name}</td>
                <td className="text-center p-3">{item.qty}</td>
                <td className="text-right p-3">{item.price.toLocaleString()}</td>
                <td className="text-right p-3">
                  {(item.qty * item.price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="text-right p-3 font-semibold">
                Subtotal:
              </td>
              <td className="text-right p-3">₹{subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan="3" className="text-right p-3 font-semibold">
                Tax (5%):
              </td>
              <td className="text-right p-3">₹{tax.toFixed(2)}</td>
            </tr>
            <tr className="border-t">
              <td colSpan="3" className="text-right p-3 font-bold text-gray-800">
                Total:
              </td>
              <td className="text-right p-3 font-bold text-gray-800">
                ₹{total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t pt-3 text-sm text-gray-500 text-center">
        Thank you for shopping with{" "}
        <span className="font-semibold text-gray-700">Prithu</span>!
      </div>
    </div>
  );
};

export default InvoiceTableCard;
