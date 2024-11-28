import React, { useState, useEffect } from "react";
import AddProduct from "./AddProduct";
import ProductList from "./ProductList";
import { db } from "./firebase"; // Import your Firebase setup
import { collection, onSnapshot, addDoc } from "firebase/firestore";

const Inventory = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe; // Cleanup the listener
  }, []);

  const addProduct = async (product) => {
    try {
      await addDoc(collection(db, "products"), product);
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Inventory Management</h1>
      <AddProduct onAddProduct={addProduct} />
      <ProductList products={products} />
    </div>
  );
};

const styles = {
  container: { padding: "20px", maxWidth: "800px", margin: "auto" },
};

export default Inventory;
