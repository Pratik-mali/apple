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
  const [selectedCustomer, setSelectedCustomer] = useState("Cash");
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
  const [contactNumber, setContactNumber] = useState("9665526332");
const [address, setAddress] = useState("Tulshi");
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

    // Send data to the PHP script
    const apiUrl = `https://tealy.in/d/store_invoice.php`;
    const queryParams = new URLSearchParams({
      contact_number: contactNumber,
      invoice_id: invoiceRef.id,
      api_key: "Happysoul8610",
    });
    
    const response = await fetch(`${apiUrl}?${queryParams}`);
    if (!response.ok) {
      throw new Error("Failed to send data to PHP script");
    }

    alert(`Invoice stored successfully with ID: ${invoiceRef.id}`);
    resetForm();

    // Generate PDF (rest of the code remains unchanged)
    const pdfDoc = pdf(<InvoicePDF invoiceData={invoiceData} />);
    const blob = await pdfDoc.toBlob();
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      const pdfUrl = URL.createObjectURL(blob);
      printWindow.document.write(`
        <html>
          <head><title>Print Invoice</title></head>
          <body style="margin: 0; padding: 0;">
            <iframe id="printFrame" 
                    src="${pdfUrl}" 
                    style="width:100%;height:100%;border:none;" 
                    frameborder="0">
            </iframe>
          </body>
        </html>
      `);
      printWindow.document.close();
      const iframe = printWindow.document.getElementById("printFrame");
      iframe.onload = () => {
        const iframeWindow = iframe.contentWindow || iframe;
        iframeWindow.onafterprint = () => {
          printWindow.close();
        };
        iframeWindow.focus();
        iframeWindow.print();
      };
    }
  } catch (error) {
    console.error("Error storing invoice: ", error);
    alert("Failed to store invoice. Please try again.");
  }
};

  
  
  const resetForm = () => {
    setFormFields([{ productName: "", price: "", quantity: "", discount: "" }]);
    setSelectedCustomer("Cash");
    setIsNewCustomer(false);
    setFilteredCustomers([]);
    setHighlightedCustomerIndex(-1);
    setFilteredProducts([]);
    setHighlightedProductIndex(-1);
    setPaidAmount("");
    setFocusedIndex(-1);
    setContactNumber("+91 96655 26332");
    setAddress("Tulshi");
    setOutstandingAmount(0);
    inputRefs.current = []; // Reset input references if used
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
  const handleEnterKeyPress = (event, index) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default behavior (e.g., form submission)
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
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
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

  const handleNextField = () => {
    if (currentFieldIndex + 1 < inputRefs.current.length) {
      setCurrentFieldIndex(currentFieldIndex + 1);
      inputRefs.current[currentFieldIndex + 1].focus();
    } else {
      alert("All fields completed!");
    }
  };
  

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f9fa",
        color: "#333",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Billing</h1>
  
      {/* Customer Section */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          marginBottom: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ marginBottom: "10px", borderBottom: "2px solid #ccc" }}>
          Customer
        </h2>
        <input
          type="text"
          placeholder="Enter customer name"
          value={selectedCustomer}
          onChange={handleCustomerInput}
          onKeyDown={handleCustomerKeyDown}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        {filteredCustomers.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              margin: "0",
              padding: "0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {filteredCustomers.map((customer, idx) => (
              <li
                key={customer.id}
                style={{
                  padding: "10px",
                  backgroundColor:
                    highlightedCustomerIndex === idx ? "#f1f1f1" : "#fff",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  setSelectedCustomer(customer.name);
                  setFilteredCustomers([]);
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
        {selectedCustomer && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>
                Contact Number:
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter contact number"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                disabled={!isNewCustomer}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>
                Address:
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  resize: "vertical",
                }}
                disabled={!isNewCustomer}
              />
            </div>
            {!isNewCustomer && (
              <div>
                <label style={{ fontWeight: "bold" }}>Due Amount:</label>
                <p style={{ fontSize: "18px", color: "#d9534f" }}>
                  ₹{outstandingAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
  
      {/* Product Section */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          marginBottom: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ marginBottom: "10px", borderBottom: "2px solid #ccc" }}>
          Products
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f1f1f1" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Product Name
              </th>
            
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Quantity
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Price</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Discount
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Amount</th>
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
    onKeyDown={(e) => {
      handleProductKeyDown(e, index);

      if (filteredProducts.length > 0) {
        if (e.key === "ArrowDown") {
          const nextIndex =
            (highlightedProductIndex + 1) % filteredProducts.length;
          setHighlightedProductIndex(nextIndex);
        } else if (e.key === "ArrowUp") {
          const prevIndex =
            (highlightedProductIndex - 1 + filteredProducts.length) %
            filteredProducts.length;
          setHighlightedProductIndex(prevIndex);
        } else if (e.key === "Enter") {
          handleProductSelection(index, filteredProducts[highlightedProductIndex]);
        }
      }
    }}
    onBlur={() => {
      // Auto-select product based on exact match with the entered product code
      const matchedProduct = filteredProducts.find(
        (product) => product.productCode === field.productName
      );
      if (matchedProduct) {
        handleProductSelection(index, matchedProduct);
      }
    }}
    ref={(el) => (inputRefs.current[index * 4] = el)}
    style={{
      width: "100%",
      padding: "5px",
      border: "1px solid #ccc",
      borderRadius: "4px",
    }}
  />
  {focusedIndex === index && filteredProducts.length > 0 && (
    <ul
      style={{
        position: "absolute",
        zIndex: 1,
        border: "1px solid #ccc",
        padding: "5px",
        maxHeight: "150px",
        overflowY: "auto",
        backgroundColor: "#fff",
        width: "200px",
        marginTop: "2px",
        listStyle: "none",
      }}
    >
      {filteredProducts.map((product, idx) => (
        <li
          key={product.id}
          onClick={() => handleProductSelection(index, product)}
          style={{
            padding: "5px",
            backgroundColor:
              highlightedProductIndex === idx ? "#ddd" : "#fff",
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



                
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <input
                    type="number"
                    value={field.quantity}
                    onChange={(e) =>
                      handleFieldChange(index, "quantity", e.target.value)
                    }
                    ref={(el) => (inputRefs.current[index * 4 + 2] = el)}
                    style={{
                      width: "100%",
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <input
                    type="number"
                    value={field.price}
                    onChange={(e) =>
                      handleFieldChange(index, "price", e.target.value)
                    }
                    ref={(el) => (inputRefs.current[index * 4 + 1] = el)}
                    style={{
                      width: "100%",
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <input
                    type="number"
                    value={field.discount}
                    onChange={(e) =>
                      handleFieldChange(index, "discount", e.target.value)
                    }
                    ref={(el) => (inputRefs.current[index * 4 + 3] = el)}
                    style={{
                      width: "100%",
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  ₹
                  {(
                    (parseFloat(field.price) || 0) *
                    (parseFloat(field.quantity) || 0) *
                    (field.discount
                      ? 1 - parseFloat(field.discount) / 100
                      : 1)
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={handleAddRow}
          style={{
            backgroundColor: "#5cb85c",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Row
        </button>
      </div>
  
      {/* Total Section */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ marginBottom: "10px", borderBottom: "2px solid #ccc" }}>
          Total
        </h2>
        <p>Total Amount: ₹{total.totalAmount.toFixed(2)}</p>
        <p>Total Discount: ₹{total.totalDiscount.toFixed(2)}</p>
        <p>Final Amount: ₹{total.finalAmount.toFixed(2)}</p>
        <input
          type="number"
          placeholder="Paid Amount"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <p>Due Amount: ₹{dueAmount.toFixed(2)}</p>
        <button
          onClick={handleStoreInvoice}
          style={{
            backgroundColor: "#0275d8",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Store Invoice
        </button>
      </div>
    </div>
  ); 
  
  
};

export default Billing;
