import React, { useRef, useState,useEffect } from 'react';
import { auth, firestore} from '../../firebase';
import ChatMessage from './ChatMessage';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/compat/app';
import {Button,Form} from 'react-bootstrap';
import { BsSendFill } from 'react-icons/bs';
import MessageLoad from './MessageLoad';

function ChatRoom({user,rate,station}) {
  const now = new Date()
  const messagesRef = firestore.collection('messages');

  // const query = messagesRef.orderBy('createdAt');
  const query = messagesRef.orderBy('createdAt', "desc").limit(15);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const chatScrool = () => {
    var objDiv = document.getElementById("chat-messages-div");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  useEffect (() => {
    chatScrool()
  }, [])

  useEffect (() => {
    chatScrool()
  }, [station])

  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    setLoading(true)
    e.preventDefault();

    const { uid } = auth.currentUser;

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
    setLoading(false)
    chatScrool()
  }

  function compare( a, b ) {
    if ( a.createdAt< b.createdAt){
      return -1;
    }
    if ( a.createdAt> b.createdAt){
      return 1;
    }
    return 0;
  }
  
  return (
    <div>
      <div className='chat-messages-div' id='chat-messages-div'>
        <div>
          {messages && messages
          .filter((msg) => (msg.createdAt&&(msg.createdAt.seconds*1000)) >= now-100000000)
          .sort(compare)
          .map(msg => <ChatMessage key={msg.id} message={msg} createdAt={msg.createdAt} bot={msg.bot} />)}
        </div>
      </div>
      {user ? (
        <Form onSubmit={sendMessage} className='send-message'>
          {loading?(
            <MessageLoad />
          ) : (
            <>
              <Form.Control maxlength="200" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send a message" />
              <Button type="submit" className='send-btn' disabled={!formValue}>
                <BsSendFill className='mb-1' />
              </Button>
            </>
          )}
          
        </Form>
      ):(
        <div className='sign-to-message'>
          <Form.Control disabled placeholder="You need to Sign In to send messages" />
        </div>
      )}
    </div>
  )
}

export default ChatRoom;