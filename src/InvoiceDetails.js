import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer"; // Import PDFDownloadLink
import InvoicePDF from "./InvoicePDF"; // Import your InvoicePDF component

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const invoiceDoc = await getDoc(doc(db, "invoices", invoiceId));
        if (invoiceDoc.exists()) {
          setInvoice(invoiceDoc.data());
        } else {
          console.log("No such invoice!");
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId]);

  if (loading) {
    return <div>Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  const {
    customer,
    products,
    totals,
    timestamp,
  } = invoice;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Invoice Details</h1>
      <p>
        <strong>Customer:</strong> {customer.name}
      </p>
      <p>
        <strong>New Customer:</strong> {customer.isNewCustomer ? "Yes" : "No"}
      </p>
      <p>
        <strong>Invoice Date:</strong> {new Date(timestamp).toLocaleString()}
      </p>

      <h2>Totals</h2>
      <p><strong>Total Amount:</strong> ₹{totals.totalAmount.toFixed(2)}</p>
      <p><strong>Total Discount:</strong> ₹{totals.totalDiscount.toFixed(2)}</p>
      <p><strong>Final Amount:</strong> ₹{totals.finalAmount.toFixed(2)}</p>
      <p><strong>Paid Amount:</strong> ₹{totals.paidAmount.toFixed(2)}</p>
      <p><strong>Due Amount:</strong> ₹{totals.dueAmount.toFixed(2)}</p>

      <h2>Products</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Product</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Quantity</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Price</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Discount</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {(products || []).map((product, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {product.productName}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {product.quantity}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                ₹{product.price.toFixed(2)}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {product.discount}%
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                ₹{product.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Print Invoice Button */}
      <div style={{ marginTop: "20px" }}>
      <button
        onClick={() => navigate("/Dashboard")} // Redirect to the homepage or another route
        style={{
          padding: "10px 20px",
          backgroundColor: "#DC3545",
          color: "#FFF",
          textDecoration: "none",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Close
      </button>
        <PDFDownloadLink
          document={<InvoicePDF invoiceData={invoice} />}
          fileName={`Invoice-${invoiceId}.pdf`}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "#FFF",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          {({ loading }) => (loading ? "Preparing document..." : "Print Invoice")}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default InvoiceDetails;
