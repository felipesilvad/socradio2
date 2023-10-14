import React, {useState, useEffect} from 'react';
import {auth, firestore} from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, onSnapshot } from "firebase/firestore";


function ChatMessage(props) {
  const [user] = useAuthState(auth);
  const { text, uid, photoURL } = props.message;

  const [userData, setUserData] = useState()
  useEffect(() => {
    onSnapshot(doc(firestore, "/users/", uid), (doc) => {
      setUserData(doc.data());
    });
  }, []);
  
  return (<>
    <p className='messages-username'>{userData.username&&(userData.username)}</p>
    <div className={`message ${user ?(uid === auth.currentUser.uid ? 'sent' : 'received') : 'received'}`}>
      {/* <img className='profile-img' src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} /> */}
      <p>{text}</p>
    </div>
  </>)
}


export default ChatMessage;