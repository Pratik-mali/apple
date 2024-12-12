import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const invoicesSnapshot = await getDocs(collection(db, "invoices"));
        const invoicesData = invoicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvoices(invoicesData);
        setFilteredInvoices(invoicesData); // Initialize with all invoices
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    // Dynamic search as user types
    const filtered = invoices.filter((invoice) =>
      invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInvoices(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, invoices]);

  // Get current page's invoices
  const currentInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Invoice List</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by customer name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Customer</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Total Amount</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Paid Amount</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Due Amount</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Timestamp</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentInvoices.length > 0 ? (
            currentInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {invoice.customer.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₹{invoice.totals.totalAmount.toFixed(2)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₹{invoice.totals.paidAmount.toFixed(2)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₹{invoice.totals.dueAmount.toFixed(2)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {new Date(invoice.timestamp).toLocaleString()}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <Link to={`/invoice/${invoice.id}`}>View Invoice</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                No invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default InvoiceList;
