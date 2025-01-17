import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import ReactPDF from '@react-pdf/renderer';
import { where} from "firebase/firestore";

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
} from 'firebase/firestore';

import InvoicePrint from './InvoicePrint';

const GSTGenerator = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [state, setState] = useState('Maharashtra');
  const [partyDetails, setPartyDetails] = useState({
    name: '',
    address: '',
    gstin: '',
  });
  const [products, setProducts] = useState([
    { name: '', size: '', quantity: 0, rate: 0, amount: 0 },
  ]);
  const [cgstRate, setCgstRate] = useState(2.5);
  const [sgstRate, setSgstRate] = useState(2.5);
  const [igstRate, setIgstRate] = useState(0);


  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1); // For keyboard navigation
  
  const [partyInfo, setPartyInfo] = useState({ name: '', address: '', gstin: '' });
  const [partySuggestions, setPartySuggestions] = useState([]);
  const [showPartySuggestions, setShowPartySuggestions] = useState(false);
  const [activePartySuggestion, setActivePartySuggestion] = useState(-1);
  const handlePartyChange = async (field, value) => {
    const updatedPartyInfo = { ...partyInfo, [field]: value };
    setPartyInfo(updatedPartyInfo);
  
    if (field === 'name' && value.trim()) {
      const invoicesRef = collection(db, 'GSTInvoices');
      const querySnapshot = await getDocs(
        query(
          invoicesRef,
          where('partyDetails.name', '>=', value),
          where('partyDetails.name', '<=', value + '\uf8ff')
        )
      );
  
      const suggestions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data().partyDetails,
      }));
  
      // Filter unique names
      const uniqueSuggestions = suggestions.reduce((acc, current) => {
        if (!acc.some((item) => item.name === current.name)) {
          acc.push(current);
        }
        return acc;
      }, []);
  
      setPartySuggestions(uniqueSuggestions);
      setShowPartySuggestions(true);
    } else if (field === 'name') {
      setPartySuggestions([]);
      setShowPartySuggestions(false);
    }
  };
  
  const handleSelectParty = (party) => {
    setPartyInfo({
      name: party.name,
      address: party.address,
      gstin: party.gstin,
    });
    setPartySuggestions([]);
    setShowPartySuggestions(false);
  };
  const handlePartyKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setActivePartySuggestion((prev) => Math.min(prev + 1, partySuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActivePartySuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activePartySuggestion !== -1) {
      handleSelectParty(partySuggestions[activePartySuggestion]);
    }
  };
  const handlePartyBlur = async () => {
    if (!partyInfo.name.trim()) return;
  
    const invoicesRef = collection(db, 'GSTInvoices');
    const querySnapshot = await getDocs(
      query(invoicesRef, where('partyDetails.name', '==', partyInfo.name))
    );
  
    if (!querySnapshot.empty) {
      const selectedParty = querySnapshot.docs[0].data().partyDetails;
      handleSelectParty(selectedParty);
    }
    setShowPartySuggestions(false);
  };
          

  useEffect(() => {
    const fetchLastInvoiceNumber = async () => {
      const q = query(collection(db, 'GSTInvoices'), orderBy('invoiceNumber', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const lastInvoice = querySnapshot.docs[0].data();
        setInvoiceNumber(lastInvoice.invoiceNumber + 1);
      } else {
        setInvoiceNumber(1);
      }
    };
    fetchLastInvoiceNumber();
  }, []);

  const handleProductChange = async (index, field, value) => {
  const updatedProducts = [...products];
  
  // Update the field value, converting to number if necessary
  updatedProducts[index][field] = field === 'quantity' || field === 'rate' ? Number(value) : value;

  // Calculate the amount for the row
  if (field === 'quantity' || field === 'rate') {
    updatedProducts[index].amount = updatedProducts[index].quantity * updatedProducts[index].rate;
  }

  setProducts(updatedProducts);

  // Automatically add a new row if the last row is completely filled
  const isRowFilled = (row) =>
    row.name.trim() && row.size.trim() && row.quantity > 0 && row.rate > 0;

  if (isRowFilled(updatedProducts[index]) && index === updatedProducts.length - 1) {
    handleAddProduct();
  }

  // Handle fetching suggestions if the field is 'name'
  if (field === 'name') {
    const fetchSuggestions = async (queryText) => {
      if (!queryText.trim()) {
        setSuggestions([]);
        return;
      }

      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('transliteratedName', '>=', queryText),
        where('transliteratedName', '<=', queryText + '\uf8ff')
      );

      const snapshot = await getDocs(q);
      const fetchedProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSuggestions(fetchedProducts);
    };

    fetchSuggestions(value.trim());
  }

  // Handle fetching and setting product details by code on blur
  if (field === 'name' && value.trim() === updatedProducts[index].name.trim()) {
    const fetchProductByCode = async (code) => {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('productCode', '==', code.trim()));

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const product = snapshot.docs[0].data();
        updatedProducts[index].name = product.productName;
        updatedProducts[index].size = product.productUnit; // Optional: update size
        setProducts(updatedProducts);
      }
    };

    fetchProductByCode(value.trim());
  }
};

