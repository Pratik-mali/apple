import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, addDoc, query, where } from 'firebase/firestore';
import { db } from './firebase'; // Replace with your Firebase configuration

const ManagePayments = () => {
  const [parties, setParties] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [paymentPopup, setPaymentPopup] = useState(false);
  const [viewPaymentsPopup, setViewPaymentsPopup] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: '', mode: '' });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 20;

  useEffect(() => {
    const fetchParties = async () => {
      const invoicesRef = collection(db, 'PurchaseInvoices');
      const paymentsRef = collection(db, 'Payments');
      const [invoiceSnapshot, paymentSnapshot] = await Promise.all([
        getDocs(invoicesRef),
        getDocs(paymentsRef),
      ]);

      const uniqueParties = {};

      // Summing up total amounts from invoices
      invoiceSnapshot.forEach((doc) => {
        const party = doc.data().partyDetails;
        const totalAmount = doc.data().totals?.grandTotal || 0;

        if (!uniqueParties[party.name]) {
          uniqueParties[party.name] = {
            ...party,
            totalAmount,
            paidAmount: 0, // Initialize paidAmount
          };
        } else {
          uniqueParties[party.name].totalAmount += totalAmount;
        }
      });

      // Subtracting paid amounts from payments
      paymentSnapshot.forEach((doc) => {
        const payment = doc.data();
        if (uniqueParties[payment.partyName]) {
          uniqueParties[payment.partyName].paidAmount += payment.amount || 0;
        }
      });

      // Calculating unpaid amounts
      const partiesList = Object.values(uniqueParties).map((party) => ({
        ...party,
        unpaidAmount: (party.totalAmount || 0) - (party.paidAmount || 0),
      }));

      setParties(partiesList);
      setFilteredParties(partiesList);
      setLoading(false);
    };

    fetchParties();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = parties.filter((party) =>
      party.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredParties(filtered);
    setCurrentPage(1); // Reset to the first page
  };

  const handleViewPayments = async (partyName) => {
    const paymentsRef = collection(db, 'Payments');
    const q = query(paymentsRef, where('partyName', '==', partyName));
    const paymentSnapshot = await getDocs(q);
    const paymentRecords = paymentSnapshot.docs.map((doc) => doc.data());
    setPayments(paymentRecords);
    setSelectedParty(partyName);
    setViewPaymentsPopup(true);
  };

  const handleMakePayment = async () => {
    if (!newPayment.amount || !newPayment.mode) {
      alert('Please enter a valid amount and mode of payment.');
      return;
    }

    const updatedParties = parties.map((party) => {
      if (party.name === selectedParty) {
        return {
          ...party,
          unpaidAmount: (party.unpaidAmount || 0) - Number(newPayment.amount),
        };
      }
      return party;
    });

    setParties(updatedParties);
    setFilteredParties(updatedParties);

    await addDoc(collection(db, 'Payments'), {
      partyName: selectedParty,
      amount: Number(newPayment.amount),
      mode: newPayment.mode,
      date: new Date().toISOString(),
    });

    setNewPayment({ amount: '', mode: '' });
    setPaymentPopup(false);
    alert('Payment recorded successfully!');
  };

  const currentPageRecords = filteredParties.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Manage Payments</h1>
      <input
        type="text"
        placeholder="Search by Party Name"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          marginBottom: '20px',
          padding: '8px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th>Party Name</th>
            <th>Address</th>
            <th>GSTIN</th>
            <th>Total Unpaid Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPageRecords.map((party, index) => (
            <tr key={index}>
              <td>{party.name}</td>
              <td>{party.address}</td>
              <td>{party.gstin}</td>
              <td>{party.unpaidAmount ? party.unpaidAmount.toFixed(2) : '0.00'}</td>
              <td>
                <button
                  onClick={() => handleViewPayments(party.name)}
                  style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer' }}
                >
                  See Payments
                </button>
                <button
                  onClick={() => {
                    setSelectedParty(party.name);
                    setPaymentPopup(true);
                  }}
                  style={{ padding: '5px 10px', cursor: 'pointer' }}
                >
                  Make Payment
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ padding: '8px 15px', cursor: 'pointer' }}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              prev * recordsPerPage < filteredParties.length ? prev + 1 : prev
            )
          }
          disabled={currentPage * recordsPerPage >= filteredParties.length}
          style={{ padding: '8px 15px', cursor: 'pointer' }}
        >
          Next
        </button>
      </div>

      {/* Payment Popup */}
      {paymentPopup && (
        <div style={popupStyle}>
          <h2>Make Payment for {selectedParty}</h2>
          <input
            type="number"
            placeholder="Enter Amount"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Mode of Payment"
            value={newPayment.mode}
            onChange={(e) => setNewPayment({ ...newPayment, mode: e.target.value })}
            style={inputStyle}
          />
          <button onClick={handleMakePayment} style={buttonStyle}>
            Submit
          </button>
          <button onClick={() => setPaymentPopup(false)} style={{ ...buttonStyle, background: 'red' }}>
            Cancel
          </button>
        </div>
      )}

      {/* View Payments Popup */}
      {viewPaymentsPopup && (
        <div style={popupStyle}>
          <h2>Payments for {selectedParty}</h2>
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index}>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                  <td>{payment.amount ? payment.amount.toFixed(2) : '0.00'}</td>
                  <td>{payment.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setViewPaymentsPopup(false)} style={buttonStyle}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Styles
const popupStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  zIndex: 1000,
};
const inputStyle = {
  marginBottom: '10px',
  padding: '8px',
  width: '100%',
  boxSizing: 'border-box',
};
const buttonStyle = {
  padding: '8px 15px',
  margin: '5px',
  cursor: 'pointer',
};

export default ManagePayments;
