import React, { useState } from "react";

const AddProduct = ({ onAddProduct }) => {
  const [productName, setProductName] = useState("");
  const [productUnit, setProductUnit] = useState("");
  const [productCode, setProductCode] = useState("");
  const [transliteratedName, setTransliteratedName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = { productName, productUnit, productCode, transliteratedName };
    onAddProduct(newProduct);
    setProductName("");
    setProductUnit("");
    setProductCode("");
    setTransliteratedName("");
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Add Product</h2>
      <input
        type="text"
        placeholder="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Product Unit"
        value={productUnit}
        onChange={(e) => setProductUnit(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Product Code"
        value={productCode}
        onChange={(e) => setProductCode(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Transliterated Name"
        value={transliteratedName}
        onChange={(e) => setTransliteratedName(e.target.value)}
        required
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        Add Product
      </button>
    </form>
  );
};

const styles = {
  form: { display: "flex", flexDirection: "column", marginBottom: "20px" },
  input: { margin: "10px 0", padding: "10px", fontSize: "16px" },
  button: { padding: "10px", fontSize: "16px", cursor: "pointer" },
};

export default AddProduct;