const handleKeyDown = (event, index) => {
  if (event.key === 'ArrowDown') {
    setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
  } else if (event.key === 'ArrowUp') {
    setActiveSuggestion((prev) => Math.max(prev - 1, 0));
  } else if (event.key === 'Enter' && activeSuggestion !== -1) {
    const selectedProduct = suggestions[activeSuggestion];
    const updatedProducts = [...products];

    updatedProducts[index].name = selectedProduct.productName;
    updatedProducts[index].size = selectedProduct.productUnit; // Optional: update size
    setProducts(updatedProducts);

    setSuggestions([]); // Clear suggestions
    setActiveSuggestion(-1); // Reset active suggestion
  }
};

  const handleAddProduct = () => {
    setProducts([...products, { name: '', size: '', quantity: 0, rate: 0, amount: 0 }]);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const calculateTotals = () => {
    const totalQuantity = products.reduce((acc, product) => acc + product.quantity, 0);
    const totalAmount = products.reduce((acc, product) => acc + product.amount, 0);
    const cgst = totalAmount * (cgstRate / 100);
    const sgst = totalAmount * (sgstRate / 100);
    const igst = totalAmount * (igstRate / 100);
    const totalTax = cgst + sgst + igst;
    return {
      totalQuantity,
      totalAmount,
      cgst,
      sgst,
      igst,
      totalTax,
      grandTotal: totalAmount + totalTax,
    };
  };

  const handleSaveInvoice = async () => {
    try {
      // Filter out empty rows
      const filteredProducts = products.filter(
        (product) =>
          product.name.trim() &&
          product.size.trim() &&
          product.quantity > 0 &&
          product.rate > 0
      );

      // Calculate totals
      const totals = calculateTotals();

      // Prepare invoice data
      const invoiceData = {
        partyDetails: partyInfo, // Include this
        invoiceNumber,
        invoiceDate,
        state,
        products: filteredProducts,
        cgstRate,
        sgstRate,
        igstRate,
        totals,
      };

      // Save the invoice to Firestore
      await addDoc(collection(db, 'GSTInvoices'), invoiceData);

      // Generate the PDF using ReactPDF
      const pdfBlob = await ReactPDF.pdf(<InvoicePrint invoiceData={invoiceData} />).toBlob();

      // Create a downloadable file for the user
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `Invoice-${invoiceData.invoiceNumber}.pdf`;
      link.click();

      alert('Invoice saved successfully and downloaded!');
    } catch (error) {
      console.error('Error saving or printing invoice:', error);
      alert('Failed to save or print the invoice. Please try again.');
    }
  };

  const totals = calculateTotals();
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '900px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f9f9f9',
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
    },
    input: {
      width: '80%',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '20px',
    },
    tableHeader: {
      backgroundColor: '#007bff',
      color: 'white',
    },
    tableCell: {
      border: '1px solid #ddd',
      padding: '8px',
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      marginTop: '10px',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Purchase Invoice Generator</h1>
      {/* Invoice details */}
      <label style={styles.label}>Invoice Number</label>
      <input type="text" value={invoiceNumber} readOnly style={styles.input} />
      <label style={styles.label}>Invoice Date</label>
      <input
        type="date"
        value={invoiceDate}
        onChange={(e) => setInvoiceDate(e.target.value)}
        style={styles.input}
      />
      <label style={styles.label}>State</label>
      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
        style={styles.input}
      />
      {/* Party details */}
      <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Party Details</label>
<input
  type="text"
  placeholder="Party Name"
  value={partyInfo.name}
  onChange={(e) => handlePartyChange('name', e.target.value)}
  onKeyDown={handlePartyKeyDown}
  onBlur={handlePartyBlur}
  style={{
    marginBottom: '10px',
    padding: '8px',
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  }}
/>
{showPartySuggestions && partySuggestions.length > 0 && (
  <ul
    style={{
      listStyle: 'none',
      margin: 0,
      padding: 0,
      position: 'absolute',
      zIndex: 10,
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      width: '100%',
      maxHeight: '150px',
      overflowY: 'auto',
    }}
  >
    {partySuggestions.map((party, idx) => (
      <li
        key={party.id}
        onClick={() => handleSelectParty(party)}
        style={{
          padding: '10px',
          cursor: 'pointer',
          backgroundColor: idx === activePartySuggestion ? '#f0f0f0' : 'transparent',
        }}
      >
        {party.name} - {party.address}
      </li>
    ))}
  </ul>
)}
<input
  type="text"
  placeholder="Address"
  value={partyInfo.address}
  onChange={(e) => handlePartyChange('address', e.target.value)}
  style={{
    marginBottom: '10px',
    padding: '8px',
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  }}
/>
<input
  type="text"
  placeholder="GSTIN"
  value={partyInfo.gstin}
  onChange={(e) => handlePartyChange('gstin', e.target.value)}
  style={{
    marginBottom: '10px',
    padding: '8px',
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  }}
/>

      {/* Products Table */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.tableCell}>Product Name</th>
            <th style={styles.tableCell}>Size</th>
            <th style={styles.tableCell}>Quantity</th>
            <th style={styles.tableCell}>Rate</th>
            <th style={styles.tableCell}>Amount</th>
            <th style={styles.tableCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td style={styles.tableCell}>
              <input
  type="text"
  value={product.name}
  onChange={(e) => handleProductChange(index, 'name', e.target.value)}
  onBlur={(e) => handleProductChange(index, 'name', e.target.value)} // Automatically fetch by code on blur
  onKeyDown={(e) => handleKeyDown(e, index)} // Handle keyboard navigation
  style={styles.input}
/>
{suggestions.length > 0 && (
  <ul style={styles.dropdown}>
    {suggestions.map((prod, idx) => (
      <li
        key={prod.id}
        onClick={() => {
          const updatedProducts = [...products];
          updatedProducts[index].name = prod.productName;
          setProducts(updatedProducts);

          setSuggestions([]);
        }}
        style={{
          ...styles.dropdownItem,
          backgroundColor: idx === activeSuggestion ? "#f0f0f0" : "transparent",
        }}
      >
        {prod.productName} ({prod.productCode})
      </li>
    ))}
  </ul>
)}



              </td>
              <td style={styles.tableCell}>
                <input
                  type="text"
                  value={product.size}
                  onChange={(e) => handleProductChange(index, 'size', e.target.value)}
                  style={styles.input}
                />
              </td>
              <td style={styles.tableCell}>
                <input
                  type="number"
                  value={product.quantity}
                  onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                  style={styles.input}
                />
              </td>
              <td style={styles.tableCell}>
                <input
                  type="number"
                  value={product.rate}
                  onChange={(e) => handleProductChange(index, 'rate', e.target.value)}
                  style={styles.input}
                />
              </td>
              <td style={styles.tableCell}>{product.amount.toFixed(2)}</td>
              <td style={styles.tableCell}>
                <button onClick={() => handleRemoveProduct(index)} style={styles.button}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddProduct} style={styles.button}>
        Add Product
      </button>
      {/* Tax section */}
      <div>
        <label style={styles.label}>CGST (%)</label>
        <input
          type="number"
          value={cgstRate}
          onChange={(e) => setCgstRate(Number(e.target.value))}
          style={styles.input}
        />
        <label style={styles.label}>SGST (%)</label>
        <input
          type="number"
          value={sgstRate}
          onChange={(e) => setSgstRate(Number(e.target.value))}
          style={styles.input}
        />
        <label style={styles.label}>IGST (%)</label>
        <input
          type="number"
          value={igstRate}
          onChange={(e) => setIgstRate(Number(e.target.value))}
          style={styles.input}
        />
      </div>
      {/* Totals */}
      <div>
        <p>Total Quantity: {totals.totalQuantity}</p>
        <p>Total Amount: ₹{totals.totalAmount.toFixed(2)}</p>
        <p>CGST: ₹{totals.cgst.toFixed(2)}</p>
        <p>SGST: ₹{totals.sgst.toFixed(2)}</p>
        <p>IGST: ₹{totals.igst.toFixed(2)}</p>
        <p>Total Tax: ₹{totals.totalTax.toFixed(2)}</p>
        <h3>Grand Total: ₹{totals.grandTotal.toFixed(2)}</h3>
      </div>
      <button onClick={handleSaveInvoice} style={styles.button}>
        Save Invoice
      </button>
    </div>
  );
};

export default GSTGenerator;