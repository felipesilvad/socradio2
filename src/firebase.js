// import { initializeApp } from "firebase/app";
// import { getFirestore } from 'firebase/firestore'
// import { getStorage } from "firebase/storage";
// import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCrTOka75SikkOR4pNA2Da999x0QPBfdg4",
  authDomain: "soc-radio-f3953.firebaseapp.com",
  projectId: "soc-radio-f3953",
  storageBucket: "soc-radio-f3953.appspot.com",
  messagingSenderId: "533854826784",
  appId: "1:533854826784:web:87df494b5a2ecab4526745"
})

// const storage = getStorage(app);
// // const auth = getAuth(app);
// const analytics = getAnalytics(app);
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();
export {auth,firestore};