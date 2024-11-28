import React from "react";

const Navbar = () => {
  return (
    <div style={styles.navbar}>
      <h1 style={styles.title}>Inventory Management System</h1>
      <button style={styles.logoutButton}>Logout</button>
    </div>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#343a40",
    color: "#fff",
    padding: "10px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "24px",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "5px",
  },
};

export default Navbar;
