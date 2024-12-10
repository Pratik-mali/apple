import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, getDocs, startAfter, limit, deleteDoc, doc } from 'firebase/firestore';
import InvoiceGenerator from './InvoiceGenerator';

const PurchaseList = () => {
  const [records, setRecords] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const RECORDS_PER_PAGE = 25;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'PurchaseInvoices'),
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

  const handleDelete = async (id) => {
    try {
      // Confirm delete action
      const confirmDelete = window.confirm('Are you sure you want to delete this invoice?');
      if (!confirmDelete) return;
  
      // Delete the document from Firestore
      await deleteDoc(doc(db, 'PurchaseInvoices', id));
  
      // Update the records and filteredRecords state
      setRecords((prevRecords) => prevRecords.filter((record) => record.id !== id));
      setFilteredRecords((prevFiltered) =>
        prevFiltered.filter((record) => record.id !== id)
      );
  
      alert('Invoice deleted successfully.');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice. Please try again.');
    }
  };


  const handleNextPage = () => {
    if (!loading) {
      fetchRecords();
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEditInvoice = (record) => {
    setSelectedRecord(record);
    setIsEditMode(true);
    setIsEditModalOpen(true);
  };

  const handleCreateInvoice = () => {
    setSelectedRecord(null);
    setIsEditMode(false);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
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
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: #fff;
      padding: 30px;
      border-radius: 10px;
      width: 100%;
      max-width: 800px;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      animation: fadeIn 0.3s ease-in-out;
    }

    .modal-close-btn {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background: #ff4d4d;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .modal-close-btn:hover {
      background: #ff1a1a;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Table Styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      background-color: #f9f9f9;
    }

    table th,
    table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }

    table th {
      background: #007bff;
      color: white;
      font-weight: bold;
    }

    table tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    table tr:hover {
      background-color: #e6f7ff;
    }

    /* Input Field Styling */
    input[type="text"],
    input[type="date"] {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    input[type="text"]:focus,
    input[type="date"]:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    }

    /* Button Styling */
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s ease;
      
    }

    button:hover {
      background: #0056b3;
    }

    button:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    /* Table Actions Button */
    .table-actions button {
      margin-right: 5px;
    }

    /* Header */
    h1 {
      font-family: Arial, sans-serif;
      text-align: center;
      color: #333;
      margin-bottom: 20px;
    }

    /* Utility */
    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
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
                <button onClick={() => handleEditInvoice(record)}>Edit</button>
                <button  className="modal-close-btn" onClick={() => handleDelete(record.id)}>Delete</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleNextPage} disabled={loading}>
        {loading ? 'Loading...' : 'Next'}
      </button>
      <button onClick={handleCreateInvoice}>New Invoice</button>

      {/* View Modal */}
      {isViewModalOpen && selectedRecord && (
         <div className="modal">
         <div className="modal-content">
           <h2>Invoice Details</h2>
           <p><strong>Invoice Number:</strong> {selectedRecord.invoiceNumber || 'N/A'}</p>
           <p><strong>Invoice Date:</strong> {selectedRecord.invoiceDate || 'N/A'}</p>
           <p><strong>Party Name:</strong> {selectedRecord.partyDetails?.name || 'N/A'}</p>
           <p><strong>Address:</strong> {selectedRecord.partyDetails?.address || 'N/A'}</p>
           <p><strong>GSTIN:</strong> {selectedRecord.partyDetails?.gstin || 'N/A'}</p>

           <h3>Purchased Products</h3>
           <table>
             <thead>
               <tr>
                 <th>Product Name</th>
                 <th>Quantity</th>
                 <th>Rate</th>
                 <th>Amount</th>
                 <th>Discount</th>
                 <th>Size</th>
               </tr>
             </thead>
             <tbody>
               {selectedRecord.products?.map((product, index) => (
                 <tr key={index}>
                   <td>{product.name || 'N/A'}</td>
                   <td>{product.quantity || 0}</td>
                   <td>₹{(product.rate || 0).toFixed(2)}</td>
                   <td>₹{(product.amount || 0).toFixed(2)}</td>
                   
                   <td>₹{(parseFloat(product.discount) || 0).toFixed(2)}</td>
                   <td>{product.size || 'N/A'}</td>
                 </tr>
               ))}
             </tbody>
           </table>

           <h3>Invoice Totals</h3>
           <p><strong>Total Amount:</strong> ₹{(selectedRecord.totals?.totalAmount || 0).toFixed(2)}</p>
           <p><strong>Discount:</strong> ₹{(selectedRecord.totals?.totalDiscount || 0).toFixed(2)}</p>

           <p><strong>CGST:</strong> ₹{(selectedRecord.totals?.cgst || 0).toFixed(2)}</p>
           <p><strong>SGST:</strong> ₹{(selectedRecord.totals?.sgst || 0).toFixed(2)}</p>
           <p><strong>IGST:</strong> ₹{(selectedRecord.totals?.igst || 0).toFixed(2)}</p>
           <p><strong>Total Tax:</strong> ₹{(selectedRecord.totals?.totalTax || 0).toFixed(2)}</p>
           <p><strong>Round OFF:</strong> ₹{(selectedRecord.totals?.roundOff || 0).toFixed(2)}</p>

           <h4><strong>Grand Total:</strong> ₹{(selectedRecord.totals?.grandTotal || 0).toFixed(2)}</h4>
           <button className="modal-close-btn" onClick={closeModal}>Close</button>
         </div>
       </div>
      )}

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <InvoiceGenerator
              editInvoice={selectedRecord}
              isEditMode={isEditMode}
              onReset={closeModal}
            />
            <button className="modal-close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseList;
