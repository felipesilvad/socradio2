import React, {useState, useEffect} from 'react';
import {auth, firestore} from '../../firebase';
import { doc, onSnapshot } from "firebase/firestore";
import ChatMessagePP from './ChatMessagePP';

function ChatMessage(props) {
  const { text, uid, idField, bot } = props.message;

  const [userData, setUserData] = useState()
  useEffect(() => {
    onSnapshot(doc(firestore, "/users/", uid), (doc) => {
      setUserData(doc.data());
    });
  }, []);
  
  if (bot) {
    return (
      <div key={idField} className='chat-message-bot d-flex align-items-center justify-content-center h-100'>
  
        {/* {userData&&(<ChatMessagePP id={userData.profilePic} />)}
  
        <b className='messages-username m-1' style={{color: `${userData&&(userData.color&&(userData.color))}`}}>
          {userData&&(userData.username&&(userData.username))}:
        </b>
   */}
        <a className='message-text'>{text}</a>
      </div>
    )
  } else {
    return (
      <div key={idField} className='chat-message d-flex align-items-center h-100'>
  
        {userData&&(<ChatMessagePP id={userData.profilePic} />)}
  
        <b className='messages-username m-1' style={{color: `${userData&&(userData.color&&(userData.color))}`}}>
          {userData&&(userData.username&&(userData.username))}:
        </b>
  
        <a className='message-text'>{text}</a>
      </div>
    )
  }
  
}


export default ChatMessage;