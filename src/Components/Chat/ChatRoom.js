import React, { useRef, useState } from 'react';
import { auth, firestore} from '../../firebase';
import ChatMessage from './ChatMessage';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/compat/app';
import {Button,Form} from 'react-bootstrap';
import { BsSendFill } from 'react-icons/bs';

function ChatRoom({user,rate}) {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
    })

    if (formValue.startsWith("!rate")) {
      const value = formValue.split("!rate")[1]
      rate(parseInt(value))
    }

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }
  
  return (
    <div>
      <div className='chat-messages-div'>
        <div>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} bot={msg.bot} />)}
          <span ref={dummy}></span>
        </div>
      </div>
      {user ? (
        <Form onSubmit={sendMessage} className='send-message'>
        <Form.Control value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send a message" />
        <Button type="submit" className='send-btn' disabled={!formValue}>
          <BsSendFill className='mb-1' />
        </Button>
      </Form>
      )
       : <div className='sign-to-message'>
        You need to Sign In to send messages
      </div>}
    </div>
  )
}

export default ChatRoom;