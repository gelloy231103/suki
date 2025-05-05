import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDWKEqNYbGkWtioI-cSmcZ_Vqc_Pcspenk",
  authDomain: "reviewcenter-99dd5.firebaseapp.com",
  projectId: "reviewcenter-99dd5",
  storageBucket: "reviewcenter-99dd5.firebasestorage.app",
  messagingSenderId: "1000293189591",
  appId: "1:1000293189591:web:ef2f2f4389ef9dba83ad92",
  measurementId: "G-HW4LE792YF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();