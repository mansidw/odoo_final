// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHZ4VdrdjNNg2i79i2YdC6k8c5Nuqxfpo",
  authDomain: "odoo-8561e.firebaseapp.com",
  projectId: "odoo-8561e",
  storageBucket: "odoo-8561e.appspot.com",
  messagingSenderId: "557258926896",
  appId: "1:557258926896:web:53734436e79a8c28c2f6f5",
  measurementId: "G-NPGZH25LVG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
