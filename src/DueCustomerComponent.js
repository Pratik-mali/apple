import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import CustomerPDF from "./CustomerPDF"; // Import the PDF layout component
import { PDFDownloadLink } from "@react-pdf/renderer";



const DueCustomersComponent = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, "invoices"));
        const customersData = customersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group and aggregate customer data
        const groupedCustomers = customersData.reduce((acc, record) => {
          const { name, contactNumber, address } = record.customer || {};
          const dueAmount = record.totals?.dueAmount || 0;

          if (name) {
            if (!acc[name]) {
              acc[name] = {
                name,
                contactNumber: contactNumber || "N/A",
                address: address || "N/A",
                totalDue: 0,
                records: [],
              };
            }
            acc[name].totalDue += dueAmount;
            acc[name].records.push({ id: record.id, dueAmount });
          }
          return acc;
        }, {});

        const groupedCustomersArray = Object.values(groupedCustomers).filter(
          (customer) => customer.totalDue > 0 // Only customers with dues
        );

        setCustomers(groupedCustomersArray);
        setFilteredCustomers(groupedCustomersArray);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search query
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, customers]);

  // Get current page's customers
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

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

  const handleAcceptPayment = async (customer, paymentAmount) => {
    if (paymentAmount <= 0 || paymentAmount > customer.totalDue) {
      alert("Invalid payment amount");
      return;
    }

    try {
      // Update the due amounts in Firestore
      for (const record of customer.records) {
        if (paymentAmount <= 0) break;
        const amountToDeduct = Math.min(paymentAmount, record.dueAmount);
        paymentAmount -= amountToDeduct;

        const recordRef = doc(db, "invoices", record.id);
        await updateDoc(recordRef, {
          "totals.dueAmount": record.dueAmount - amountToDeduct,
        });
      }

      alert("Payment accepted successfully!");
      window.location.reload(); // Refresh to fetch updated data
    } catch (error) {
      console.error("Error accepting payment:", error);
      alert("Failed to accept payment.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Customers with Dues</h1>

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
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Contact Number
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Address</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Total Due</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Accept Payment
            </th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.length > 0 ? (
            currentCustomers.map((customer, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {customer.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {customer.contactNumber}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {customer.address}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  ₹{customer.totalDue.toFixed(2)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    style={{ marginRight: "8px" }}
                    onChange={(e) =>
                      (customer.paymentAmount = parseFloat(e.target.value))
                    }
                  />
                  <button
                    onClick={() =>
                      handleAcceptPayment(customer, customer.paymentAmount || 0)
                    }
                  >
                    Accept
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                No customers with dues found.
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

      <div style={{ marginTop: "20px" }}>
        <PDFDownloadLink
          document={<CustomerPDF customers={filteredCustomers} />}
          fileName="customers_with_dues.pdf"
        >
          {({ loading }) =>
            loading ? "Generating PDF..." : <button>Download PDF</button>
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default DueCustomersComponent;
