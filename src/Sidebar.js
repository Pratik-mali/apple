import React from "react";
import { Button, Typography, Box, Divider } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import GroupIcon from "@mui/icons-material/Group";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import PaymentIcon from "@mui/icons-material/Payment";
import SummarizeIcon from "@mui/icons-material/Summarize";
import EqualizerIcon from "@mui/icons-material/Equalizer";

const Sidebar = ({ setActiveComponent }) => {
  const menuItems = [
    { label: "Home", key: "Dash", icon: <HomeIcon /> },
    { label: "Inventory", key: "Inventory", icon: <Inventory2Icon /> },
    { label: "Billing", key: "Billing", icon: <ReceiptLongIcon /> },
    { label: "Customers", key: "Customers", icon: <GroupIcon /> },
    { label: "Due Payments", key: "DueCustomers", icon: <AttachMoneyIcon /> },
    { label: "Invoice List", key: "InvoiceList", icon: <ListAltIcon /> },
    { label: "Add Purchase", key: "InvoiceGenerator", icon: <AddBusinessIcon /> },
    { label: "Purchase List", key: "PurchaseList", icon: <ListAltIcon /> },
    { label: "Purchase Payment", key: "ManagePayments", icon: <PaymentIcon /> },
    { label: "GST Billing", key: "GSTGenerator", icon: <ReceiptLongIcon /> },
    { label: "GST Invoices", key: "GSTList", icon: <ListAltIcon /> },
    { label: "Purchase Report Ledger", key: "LedgerReport", icon: <SummarizeIcon /> },
    { label: "Combined Report Ledger", key: "CombinedLedgerReport", icon: <EqualizerIcon /> },
  ];

  return (
    <Box
      sx={{
        width: "250px",
        backgroundColor: "#1a202c",
        color: "#fff",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          marginBottom: "20px",
          textAlign: "center",
          color: "#ff7300",
          letterSpacing: "1px",
        }}
      >
        Dashboard
      </Typography>
      <Divider sx={{ backgroundColor: "#4a5568", marginBottom: "20px" }} />
      {menuItems.map((item, index) => (
        <Button
          key={item.key}
          onClick={() => setActiveComponent(item.key)}
          startIcon={item.icon}
          sx={{
            width: "100%",
            justifyContent: "flex-start",
            color: "#ecf0f1",
            padding: "10px 15px",
            marginBottom: "10px",
            fontSize: "15px",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#2d3748",
              color: "#febd00",
              transform: "scale(1.02)",
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
