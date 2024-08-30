// firebase-config.js
// Your web app's Firebase configuration
const { initializeApp } = require('firebase/app');


const firebaseConfig = {

    apiKey: "AIzaSyAgSNLgxsqFDTIoOsoMtn-Fm-7T3ixdfiE",
  
    authDomain: "manitou-a2370.firebaseapp.com",
  
    databaseURL: "https://manitou-a2370-default-rtdb.europe-west1.firebasedatabase.app",
  
    projectId: "manitou-a2370",
  
    storageBucket: "manitou-a2370.appspot.com",
  
    messagingSenderId: "510602875968",
  
    appId: "1:510602875968:web:d475699a18cc65c687bba5"
  
  };
  
 // Initialize Firebase
const app = initializeApp(firebaseConfig);

module.exports = { app, firebaseConfig };
