import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAYAB_i2AUCVUCimTbC_rNLdFTUzk-m8Qo",
  authDomain: "flashcard-app-c7baa.firebaseapp.com",
  projectId: "flashcard-app-c7baa",
  storageBucket: "flashcard-app-c7baa.firebasestorage.app",
  messagingSenderId: "665344556850",
  appId: "1:665344556850:web:029bd6ac7d9620103ba12b",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
