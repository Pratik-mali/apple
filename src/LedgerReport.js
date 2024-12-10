import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // Replace with your Firebase config file
import "./LedgerReport.css";

const LedgerReport = () => {
  const [partyName, setPartyName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ledgerData, setLedgerData] = useState([]);
  const [availableParties, setAvailableParties] = useState([]);
  const [error, setError] = useState("");

  // Fetch party names from PurchaseInvoices
  useEffect(() => {
    const fetchParties = async () => {
      const parties = new Set();
      const querySnapshot = await getDocs(collection(db, "PurchaseInvoices"));
      querySnapshot.forEach((doc) => {
        const party = doc.data().partyDetails?.name;
        if (party) {
          parties.add(party);
        }
      });
      setAvailableParties([...parties]);
    };
    fetchParties();
  }, []);

  // Fetch ledger data based on selected party and date range
  const fetchLedgerData = async () => {
    if (!partyName || !startDate || !endDate) {
      setError("Please select a party name and date range.");
      return;
    }
    setError("");

    try {
      const ledger = [];
      // Fetch purchase invoices for the party
      const purchasesQuery = query(
        collection(db, "PurchaseInvoices"),
        where("partyDetails.name", "==", partyName),
        where("invoiceDate", ">=", startDate),
        where("invoiceDate", "<=", endDate)
      );
      const purchasesSnapshot = await getDocs(purchasesQuery);
      purchasesSnapshot.forEach((doc) => {
        const data = doc.data();
        ledger.push({
          date: data.invoiceDate,
          description: `Purchase Invoice #${data.invoiceNumber}`,
          debit: data.totals.grandTotal,
          credit: 0,
        });
      });

      // Fetch payments for the party
      const paymentsQuery = query(
        collection(db, "Payments"),
        where("partyName", "==", partyName),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      paymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        ledger.push({
          date: data.date,
          description: `Payment (${data.mode}) #${data.voucherNumber}`,
          debit: 0,
          credit: data.amount,
        });
      });

      // Sort by date
      ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calculate running balance
      let balance = 0;
      ledger.forEach((entry) => {
        balance += entry.credit - entry.debit;
        entry.balance = balance;
      });

      setLedgerData(ledger);
    } catch (err) {
      console.error("Error fetching ledger data:", err);
      setError("Error fetching ledger data. Please check the console for details.");
    }
  };

  return (
    <div className="ledger-report">
      <h1>Ledger Report</h1>

      {/* Party Name Dropdown */}
      <div className="form-group">
        <label>Party Name:</label>
        <select value={partyName} onChange={(e) => setPartyName(e.target.value)}>
          <option value="">Select Party</option>
          {availableParties.map((party, index) => (
            <option key={index} value={party}>
              {party}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Inputs */}
      <div className="form-group">
        <label>From:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label>To:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {/* Generate Report Button */}
      <button onClick={fetchLedgerData}>Generate Report</button>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Ledger Table */}
      {ledgerData.length > 0 && (
        <>
          <h2>Party: {partyName}</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.description}</td>
                  <td>{entry.debit > 0 ? entry.debit.toFixed(2) : "-"}</td>
                  <td>{entry.credit > 0 ? entry.credit.toFixed(2) : "-"}</td>
                  <td>{entry.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default LedgerReport;
