import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDrwJRELP1mw91T3rXQ0e39x1H45FroxaQ",
    authDomain: "event-platform-pepe.firebaseapp.com",
    projectId: "event-platform-pepe",
    storageBucket: "event-platform-pepe.firebasestorage.app",
    messagingSenderId: "863431556559",
    appId: "1:863431556559:web:fed917f9eba024797126ba"
  };


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;



// <script type="module">
//   // Import the functions you need from the SDKs you need
//   import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
//   // TODO: Add SDKs for Firebase products that you want to use
//   // https://firebase.google.com/docs/web/setup#available-libraries

//   // Your web app's Firebase configuration
//   const firebaseConfig = {
//     apiKey: "AIzaSyDrwJRELP1mw91T3rXQ0e39x1H45FroxaQ",
//     authDomain: "event-platform-pepe.firebaseapp.com",
//     projectId: "event-platform-pepe",
//     storageBucket: "event-platform-pepe.firebasestorage.app",
//     messagingSenderId: "863431556559",
//     appId: "1:863431556559:web:fed917f9eba024797126ba"
//   };

//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);
// </script>