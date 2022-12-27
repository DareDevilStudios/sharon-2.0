// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNkPtLvtZoLSGeOIr7g9qA-1-of9y3XhA",
  authDomain: "linkedin-clone-9c18c.firebaseapp.com",
  databaseURL: "https://linkedin-clone-9c18c-default-rtdb.firebaseio.com",
  projectId: "linkedin-clone-9c18c",
  storageBucket: "linkedin-clone-9c18c.appspot.com",
  messagingSenderId: "433598441071",
  appId: "1:433598441071:web:e7a6e88c4839191e96cf9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);