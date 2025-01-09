import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: "Tiro Marathi",
  src: "./TiroDevanagariMarathi-Regular.ttf", // Adjust the path as per your project structure
});

// Styling
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#fdf8f3', // Light Cream background
  },
  letterheadContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#800000', // Maroon for bold header
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
    color: '#f4d4d1', // Light cream for soft contrast
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
    backgroundColor: '#ffcc00', // Subtle yellow for message strip
    borderRadius: 3,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    border: '1px solid #d9d9d9', // Grey border for clean look
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
    color: '#800000', // Maroon for labels
  },
  value: {
    textAlign: 'right',
    fontSize: 10,
    color: '#4A90E2', // Blue for values to highlight totals
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d9d9d9', // Light grey border around the table
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
    backgroundColor: '#800000', // Maroon header
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

  tableCell1: {
    flex: 1,
    textAlign: 'center',
    padding: 5,
    fontSize: 10,
    fontFamily: "Tiro Marathi",

  },
  footerSection: {
    marginTop: 'auto', // Push to bottom
    borderTop: '2 solid #800000', // Maroon border at the top
    paddingTop: 15,
    backgroundColor: '#F7F9FC', // Light background for footer
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    border: '1 solid #E6E9ED', // Light border around footer row
    borderRadius: 5,
  },
  bankDetails: {
    width: '48%',
    fontSize: 10,
    padding: 10,
    backgroundColor: '#ffffff', // White background for bank details
    border: '1 solid #D1D5DB', // Light grey border for separation
    borderRadius: 5,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow effect
  },
  totals: {
    width: '48%',
    fontSize: 10,
    padding: 10,
    backgroundColor: '#ffffff', // White background for totals
    border: '1 solid #D1D5DB', // Light grey border for separation
    borderRadius: 5,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow effect
  },
  signatureSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F4F8', // Light grey for signature area
    borderRadius: 5,
    border: '1 solid #D1D5DB',
    fontSize: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 15,
    color: '#666', // Muted footer text
  },
});

// Invoice Component
const InvoicePrint = ({ invoiceData }) => (
  <Document>
    <Page style={styles.page}>
      {/* Letterhead Section */}
      <View style={styles.letterheadContainer}>
        <Text style={styles.companyName}>SHAURYA TRADING COMPANY</Text>
        <Text style={styles.contactDetails}>
          At Post Tulshi, Tal. Madha, Dist. Solapur | Email: shaurytradingcom17@gmail.com | Phone: +91-9665526332 / +91-7741056332
        </Text>
        <Text style={styles.gstin}>GSTIN: 27FIMPD7877K1ZE</Text>
        <View style={styles.messageStrip}>
          <Text style={styles.messageText}>"Purchase Invoice"</Text>
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
            <Text style={styles.label}>Invoice No:  {invoiceData.invoiceNumber}</Text>
            <Text style={styles.label}>
  Date: {new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB')}
</Text>
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
            <Text style={styles.tableCell1}>{product.name}</Text>
            <Text style={styles.tableCell}>{product.size}</Text>
            <Text style={styles.tableCell}>{product.quantity}</Text>
            <Text style={styles.tableCell}>{product.rate.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{product.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Footer Section */}
      <View style={styles.footerSection}>
        <View style={styles.footerRow}>
          <View style={styles.bankDetails}>
            <Text style={styles.label}>Bank Details:</Text>
            <Text>Bank Name: State Bank of India</Text>
            <Text>Account Number: 40474510195</Text>
            <Text>IFSC Code: SBIN0061399</Text>
          </View>
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
              <Text style={styles.label}>Total Amount:</Text>
              <Text style={styles.value}>₹{invoiceData.totals.grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.signatureSection}>
          <Text>Authorized Signatory:</Text>
          <Image
            style={styles.qrCode}
            src="/QR.jpg"
          />
        </View>
        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePrint;
