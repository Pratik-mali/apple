import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import InvoiceList from "./InvoiceList";
import InvoiceDetails from "./InvoiceDetails";
import { AuthProvider, useAuth } from "./AuthContext";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/Login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/Login" />} />
          <Route path="/InvoiceList" element={<InvoiceList />} />
        <Route path="/invoice/:invoiceId" element={<InvoiceDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
