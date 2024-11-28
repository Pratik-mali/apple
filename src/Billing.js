import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  query, where
} from "firebase/firestore";
import {  getDoc } from "firebase/firestore";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF"; // Path to your InvoicePDF component
import { saveAs } from "file-saver"; // For downloading the file


const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [highlightedCustomerIndex, setHighlightedCustomerIndex] = useState(-1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [highlightedProductIndex, setHighlightedProductIndex] = useState(-1);
  const [formFields, setFormFields] = useState([
    { productName: "", price: "", quantity: "", discount: "" },
  ]);
  const [paidAmount, setPaidAmount] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [contactNumber, setContactNumber] = useState("");
const [address, setAddress] = useState("");
const [outstandingAmount, setOutstandingAmount] = useState(0); // Renamed variable


  const inputRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      const invoicesSnapshot = await getDocs(collection(db, "invoices"));
      const customersFromInvoices = invoicesSnapshot.docs.map((doc) => {
        const invoiceData = doc.data();
        return {
          id: doc.id,
          name: invoiceData.customer.name,  // Assuming the invoice contains a customer object with a name field
        };
      });
      setCustomers(customersFromInvoices);
    
      const productsSnapshot = await getDocs(collection(db, "products"));
      setProducts(productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    

    fetchData();
  }, []);


  const handleCustomerInput = async (e) => {
    const value = e.target.value;
    setSelectedCustomer(value);
  
    // Filter locally for customer suggestions
    const matches = customers.filter((customer) =>
      customer.name.toLowerCase().includes(value.toLowerCase())
    );
  
    const uniqueMatches = Array.from(
      new Set(matches.map((customer) => customer.name.toLowerCase()))
    ).map((name) =>
      matches.find((customer) => customer.name.toLowerCase() === name)
    );
  
    setFilteredCustomers(uniqueMatches);
    setHighlightedCustomerIndex(-1);
    setIsNewCustomer(uniqueMatches.length === 0 && value.trim() !== "");
  
    if (uniqueMatches.length === 1) {
      // Only one match locally, fetch additional data from Firestore
      const selectedCustomer = uniqueMatches[0];
      try {
        const invoicesRef = collection(db, "invoices");
        const q = query(invoicesRef, where("customer.name", "==", selectedCustomer.name));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const invoiceDoc = querySnapshot.docs[0];
          const invoiceData = invoiceDoc.data();
        
          const customer = invoiceData.customer || {};
          let totalDueAmount = 0;
        
          // Sum dueAmount from all matching invoices
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            totalDueAmount += data.totals?.dueAmount || 0; // Sum dueAmount correctly
          });
        
          // Set the customer info and total due amount
          setContactNumber(customer.contactNumber || "");
          setAddress(customer.address || "");
          setOutstandingAmount(totalDueAmount); // Set the correct totalDueAmount
          setIsNewCustomer(false);
        }
         else {
          // Reset state for unmatched customer
          setContactNumber("");
          setAddress("");
          setOutstandingAmount(0);
          setIsNewCustomer(true);
        }
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    } else {
      // Reset data for new or ambiguous input
      setContactNumber("");
      setAddress("");
      setOutstandingAmount(0);
    }
  };
  
  
  
  const handleCustomerKeyDown = async (e) => {
    if (e.key === "ArrowDown") {
      setHighlightedCustomerIndex((prev) =>
        Math.min(prev + 1, filteredCustomers.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedCustomerIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault(); // Prevent default Enter behavior
  
      if (highlightedCustomerIndex >= 0 && filteredCustomers.length > 0) {
        const selectedCustomer = filteredCustomers[highlightedCustomerIndex];
  
        if (selectedCustomer && selectedCustomer.name) {
          setSelectedCustomer(selectedCustomer.name);
          setFilteredCustomers([]);
  
          try {
            // Query Firestore for the selected customer by name
            const invoicesRef = collection(db, "invoices");
            const q = query(invoicesRef, where("customer.name", "==", selectedCustomer.name));
            const querySnapshot = await getDocs(q);
  
            if (!querySnapshot.empty) {
              let totalDueAmount = 0;
  
              // Sum due amounts across all matching invoices
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                totalDueAmount += data.totals?.dueAmount || 0;
              });
  
              const customerData = querySnapshot.docs[0].data(); // Get data from the first matching document
              setContactNumber(customerData.customer?.contactNumber || "");
              setAddress(customerData.customer?.address || "");
              setOutstandingAmount(totalDueAmount); // Set total due amount
              setIsNewCustomer(false);
            } else {
              console.error("No matching customer found in Firestore!");
              setContactNumber("");
              setAddress("");
              setOutstandingAmount(0);
              setIsNewCustomer(true);
            }
          } catch (error) {
            console.error("Error fetching Firestore data:", error);
          }
        }
      }
  
      // Focus on the next input
      const formElements = Array.from(
        document.querySelectorAll("input, select, textarea, button")
      );
      const currentIndex = formElements.indexOf(document.activeElement);
      if (currentIndex !== -1 && currentIndex < formElements.length - 1) {
        formElements[currentIndex + 1].focus();
      }
    }
  };
  
  
  
  
  

  const handleProductInput = (index, value) => {
    setFocusedIndex(index); // Track which input field is focused
    const updatedFields = [...formFields];
    updatedFields[index].productName = value;
  
    const matches = products.filter((product) => {
      const productNameLower = product.productName.toLowerCase();
      const productCodeLower = product.productCode?.toLowerCase() || ""; // Assume `code` field exists in your product database
      const phoneticNameLower = product.transliteratedName?.toLowerCase() || ""; // Assume transliterated Marathi name
  
      return (
        productNameLower.includes(value.toLowerCase()) ||
        productCodeLower.includes(value.toLowerCase()) ||
        phoneticNameLower.includes(value.toLowerCase())
      );
    });
  
    setFilteredProducts(matches);
    setHighlightedProductIndex(-1);
    setFormFields(updatedFields);
  };
  
  const handleProductKeyDown = (e, index) => {
    if (e.key === "ArrowDown") {
      setHighlightedProductIndex((prev) =>
        Math.min(prev + 1, filteredProducts.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedProductIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedProductIndex >= 0) {
      handleProductSelection(index, filteredProducts[highlightedProductIndex]);
    } else if (e.key === "Escape") {
      setFilteredProducts([]); // Close suggestions
    }
  };
  
  const handleProductSelection = (index, product) => {
    const updatedFields = [...formFields];
    updatedFields[index].productName = product.productName;
    updatedFields[index].price = product.price; // Auto-fill price
    setFilteredProducts([]);
    setFormFields(updatedFields);
  };
  

  
  const handleStoreInvoice = async () => {
    try {
      // Prepare invoice data
      const invoiceData = {
        customer: {
          name: selectedCustomer,
          contactNumber,
          address,
          isNewCustomer,
        },
        products: formFields.map((field) => ({
          productName: field.productName,
          price: parseFloat(field.price) || 0,
          quantity: parseFloat(field.quantity) || 0,
          discount: parseFloat(field.discount) || 0,
          amount:
            (parseFloat(field.price) || 0) *
            (parseFloat(field.quantity) || 0) *
            (1 - (parseFloat(field.discount) || 0) / 100),
        })),
        totals: {
          totalAmount: total.totalAmount,
          totalDiscount: total.totalDiscount,
          finalAmount: total.finalAmount,
          paidAmount: parseFloat(paidAmount) || 0,
          dueAmount: dueAmount,
        },
        timestamp: new Date().toISOString(),
      };
  
      // Save invoice to Firestore
      const invoiceRef = await addDoc(collection(db, "invoices"), invoiceData);
  
      alert(`Invoice stored successfully with ID: ${invoiceRef.id}`);
  
      // Generate PDF
      const pdfDoc = pdf(<InvoicePDF invoiceData={invoiceData} />);
      const blob = await pdfDoc.toBlob();
  
      // Download the PDF
      saveAs(blob, `invoice_${invoiceRef.id}.pdf`);
    } catch (error) {
      console.error("Error storing invoice: ", error);
      alert("Failed to store invoice. Please try again.");
    }
  };
  
  useEffect(() => {
    // Check if the last row is fully filled
    const lastRow = formFields[formFields.length - 1];
    const isLastRowFilled =
      lastRow.productName &&
      lastRow.price &&
      lastRow.quantity &&
      lastRow.discount !== undefined;
  
    if (isLastRowFilled) {
      handleAddRow(); // Add a new row
    }
  }, [formFields]);
  

  

  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...formFields];
    updatedFields[index][field] = value;
    setFormFields(updatedFields);
  };

  const handleAddRow = useCallback(() => {
    setFormFields((prevFields) => [
      ...prevFields,
      { productName: "", price: "", quantity: "", discount: "" },
    ]);
  }, []); // No dependencies
  

  // Example useEffect using handleAddRow

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log("Handle Add Row is stable now!");
  }, [handleAddRow]);

  const handleKeyDown = (e, index, fieldIndex) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextFieldIndex = index * 4 + fieldIndex + 1; // Navigate all inputs
      const nextField = inputRefs.current[nextFieldIndex];
      nextField?.focus();
    }
  };

  const calculateTotal = () => {
    return formFields.reduce(
      (acc, field) => {
        const price = parseFloat(field.price) || 0;
        const quantity = parseFloat(field.quantity) || 0;
        const discount = parseFloat(field.discount) || 0;

        const amount = price * quantity;
        const discountAmount = (amount * discount) / 100;
        const finalAmount = amount - discountAmount;

        acc.totalAmount += amount;
        acc.totalDiscount += discountAmount;
        acc.finalAmount += finalAmount;

        return acc;
      },
      { totalAmount: 0, totalDiscount: 0, finalAmount: 0 }
    );
  };

  const total = calculateTotal();
  const dueAmount = total.finalAmount - parseFloat(paidAmount || 0);



  return (
    <div style={{ padding: "20px" }}>
      <h1>Billing</h1>

      {/* Customer Section */}
  {/* Customer Section */}
  <div>
  <h2>Customer</h2>
  {/* Customer Input */}
  <input
    type="text"
    placeholder="Enter customer name"
    value={selectedCustomer}
    onChange={handleCustomerInput}
    onKeyDown={handleCustomerKeyDown}
  />
  {filteredCustomers.length > 0 && (
    <ul>
      {filteredCustomers.map((customer, idx) => (
        <li
          key={customer.id}
          style={{
            backgroundColor: highlightedCustomerIndex === idx ? "#ddd" : "#fff",
          }}
          onClick={async () => {
            setSelectedCustomer(customer.name);
            setFilteredCustomers([]);

            // Use getDoc instead of getDocs
            const customerRef = doc(db, "customers", customer.id);
            const customerDoc = await getDoc(customerRef);

            if (customerDoc.exists()) {
              const customerData = customerDoc.data();
              setContactNumber(customerData.contactNumber || "");
              setAddress(customerData.address || "");
              dueAmount(customerData.dueAmount || 0); // Set due amount
            }
          }}
        >
          {customer.name}
        </li>
      ))}
    </ul>
  )}

  {/* Contact, Address, and Due Amount */}
  {selectedCustomer && (
    <div>
      {/* Contact Number */}
      <label>Contact Number: </label>
      <input
        type="text"
        value={contactNumber}
        onChange={(e) => setContactNumber(e.target.value)}
        placeholder="Enter contact number"
        disabled={!isNewCustomer} // Allow editing only for new customers
      />

      {/* Address */}
      <label>Address: </label>
      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter address"
        disabled={!isNewCustomer} // Allow editing only for new customers
      />

      {/* Due Amount */}
      {!isNewCustomer && (
        <div>
          <label>Due Amount: </label>
          <p>₹{outstandingAmount.toFixed(2)}</p>
        </div>
      )}
    </div>
  )}
</div>




      {/* Product Section */}
      <div>
        <h2>Products</h2>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Discount</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {formFields.map((field, index) => (
              <tr key={index}>
                <td>
  <input
    type="text"
    value={field.productName}
    onChange={(e) => handleProductInput(index, e.target.value)}
    onKeyDown={(e) => handleProductKeyDown(e, index)}
    ref={(el) => (inputRefs.current[index * 4] = el)}
  />
  {focusedIndex === index && filteredProducts.length > 0 && (
    <ul
      style={{
        border: "1px solid #ccc",
        padding: "5px",
        maxHeight: "150px",
        overflowY: "auto",
        position: "absolute",
        zIndex: 1,
        backgroundColor: "#fff",
        width: "200px",
      }}
    >
      {filteredProducts.map((product, idx) => (
        <li
          key={product.id}
          onClick={() => handleProductSelection(index, product)}
          style={{
            padding: "5px",
            backgroundColor: highlightedProductIndex === idx ? "#ddd" : "#fff",
            cursor: "pointer",
          }}
          onMouseEnter={() => setHighlightedProductIndex(idx)}
        >
          {product.productName}
        </li>
      ))}
    </ul>
  )}
</td>

                <td>
                  <input
                    type="number"
                    value={field.price}
                    onChange={(e) => handleFieldChange(index, "price", e.target.value)}
                    ref={(el) => (inputRefs.current[index * 4 + 1] = el)}
                    onKeyDown={(e) => handleKeyDown(e, index, 1)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={field.quantity}
                    onChange={(e) => handleFieldChange(index, "quantity", e.target.value)}
                    ref={(el) => (inputRefs.current[index * 4 + 2] = el)}
                    onKeyDown={(e) => handleKeyDown(e, index, 2)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={field.discount}
                    onChange={(e) => handleFieldChange(index, "discount", e.target.value)}
                    ref={(el) => (inputRefs.current[index * 4 + 3] = el)}
                    onKeyDown={(e) => handleKeyDown(e, index, 3)}
                  />
                </td>
                <td>
  ₹
  {(
    (parseFloat(field.price) || 0) *
    (parseFloat(field.quantity) || 0) *
    (field.discount ? 1 - parseFloat(field.discount) / 100 : 1)
  ).toFixed(2)}
</td>

              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleAddRow}>Add Row</button>
      </div>

      {/* Total Section */}
      <div>
        <h2>Total</h2>
        <p>Total Amount: ₹{total.totalAmount.toFixed(2)}</p>
        <p>Total Discount: ₹{total.totalDiscount.toFixed(2)}</p>
        <p>Final Amount: ₹{total.finalAmount.toFixed(2)}</p>
        <input
          type="number"
          placeholder="Paid Amount"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
        />
        <p>Due Amount: ₹{dueAmount.toFixed(2)}</p>

        <button onClick={handleStoreInvoice}>Store Invoice</button>


        
        </div>
    </div>
  );
};

export default Billing;
