import React from 'react';
import {auth} from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';


function ChatMessage(props) {
  const [user] = useAuthState(auth);

  const { text, uid, photoURL } = props.message;

  
  return (<>
    <div className={`message ${user ?(uid === auth.currentUser.uid ? 'sent' : 'received') : 'received'}`}>
      {/* <img className='profile-img' src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} /> */}
      <p>{text}</p>
    </div>
  </>)
}


export default ChatMessage;