import React from "react";
import { Button, Typography, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PeopleIcon from "@mui/icons-material/People";
import ListIcon from "@mui/icons-material/List";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import SummarizeIcon from "@mui/icons-material/Summarize";

const Sidebar = ({ setActiveComponent }) => {
  const menuItems = [
    { label: "Home", key: "Dash", icon: <DashboardIcon /> },
    { label: "Inventory", key: "Inventory", icon: <InventoryIcon /> },
    { label: "Billing", key: "Billing", icon: <ReceiptIcon /> },
    { label: "Customers", key: "Customers", icon: <PeopleIcon /> },
    { label: "Invoice List", key: "InvoiceList", icon: <ListIcon /> },
    { label: "Add Purchase", key: "InvoiceGenerator", icon: <AddShoppingCartIcon /> },
    { label: "Purchase List", key: "PurchaseList", icon: <ListIcon /> },
    { label: "Purchase Payment", key: "ManagePayments", icon: <PaymentIcon /> },
    { label: "GST Billing", key: "GSTGenerator", icon: <ReceiptIcon /> },
    { label: "GST Invoices", key: "GSTList", icon: <ListIcon /> },
    { label: "Purchase Report Ledger", key: "LedgerReport", icon: <SummarizeIcon /> },
  ];

  return (
    <Box
      sx={{
        width: "250px",
        height: "110vh",
        backgroundColor: "#1a202c",
        color: "#fff",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          marginBottom: "30px",
          textAlign: "center",
          width: "100%",
          color: "#ff7300",
        }}
      >
        Dashboard
      </Typography>
      {menuItems.map((item) => (
        <Button
          key={item.key}
          onClick={() => setActiveComponent(item.key)}
          startIcon={item.icon}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            color: "#ecf0f1",
            padding: "10px 20px",
            marginBottom: "10px",
            fontSize: "16px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#2d3748",
              color: "#febd00",
            },
            transition: "all 0.3s ease",
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );
};

export default Sidebar;
