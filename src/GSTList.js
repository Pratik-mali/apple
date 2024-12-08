import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, getDocs, startAfter, limit } from 'firebase/firestore';

const GSTList = () => {
  const [records, setRecords] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const RECORDS_PER_PAGE = 25;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'GSTInvoices'),
        orderBy('invoiceNumber'),
        limit(RECORDS_PER_PAGE)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const newRecords = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Prevent duplicates
      setRecords((prev) => {
        const uniqueRecords = [...prev, ...newRecords].reduce((acc, record) => {
          if (!acc.find((r) => r.id === record.id)) {
            acc.push(record);
          }
          return acc;
        }, []);
        return uniqueRecords;
      });

      setFilteredRecords((prev) => {
        const uniqueFiltered = [...prev, ...newRecords].reduce((acc, record) => {
          if (!acc.find((r) => r.id === record.id)) {
            acc.push(record);
          }
          return acc;
        }, []);
        return uniqueFiltered;
      });

      if (!querySnapshot.empty) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    }
    setLoading(false);
  }, [lastDoc]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const lowerQuery = query.toLowerCase();
      const filtered = records.filter((record) =>
        record.partyDetails?.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  };

  const handleNextPage = () => {
    if (!loading) {
      fetchRecords();
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(false);
  };

  return (
    <div>
      <style>
        {`
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            overflow-y: auto;
            max-height: 90%;
          }
          .modal-content h2 {
            margin-top: 0;
          }
          .modal-content table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .modal-content table th, .modal-content table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .modal-content table th {
            background: #f4f4f4;
            font-weight: bold;
          }
          .modal-close-btn {
            margin-top: 10px;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          table th {
            background: #f4f4f4;
            font-weight: bold;
          }
          input {
            margin-bottom: 10px;
            padding: 8px;
            width: 100%;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        `}
      </style>

      <h1>Purchase Records</h1>
      <input
        type="text"
        placeholder="Search by party name"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Invoice Date</th>
            <th>Party Name</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.invoiceNumber}</td>
              <td>{record.invoiceDate}</td>
              <td>{record.partyDetails.name}</td>
              <td>₹{record.totals.grandTotal.toFixed(2)}</td>
              <td>
                <button onClick={() => handleViewDetails(record)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredRecords.length % RECORDS_PER_PAGE === 0 && (
        <button onClick={handleNextPage} disabled={loading}>
          {loading ? 'Loading...' : 'Next'}
        </button>
      )}

      {/* Modal for Viewing Details */}
      {isModalOpen && selectedRecord && (
        <div className="modal">
          <div className="modal-content">
            <h2>Invoice Details</h2>
            <p><strong>Invoice Number:</strong> {selectedRecord.invoiceNumber || 'N/A'}</p>
            <p><strong>Invoice Date:</strong> {selectedRecord.invoiceDate || 'N/A'}</p>
            <p><strong>Party Name:</strong> {selectedRecord.partyDetails?.name || 'N/A'}</p>
            <p><strong>Contact:</strong> {selectedRecord.partyDetails?.contact || 'N/A'}</p>
            
            <h3>Purchased Products</h3>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedRecord.products?.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name || 'N/A'}</td>
                    <td>{product.quantity || 0}</td>
                    <td>₹{(product.rate || 0).toFixed(2)}</td>
                    <td>₹{((product.rate || 0) * (product.quantity || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Invoice Totals</h3>
            <p><strong>Total Amount:</strong> ₹{(selectedRecord.totals?.totalAmount || 0).toFixed(2)}</p>
            <p><strong>CGST:</strong> ₹{(selectedRecord.totals?.cgst || 0).toFixed(2)}</p>
            <p><strong>SGST:</strong> ₹{(selectedRecord.totals?.sgst || 0).toFixed(2)}</p>
            <p><strong>IGST:</strong> ₹{(selectedRecord.totals?.igst || 0).toFixed(2)}</p>
            <p><strong>Total Tax:</strong> ₹{(selectedRecord.totals?.totalTax || 0).toFixed(2)}</p>
            <h4><strong>Grand Total:</strong> ₹{(selectedRecord.totals?.grandTotal || 0).toFixed(2)}</h4>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GSTList;
