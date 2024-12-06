import React from "react";

const Sidebar = ({ setActiveComponent }) => {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>Dashboard</h2>
      <button style={styles.button} onClick={() => setActiveComponent("Inventory")}>
        Inventory
      </button>
      <button style={styles.button} onClick={() => setActiveComponent("Billing")}>
        Billing
      </button>
      <button style={styles.button} onClick={() => setActiveComponent("Customers")}>
        Customers
      </button>
      <button style={styles.button} onClick={() => setActiveComponent("Reports")}>
        Reports
      </button>
      <button style={styles.button} onClick={() => setActiveComponent("InvoiceList")}>
        Invoice List
      </button>
      <button style={styles.button} onClick={() => setActiveComponent("InvoiceGenerator")}>
        Add Purchase
      </button>
      <button style={styles.button} onClick={() => setActiveComponent("PurchaseList")}>
        Purchase List
      </button>
      <button style={styles.button} onClick={() => setActiveComponent("ManagePayments")}>
        Purchase Payment
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "200px",
    backgroundColor: "#343a40",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "20px",
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "none",
    textAlign: "left",
    padding: "10px 0",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Sidebar;
