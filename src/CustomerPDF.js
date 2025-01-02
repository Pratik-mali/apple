import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font

} from "@react-pdf/renderer";
Font.register({
  family: "Tiro Marathi",
  src: "./TiroDevanagariMarathi-Regular.ttf", // Adjust the path as per your project structure
});
// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: "Tiro Marathi",
  },
  section: {
    marginBottom: 10,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#f2f2f2",
  },
});

// PDF Layout Component
const CustomerPDF = ({ customers }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>Customers with Dues</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCol}>Name</Text>
          <Text style={styles.tableCol}>Contact Number</Text>
          <Text style={styles.tableCol}>Address</Text>
          <Text style={styles.tableCol}>Total Due</Text>
        </View>
        {/* Table Rows */}
        {customers.map((customer, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCol}>{customer.name}</Text>
            <Text style={styles.tableCol}>{customer.contactNumber}</Text>
            <Text style={styles.tableCol}>{customer.address}</Text>
            <Text style={styles.tableCol}>₹{customer.totalDue.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default CustomerPDF;
