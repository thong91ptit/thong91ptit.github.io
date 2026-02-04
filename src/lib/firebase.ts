import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAovjoipIFJJg6DeTVPhEiNCIahLmsD2hg",
  authDomain: "tiemlomo.firebaseapp.com",
  projectId: "tiemlomo",
  storageBucket: "tiemlomo.firebasestorage.app",
  messagingSenderId: "683713235528",
  appId: "1:683713235528:web:325be7b6bb49057b4d667d",
  measurementId: "G-ZJXCRKJ6EF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);