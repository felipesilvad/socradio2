import React, { useRef, useState,useEffect } from 'react';
import { auth, db, subscriptions } from '../../supabase';
import ChatMessage from './ChatMessage';
import {Button,Form} from 'react-bootstrap';
import { BsSendFill } from 'react-icons/bs';
import MessageLoad from './MessageLoad';

function ChatRoom({user,rate,station}) {
  const now = new Date()
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState('');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const messageData = await db.getMessages(15);
        setMessages(messageData);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const messageSubscription = subscriptions.subscribeToMessages((payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages(prev => [payload.new, ...prev].slice(0, 15));
      }
    });

    return () => {
      messageSubscription.unsubscribe();
    };
  }, []);

  const sendMessage = async (e) => {
    setLoading(true);
    e.preventDefault();

    const { user: currentUser } = await auth.currentUser();
    
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      await db.addMessage({
        text: formValue,
        uid: currentUser.id,
      });

      if (formValue.startsWith("!rate")) {
        const value = formValue.split("!rate")[1];
        rate(parseInt(value), currentUser.id);
      }

      setFormValue('');
      chatScrool();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  }

  function compare( a, b ) {
    if ( new Date(a.createdAt) < new Date(b.createdAt)){
      return -1;
    }
    if ( new Date(a.createdAt) > new Date(b.createdAt)){
      return 1;
    }
    return 0;
  }
  
  return (
    <div>
      <div className='chat-messages-div' id='chat-messages-div'>
        <div>
          {messages && messages
          .filter((msg) => (msg.createdAt && (new Date(msg.createdAt).getTime())) >= now-100000000)
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