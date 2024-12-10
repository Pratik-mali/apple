import React, { useState, useEffect } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "./firebase";
import { Box, Card, Typography, Grid, Avatar } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DiscountIcon from "@mui/icons-material/Discount";

const Dash = () => {
  const [metrics, setMetrics] = useState({
    totalSales: { day: 0, week: 0, month: 0 },
    totalDues: { day: 0, week: 0, month: 0 },
    totalCustomers: 0,
    bestSellingProducts: [],
    invoiceCounts: { day: 0, week: 0, month: 0 },
    discounts: { day: 0, week: 0, month: 0 },
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const invoicesQuery = query(collection(db, "invoices"));
        const querySnapshot = await getDocs(invoicesQuery);

        const allInvoices = querySnapshot.docs.map((doc) => doc.data());

        let salesDay = 0,
          salesWeek = 0,
          salesMonth = 0;
        let duesDay = 0,
          duesWeek = 0,
          duesMonth = 0;
        let discountsDay = 0,
          discountsWeek = 0,
          discountsMonth = 0;
        let invoiceCountDay = 0,
          invoiceCountWeek = 0,
          invoiceCountMonth = 0;
        const customersSet = new Set(); // To track unique customers

        const productSales = {};

        allInvoices.forEach((invoice) => {
          const timestamp = new Date(invoice.timestamp);
          const isToday = timestamp >= startOfDay;
          const isThisWeek = timestamp >= startOfWeek;
          const isThisMonth = timestamp >= startOfMonth;

          // Sales Metrics
          const finalAmount = invoice.totals?.finalAmount || 0;
          if (isToday) salesDay += finalAmount;
          if (isThisWeek) salesWeek += finalAmount;
          if (isThisMonth) salesMonth += finalAmount;

          // Dues Metrics
          const dueAmount = invoice.totals?.dueAmount || 0;
          if (isToday) duesDay += dueAmount;
          if (isThisWeek) duesWeek += dueAmount;
          if (isThisMonth) duesMonth += dueAmount;

          // Discounts
          const totalDiscount = invoice.totals?.totalDiscount || 0;
          if (isToday) discountsDay += totalDiscount;
          if (isThisWeek) discountsWeek += totalDiscount;
          if (isThisMonth) discountsMonth += totalDiscount;

          // Invoice Count
          if (isToday) invoiceCountDay++;
          if (isThisWeek) invoiceCountWeek++;
          if (isThisMonth) invoiceCountMonth++;

          // Track Unique Customers
          if (invoice.customer?.name) {
            customersSet.add(invoice.customer.name);
          }

          // Product Sales
          invoice.products.forEach((product) => {
            if (product.productName) {
              if (!productSales[product.productName]) {
                productSales[product.productName] = product.quantity || 0;
              } else {
                productSales[product.productName] += product.quantity || 0;
              }
            }
          });
        });

        // Sort products by sales
        const sortedProducts = Object.entries(productSales)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([productName, quantity]) => ({ productName, quantity }));

        // Set Metrics
        setMetrics({
          totalSales: { day: salesDay, week: salesWeek, month: salesMonth },
          totalDues: { day: duesDay, week: duesWeek, month: duesMonth },
          totalCustomers: customersSet.size,
          bestSellingProducts: sortedProducts,
          invoiceCounts: {
            day: invoiceCountDay,
            week: invoiceCountWeek,
            month: invoiceCountMonth,
          },
          discounts: { day: discountsDay, week: discountsWeek, month: discountsMonth },
        });
      } catch (error) {
        console.error("Error fetching metrics: ", error);
      }
    };

    fetchMetrics();
  }, []);

  const renderCard = (title, values, icon, gradient) => (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 3,
        borderRadius: 2,
        boxShadow: 5,
        backgroundImage: gradient,
        color: "#fff",
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
          {title}
        </Typography>
        <Typography>Today: ₹{values.day}</Typography>
        <Typography>This Week: ₹{values.week}</Typography>
        <Typography>This Month: ₹{values.month}</Typography>
      </Box>
      <Avatar sx={{ bgcolor: "rgba(255, 255, 255, 0.3)", width: 56, height: 56 }}>
        {icon}
      </Avatar>
    </Card>
  );

  return (
    <Box sx={{ padding: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          {renderCard(
            "Total Sales",
            metrics.totalSales,
            <AttachMoneyIcon />,
            "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)"
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          {renderCard(
            "Total Dues",
            metrics.totalDues,
            <TrendingUpIcon />,
            "linear-gradient(135deg, #ff7300 0%, #febd00 100%)"
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          {renderCard(
            "Invoice Counts",
            metrics.invoiceCounts,
            <ReceiptIcon />,
            "linear-gradient(135deg, #02aab0 0%, #00cdac 100%)"
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          {renderCard(
            "Discounts",
            metrics.discounts,
            <DiscountIcon />,
            "linear-gradient(135deg, #f12711 0%, #f5af19 100%)"
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dash;
