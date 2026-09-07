// src/firebase.js
// ─────────────────────────────────────────────────────────────
// Replace the values below with your Firebase project config.
// See SETUP.md for step-by-step instructions.
// ─────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDabQ6rSckwn567NXMYqGxvfsaUwfWJ8Mc",
  authDomain: "edgecloud-1c949.firebaseapp.com",
  databaseURL: "https://edgecloud-1c949-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "edgecloud-1c949",
  storageBucket: "edgecloud-1c949.firebasestorage.app",
  messagingSenderId: "604870028295",
  appId: "1:604870028295:web:8b8e5d1b58be5e4a948ea2",
  measurementId: "G-421V4913WV"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
