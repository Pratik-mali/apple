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
    <div>
      <h2>Product List</h2>
      {products.length > 0 ? (
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
      ) : (
        <p>No products added yet.</p>
      )}
    </div>
  );
};

// Styles for the table and other elements
const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    fontFamily: "Arial, sans-serif",
  },
  headerRow: {
    backgroundColor: "#f4f4f4",
  },
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
    fontWeight: "bold",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  },
  row: {
    backgroundColor: "#fff",
  },
  deleteButton: {
    padding: "5px 10px",
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ProductList;
