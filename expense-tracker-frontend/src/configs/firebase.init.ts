import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyBlTGA686YPV0hZe5TwxF4CdCgDyLxEPDM",
  authDomain: "expense-tracking-a7454.firebaseapp.com",
  projectId: "expense-tracking-a7454",
  storageBucket: "expense-tracking-a7454.firebasestorage.app",
  messagingSenderId: "136148128824",
  appId: "1:136148128824:web:1e5d3154f7afbe4b1882cd",
  measurementId: "G-BEHCJ5PWX3"
};

export const firebaseApp = initializeApp(firebaseConfig);
