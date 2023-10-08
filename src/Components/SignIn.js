import React, {useState,useEffect} from 'react';
import {auth,firestore} from '../firebase';
import firebase from 'firebase/compat/app';
import {doc,setDoc,query,collection,onSnapshot,where} from "firebase/firestore";

function SignIn() {
  const [users, setUsers] = useState('')
  useEffect (() => {
    onSnapshot(query(collection(firestore, `/users`)), (snapshot) => {
      setUsers(snapshot.docs.map(doc => (doc.data())))
    });
  }, [])

  console.log(users)

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const usersRef = firestore.collection('users');

    auth.signInWithPopup(provider).then(async (result) => {
      usersRef.doc(result.user.uid).set({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: result.user.uid,
        email: result.user.email
      })
      // setDoc(doc(db, "users", userCredential.user.uid), {
      //   id: userCredential.user.uid,
      //   email: email,
      //   username: username,
      //   profile_pic: selectedPic,
      //   profile_pic_url: selectedPicUrl,
      //   createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      // })
    })
  }

  return (
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

export default SignIn;
