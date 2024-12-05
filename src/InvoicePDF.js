import React from "react";
import { Document, Page, Text, View, StyleSheet, Font} from "@react-pdf/renderer";

// Register the font
Font.register({
  family: "Tiro Marathi",
  src: "./TiroDevanagariMarathi-Regular.ttf", // Adjust the path as per your project structure
});

const InvoicePDF = ({ invoiceData }) => {
  const styles = StyleSheet.create({
    page: {
      padding: 20,
      flexDirection: "column",
      height: "100%",
    },
    dateContainer: {
      position: "absolute",
      top: 20,
      right: 20,
      fontSize: 8,
    },
    customerDetails: {
      fontSize: 8,
      textAlign: "center",
      marginBottom:10
    },
    customerDetailsDiv: {
      marginTop: 50,
    },
    table: {
      display: "table",
      width: "100%",
      height: 195.27, // 46% of A4 page height
      borderStyle: "solid",
      borderWidth: 2,
      borderColor: "#000",
      flexDirection: "column",
    },
    tableRow: {
      flexDirection: "row",
      paddingBottom:1
    },
    tableCellHeader: {
      paddingLeft: 5,
      fontSize: 8,
      fontWeight: "bold",
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: "#000",
      padding:5
    },
    tableCell: {
      paddingLeft: 5,
      fontSize: 8,
      borderRightWidth: 1,
      fontFamily: "Tiro Marathi",
      borderColor: "#000",
    },
    lastCell: {
      borderRightWidth: 0,
    },
    totalsRow: {
      flexDirection: "row",
      backgroundColor: "#f0f0f0",
      borderTopWidth: 1,
      borderColor: "#000",
      marginTop: "auto",
      padding:6
    },
    totalsCell: {
      padding: 0,
      fontSize: 8,
      fontWeight: "bold",
      borderColor: "#000",
      textAlign: "right",
    },
    totalsLastCell: {
      borderRightWidth: 0,
      textAlign: "right",
    },
    summaryContainer: {
      width: "40%",
      marginLeft: "auto",
      padding: 5,
      marginTop: -10,
      borderWidth: 1,
      borderColor: "#000",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    summaryText: {
      fontSize: 8,
      fontWeight: "bolder",
    },
  });

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Date */}
        {invoiceData.timestamp && (
          <View style={styles.dateContainer}>
            <Text>Date: {formatDate(invoiceData.timestamp)}</Text>
          </View>
        )}

        {/* Customer Details */}
        <View style={styles.customerDetailsDiv}>
          {invoiceData.customer.name && (
            <Text style={styles.customerDetails}>
              Customer Name: {invoiceData.customer.name}
            </Text>
          )}
          {(invoiceData.customer.contactNumber || invoiceData.customer.address) && (
            <Text style={styles.customerDetails}>
              Contact: {invoiceData.customer.contactNumber}
              {invoiceData.customer.address
                ? `, ${invoiceData.customer.address}`
                : ""}
            </Text>
          )}
        </View>

        {/* Product Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellHeader, { width: "10%" }]}>Sr. No.</Text>
            <Text style={[styles.tableCellHeader, { width: "30%" }]}>Product Name</Text>
            <Text style={[styles.tableCellHeader, { width: "15%" }]}>Quantity</Text>
            <Text style={[styles.tableCellHeader, { width: "15%" }]}>Rate</Text>
            <Text style={[styles.tableCellHeader, { width: "15%" }]}>Discount</Text>
            <Text style={[styles.tableCellHeader, styles.lastCell, { width: "15%" }]}>
              Amount
            </Text>
          </View>

          {/* Table Rows */}
          {[...Array(12)].map((_, index) => {
            const product = invoiceData.products?.[index] || {};

            return (
              <View key={index} style={styles.tableRow}>
                 {/* Conditionally render Serial Number if product exists */}
        {product.productName ? (
          <Text style={[styles.tableCell, { width: "10%" }]}>
            {index + 1}
          </Text>
        ) : (
          <Text style={[styles.tableCell, { width: "10%" }]}> </Text>
        )}

                {/* Product Name */}
                <Text style={[styles.tableCell, { width: "30%" }]}>
                  {product.productName || ""}
                </Text>

                {/* Quantity */}
                <Text style={[styles.tableCell, { width: "15%" }]}>
                  {product.quantity || ""}
                </Text>

                {/* Rate */}
                <Text style={[styles.tableCell, { width: "15%" }]}>
                  {product.price?.toFixed(2) || ""}
                </Text>

                {/* Discount */}
                <Text style={[styles.tableCell, { width: "15%" }]}>
                  {product.discount ? `${product.discount}%` : ""}
                </Text>

                {/* Amount */}
                <Text style={[styles.tableCell, styles.lastCell, { width: "15%" }]}>
                  {product.amount?.toFixed(2) || ""}
                </Text>
              </View>
              
            );
          })}
           <View style={styles.totalsRow}>
            <Text style={[styles.totalsCell, { width: "10%" }]}>-</Text>
            <Text style={[styles.totalsCell, { width: "30%" }]}>Totals</Text>
            <Text style={[styles.totalsCell, { width: "15%" }]}>-</Text>
            <Text style={[styles.totalsCell, { width: "15%" }]}>-</Text>
            <Text style={[styles.totalsCell, { width: "15%" }]}>
              {invoiceData.totals.totalDiscount?.toFixed(2) || "-"}
            </Text>
            <Text style={[styles.totalsCell, styles.totalsLastCell, { width: "15%" }]}>
              {invoiceData.totals.totalAmount?.toFixed(2) || "-"}
            </Text>
          </View>
        </View>
       

        {/* Totals Section */}
       {/* Totals Section and QR Code */ }
<View style={{ marginTop: 8 }}>
  {/* Totals Summary */}
  <View style={[styles.summaryContainer, { width: "50%" }]}>
    {invoiceData.totals?.finalAmount !== undefined && (
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>Final Amount:</Text>
        <Text style={styles.summaryText}>
          {invoiceData.totals.finalAmount.toFixed(2)}
        </Text>
      </View>
    )}
    {invoiceData.totals?.paidAmount !== undefined && (
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>Paid Amount:</Text>
        <Text style={styles.summaryText}>
          {invoiceData.totals.paidAmount.toFixed(2)}
        </Text>
      </View>
    )}
    {invoiceData.totals?.dueAmount > 0 && (
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>Due Amount:</Text>
        <Text style={styles.summaryText}>
          {invoiceData.totals.dueAmount.toFixed(2)}
        </Text>
      </View>
    )}
  </View>

  {/* QR Code */}

</View>

      </Page>
    </Document>
  );
};

export default InvoicePDF;
