import React from "react";
import { doc, deleteDoc } from "firebase/firestore"; // Import Firestore methods
import { db } from "./firebase"; // Import your Firestore database instance

const ProductList = ({ products }) => {
  // Function to handle product deletion
  const handleDelete = async (productId) => {
    try {
      const productRef = doc(db, "products", productId); // Adjust collection path as needed
      await deleteDoc(productRef);
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete the product.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Product List</h2>
      {products.length > 0 ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Transliterated Name</th>
                <th style={styles.th}>Product Unit</th>
                <th style={styles.th}>Product Code</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={styles.row}>
                  <td style={styles.td}>{product.productName}</td>
                  <td style={styles.td}>{product.transliteratedName}</td>
                  <td style={styles.td}>{product.productUnit}</td>
                  <td style={styles.td}>{product.productCode}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={styles.noProducts}>No products added yet.</p>
      )}
    </div>
  );
};

// Optimized Styles
const styles = {
  container: {
    maxWidth: "100%",
    padding: "20px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    marginBottom: "10px",
    textAlign: "center",
    fontSize: "1.5rem",
    color: "#333",
  },
  tableContainer: {
    maxHeight: "300px", // Set max height for table
    overflowY: "auto", // Enable vertical scrolling
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed", // Fixed layout to prevent excessive width
  },
  headerRow: {
    backgroundColor: "#f4f4f4",
  },
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
    fontWeight: "bold",
    whiteSpace: "nowrap", // Prevent wrapping of header text
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
    whiteSpace: "nowrap", // Prevent wrapping of data text
    overflow: "hidden",
    textOverflow: "ellipsis", // Add ellipsis for overflowed text
  },
  row: {
    backgroundColor: "#fff",
    "&:hover": { backgroundColor: "#f9f9f9" }, // Hover effect for rows
  },
  deleteButton: {
    padding: "5px 10px",
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": { backgroundColor: "#ff1a1a" },
  },
  noProducts: {
    textAlign: "center",
    fontSize: "1rem",
    color: "#888",
    marginTop: "20px",
  },
};

export default ProductList;
