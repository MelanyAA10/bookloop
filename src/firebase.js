// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Analytics no es necesario para login/registro
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA8GNKkFJETp-yyLod40gxRyKNfo81a_eI",
  authDomain: "bookloop-3732d.firebaseapp.com",
  projectId: "bookloop-3732d",
  storageBucket: "bookloop-3732d.firebasestorage.app",
  messagingSenderId: "99482595508",
  appId: "1:99482595508:web:30875fa8e9dc1e84b727e1",
  measurementId: "G-7KJDJLC69F"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Opcional, no lo ocupas por ahora
// export const analytics = getAnalytics(app);