import React, {useState, useEffect} from 'react';
import {auth, firestore} from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot } from "firebase/firestore";


function ChatMessage(props) {
  const [user] = useAuthState(auth);
  const { text, uid, photoURL, idField } = props.message;

  const [userData, setUserData] = useState()
  useEffect(() => {
    onSnapshot(doc(firestore, "/users/", uid), (doc) => {
      setUserData(doc.data());
    });
  }, []);
  
  return (
  <div key={idField} className='chat-message d-flex align-items-center h-100'>
      <b className='messages-username m-1' style={{color: `${userData&&(userData.color&&(userData.color))}`}}>
        {userData&&(userData.username&&(userData.username))}:
      </b>
      {/* <div className={`message ${user ?(uid === auth.currentUser.uid ? 'sent' : 'received') : 'received'}`}> */}
        {/* <img className='profile-img' src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} /> */}
      <a className='message-text'>{text}</a>
      {/* </div> */}
  </div>)
}


export default ChatMessage;