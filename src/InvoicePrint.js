import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Styling
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#f8f8f8',
  },
  letterhead: {
    marginBottom: 20,
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#00468b',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    border: '1px solid #d9d9d9',
  },

  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#d9d9d9',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#00468b',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    padding: 5,
    fontSize: 10,
  },
  footerSection: {
    marginTop: 'auto', // Push to bottom
    borderTop: '2 solid #4A90E2', // Blue border at the top
    paddingTop: 15,
    backgroundColor: '#F7F9FC', // Light background for the footer section
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    border: '1 solid #E6E9ED', // Light border around the row
    borderRadius: 5,
  },
  bankDetails: {
    width: '48%',
    fontSize: 10,
    padding: 10,
    backgroundColor: '#FFFFFF', // White background for bank details
    border: '1 solid #D1D5DB', // Grey border for separation
    borderRadius: 5,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow effect
  },
  totals: {
    width: '48%',
    fontSize: 10,
    padding: 10,
    backgroundColor: '#FFFFFF', // White background for totals
    border: '1 solid #D1D5DB', // Grey border for separation
    borderRadius: 5,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow effect
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 2,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#333', // Dark text for labels
  },
  value: {
    textAlign: 'right',
    fontSize: 10,
    color: '#4A90E2', // Blue text for values
  },
  signatureSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F4F8', // Light grey background for signature area
    borderRadius: 5,
    border: '1 solid #D1D5DB',
    fontSize: 10,
 
  },
  signatureLabel: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#333',
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 15,
    color: '#666', // Muted text color for footer
  },
  letterheadContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#00468b',
    color: '#ffffff',
    borderRadius: 5,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 5,
  },
  contactDetails: {
    fontSize: 10,
    textAlign: 'center',
    color: '#cce7ff',
    marginBottom: 5,
  },
  gstin: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  messageStrip: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#ffcc00',
    borderRadius: 3,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
});

// Invoice Component
const InvoicePrint = ({ invoiceData }) => (
  <Document>
    <Page style={styles.page}>
      {/* Letterhead Section */}
      <View style={styles.letterheadContainer}>
  {/* Company Name */}
  <Text style={styles.companyName}>Shaurya Trading Company</Text>

  {/* Address and Contact Details */}
  <Text style={styles.contactDetails}>
   At Post Tulshi, Tal. Madha, Dist. Solapur | Email: info@abcgarments.com | Phone: +91-9876543210
  </Text>

  {/* GSTIN Number */}
  <Text style={styles.gstin}>GSTIN: 27XXXXXXXXX9Z5</Text>

  {/* Horizontal Strip with Message */}
  <View style={styles.messageStrip}>
    <Text style={styles.messageText}>"Delivering Quality and Trust Since 1995"</Text>
  </View>
</View>


      {/* Bill To Section */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Bill To:</Text>
            <Text style={styles.value}>{invoiceData.partyDetails.name}</Text>
            <Text style={styles.value}>{invoiceData.partyDetails.address}</Text>
            <Text style={styles.value}>GSTIN: {invoiceData.partyDetails.gstin}</Text>
          </View>
          <View>
            <Text style={styles.label}>Invoice No: INV-2024001</Text>
            <Text style={styles.label}>Date: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      {/* Product Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Sl. No.</Text>
          <Text style={styles.tableCell}>Description</Text>
          <Text style={styles.tableCell}>Size</Text>

          <Text style={styles.tableCell}>Quantity</Text>
          <Text style={styles.tableCell}>Rate</Text>
          <Text style={styles.tableCell}>Amount</Text>
        </View>
        {invoiceData.products.map((product, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{index + 1}</Text>
            <Text style={styles.tableCell}>{product.name}</Text>
            <Text style={styles.tableCell}>{product.size}</Text>

            <Text style={styles.tableCell}>{product.quantity}</Text>
            <Text style={styles.tableCell}>{product.rate.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{product.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Footer Section */}
    {/* Footer Section */}
<View style={styles.footerSection}>
  <View style={styles.footerRow}>
    {/* Bank Details */}
    <View style={styles.bankDetails}>
      <Text style={styles.label}>Bank Details:</Text>
      <Text>Bank Name: XYZ Bank</Text>
      <Text>Account Number: 123456789012</Text>
      <Text>IFSC Code: XYZB0000123</Text>
    </View>

    {/* Totals Section */}
    <View style={styles.totals}>
      <View style={styles.row}>
        <Text style={styles.label}>Total Quantity:</Text>
        <Text style={styles.value}>{invoiceData.totals.totalQuantity}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal:</Text>
        <Text style={styles.value}>₹{invoiceData.totals.totalAmount.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>CGST:</Text>
        <Text style={styles.value}>₹{invoiceData.totals.cgst.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>SGST:</Text>
        <Text style={styles.value}>₹{invoiceData.totals.sgst.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Grand Total:</Text>
        <Text style={styles.value}>₹{invoiceData.totals.grandTotal.toFixed(2)}</Text>
      </View>
    </View>
  </View>

  {/* Signature Section */}
  <View style={styles.signatureSection}>
    <Text style={styles.label}>Authorized Signatory:</Text>
    <Text>(Seal & Signature)</Text>
  </View>

  {/* Footer */}
  <Text style={styles.footer}>Thank you for your business!</Text>
</View>

    </Page>
  </Document>
);

export default InvoicePrint;
