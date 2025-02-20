import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAHoxFtaZx4ONMVnOgCaxONwQj2EtRLQkE",
  authDomain: "scavengerhunt-f9285.firebaseapp.com",
  databaseURL: "https://scavengerhunt-f9285-default-rtdb.firebaseio.com",
  projectId: "scavengerhunt-f9285",
  storageBucket: "scavengerhunt-f9285.firebasestorage.app",
  messagingSenderId: "446853870903",
  appId: "1:446853870903:web:c4577f9727e588202816b2",
  measurementId: "G-GQH8YKYKBP"
};

// Initialize Firebase and export app instance
export const app = initializeApp(firebaseConfig);

// Initialize and export Realtime Database instance
export const database = getDatabase(app);
