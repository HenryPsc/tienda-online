// firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAo325hrKgKqntm_dak8OvO8wmVR4WvrNA",
  authDomain: "pruebaimg-f6ce6.firebaseapp.com",
  projectId: "pruebaimg-f6ce6",
  storageBucket: "pruebaimg-f6ce6.firebasestorage.app",
  messagingSenderId: "924488543285",
  appId: "1:924488543285:web:29d84a314a168e206d157c"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };