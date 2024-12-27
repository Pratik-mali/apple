import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Inventory from "./Inventory";
// Placeholder imports for other components
import Billing from "./Billing";
import InvoiceList from "./InvoiceList";
import CustomerComponent from "./CustomerComponent";
import DueCustomerComponent from "./DueCustomerComponent";

import InvoiceGenerator from "./InvoiceGenerator";
import PurchaseList from "./PurchaseList";
import ManagePayments from "./ManagePayments";
import GSTGenerator from "./GSTGenerator";
import GSTList from "./GSTList";
import LedgerReport from "./LedgerReport";
import CombinedLedgerReport from "./CombinedLedgerReport";

import Dash from "./Dash";

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
        case "DueCustomers":
        return <DueCustomerComponent />;
      // case "Reports":
      //   return <Reports />;
      case "InvoiceList":
        return <InvoiceList />
        case "InvoiceGenerator":
          return <InvoiceGenerator />

          case "PurchaseList":
          return <PurchaseList />

          case "ManagePayments":
            return <ManagePayments />
            case "GSTGenerator":
              return <GSTGenerator />

              case "LedgerReport":
                return <LedgerReport />

                
              case "CombinedLedgerReport":
                return <CombinedLedgerReport />

              case "GSTList":
                return <GSTList />

              
              
      default:
        return <Dash />;
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
