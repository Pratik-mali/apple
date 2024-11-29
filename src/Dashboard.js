import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Inventory from "./Inventory";
// Placeholder imports for other components
import Billing from "./Billing";
import InvoiceList from "./InvoiceList";
import CustomerComponent from "./CustomerComponent";
// import Customers from "./Customers";
// import Reports from "./Reports";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("Inventory");

  // Function to render components dynamically based on the active tab
  const renderContent = () => {
    switch (activeComponent) {
      case "Inventory":
        return <Inventory />;
      // Uncomment and add other components as needed
      case "Billing":
        return <Billing />;
      case "Customers":
        return <CustomerComponent />;
      // case "Reports":
      //   return <Reports />;
      case "InvoiceList":
        return <InvoiceList />
      default:
        return <Inventory />;
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar setActiveComponent={setActiveComponent} />
      <div style={styles.mainContent}>
        <Navbar />
        <div style={styles.content}>{renderContent()}</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f8f9fa",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    padding: "20px",
  },
};

export default Dashboard;
