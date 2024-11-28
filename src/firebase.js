// Import the required functions from Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcySZdrTDEcA5jgfytV5vcRvUU8VcmQ6s",
  authDomain: "billing-32e93.firebaseapp.com",
  projectId: "billing-32e93",
  storageBucket: "billing-32e93.appspot.com",
  messagingSenderId: "206260275697",
  appId: "1:206260275697:web:8d6cb58c53bb45eda29c50",
  measurementId: "G-SFYNZEBG1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app); // Firestore Database
export const auth = getAuth(app); // Firebase Authentication
export const analytics = getAnalytics(app); // Firebase Analytics
