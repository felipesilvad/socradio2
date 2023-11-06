// import { initializeApp } from "firebase/app";
// import { getFirestore } from 'firebase/firestore'
// import { getStorage } from "firebase/storage";
// import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';

firebase.initializeApp({
  "Private"
})

// const storage = getStorage(app);
// // const auth = getAuth(app);
// const analytics = getAnalytics(app);
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();
export {auth,firestore, analytics};
