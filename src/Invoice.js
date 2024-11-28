import React from "react";

const Invoice = ({ invoiceData }) => {
  return (
    <div style={styles.container}>
      <h1>Invoice</h1>
      <p><strong>Date:</strong> {new Date(invoiceData.date).toLocaleString()}</p>
      <p><strong>Customer:</strong> {invoiceData.customerId}</p>
      <h2>Products</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.products.map((product, index) => (
            <tr key={index}>
              <td>{product.productName}</td>
              <td>{product.quantity}</td>
              <td>₹{product.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Total Amount: ₹{invoiceData.totalAmount}</h3>
      <h3>Discount: ₹{invoiceData.discount}</h3>
      <h3>Final Amount: ₹{invoiceData.finalAmount}</h3>
    </div>
  );
};

const styles = {
  container: { padding: "20px", maxWidth: "600px", margin: "auto" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
  th: { border: "1px solid #ddd", padding: "8px" },
  td: { border: "1px solid #ddd", padding: "8px" },
};

export default Invoice;
