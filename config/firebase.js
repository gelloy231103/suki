import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage'; 




// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCYCCIjHqHPUrCFCdVAA6LsIC9RpMfMueY",
  authDomain: "suki-85b44.firebaseapp.com",
  projectId: "suki-85b44",
  storageBucket: "suki-85b44.firebasestorage.app",
  messagingSenderId: "851872082143",
  appId: "1:851872082143:web:e03a1d7e2cab0b9713e16a",
  measurementId: "G-T7Q69C7WWQ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 
const storage = getStorage(app);

export { auth, db, storage }; // Export both auth and db