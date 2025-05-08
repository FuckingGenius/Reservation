// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBnYD9DPcPrGsTYuwFxz_Y_DFH7BYM2ojo",
  authDomain: "reservation-test-5299c.firebaseapp.com",
  projectId: "reservation-test-5299c",
  storageBucket: "reservation-test-5299c.firebasestorage.app",
  messagingSenderId: "349225491365",
  appId: "1:349225491365:web:41b0cfc85cd381866ce64c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);