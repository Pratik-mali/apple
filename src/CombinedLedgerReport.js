import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // Replace with your Firebase config file
import { PDFViewer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import "./LedgerReport.css";

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: "Helvetica",
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
    padding: 10,
    backgroundColor: "#0073e6",
    color: "#fff",
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  table: {
    display: "table",
    width: "100%",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "solid",
    borderCollapse: "collapse",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderBottomStyle: "solid",
    paddingVertical: 3,
  },
  tableHeader: {
    backgroundColor: "#0073e6",
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    padding: 10,
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: "center",
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    borderRightStyle: "solid",
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  bold: {
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    textAlign: "right",
    fontSize: 10,
    color: "#555",
  },
});

const CombinedLedgerReportPDF = ({ ledgerData, total }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Combined Ledger Report</Text>
      </View>
      <View>
        <View style={[styles.tableRow, styles.bold]}>
          <Text style={styles.tableCell}>Party</Text>
          <Text style={styles.tableCell}>Date</Text>
          <Text style={styles.tableCell}>Description</Text>
          <Text style={styles.tableCell}>Debit</Text>
          <Text style={styles.tableCell}>Credit</Text>
          <Text style={styles.tableCell}>Balance</Text>
        </View>
        {ledgerData.map((entry, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCell}>{entry.party}</Text>
            <Text style={styles.tableCell}>{entry.date}</Text>
            <Text style={styles.tableCell}>{entry.description}</Text>
            <Text style={styles.tableCell}>{entry.debit > 0 ? entry.debit.toFixed(2) : "-"}</Text>
            <Text style={styles.tableCell}>{entry.credit > 0 ? entry.credit.toFixed(2) : "-"}</Text>
            <Text style={styles.tableCell}>{entry.balance.toFixed(2)}</Text>
          </View>
        ))}
        <View style={[styles.tableRow, styles.bold]}>
          <Text style={styles.tableCell}>Total</Text>
          <Text style={styles.tableCell}></Text>
          <Text style={styles.tableCell}></Text>
          <Text style={styles.tableCell}>{total.debit.toFixed(2)}</Text>
          <Text style={styles.tableCell}>{total.credit.toFixed(2)}</Text>
          <Text style={styles.tableCell}>{total.balance.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text>Generated on: {new Date().toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
);

const CombinedLedgerReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ledgerData, setLedgerData] = useState([]);
  const [error, setError] = useState("");
  const [printMode, setPrintMode] = useState(false);
  const [total, setTotal] = useState({ debit: 0, credit: 0, balance: 0 });

  const fetchLedgerData = async () => {
    if (!startDate || !endDate) {
      setError("Please select a date range.");
      return;
    }
    setError("");

    try {
      const ledger = [];
      const partiesQuery = query(collection(db, "PurchaseInvoices"));
      const partiesSnapshot = await getDocs(partiesQuery);

      partiesSnapshot.forEach((doc) => {
        const data = doc.data();
        const party = data.partyDetails?.name || "Unknown";
        ledger.push({
          party,
          date: data.invoiceDate,
          description: `Purchase Invoice #${data.invoiceNumber}`,
          debit: data.totals.grandTotal,
          credit: 0,
        });
      });

      const paymentsQuery = query(collection(db, "Payments"));
      const paymentsSnapshot = await getDocs(paymentsQuery);

      paymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        ledger.push({
          party: data.partyName || "Unknown",
          date: data.date,
          description: `Payment (${data.mode}) #${data.voucherNumber}`,
          debit: 0,
          credit: data.amount,
        });
      });

      ledger.sort((a, b) => new Date(a.date) - new Date(b.date));
      let balance = 0;
      let totalDebit = 0;
      let totalCredit = 0;
      ledger.forEach((entry) => {
        balance += entry.credit - entry.debit;
        entry.balance = balance;
        totalDebit += entry.debit;
        totalCredit += entry.credit;
      });

      setLedgerData(ledger);
      setTotal({ debit: totalDebit, credit: totalCredit, balance });
      setPrintMode(true);
    } catch (err) {
      console.error("Error fetching ledger data:", err);
      setError("Error fetching ledger data. Please check the console for details.");
    }
  };

  return (
    <div className="ledger-report">
      <h1>Combined Ledger Report</h1>
      <div className="form-group">
        <label>From:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label>To:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <button onClick={fetchLedgerData}>Generate Report</button>
      {error && <p className="error">{error}</p>}
      {printMode && (
        <div>
          <PDFViewer style={{ width: "100%", height: "500px" }}>
            <CombinedLedgerReportPDF ledgerData={ledgerData} total={total} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};

export default CombinedLedgerReport;
