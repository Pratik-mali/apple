import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const CustomerComponent = () => {
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
              };
            }
            acc[name].totalDue += dueAmount; // Sum due amounts
          }
          return acc;
        }, {});

        const groupedCustomersArray = Object.values(groupedCustomers);

        setCustomers(groupedCustomersArray);
        setFilteredCustomers(groupedCustomersArray); // Initialize with all customers
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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Customer List</h1>

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
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                No customers found.
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

export default CustomerComponent;
