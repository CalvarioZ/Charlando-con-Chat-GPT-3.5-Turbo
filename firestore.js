import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC0hcYZhLdRgtWB0LH_E0mlzlkierBzQoE",
    authDomain: "bbdd-c1af4.firebaseapp.com",
    databaseURL: "https://bbdd-c1af4-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bbdd-c1af4",
    storageBucket: "bbdd-c1af4.appspot.com",
    messagingSenderId: "226836990404",
    appId: "1:226836990404:web:8cb1dbbca6311efeba7c91",
    measurementId: "G-N0Q6PB7WLC"
};
const dispositivo = navigator.platform;
var dispositivoID = navigator.userAgent;
const time = new Date(); 
// Initialize Firebase

  const app = initializeApp(firebaseConfig);
  const db = getFirestore();
  
export const saveTask = (callUser, callResp, idCall) => {
addDoc(collection(db, 'Registro'), {time, callUser, callResp, dispositivo, dispositivoID, idCall})}
