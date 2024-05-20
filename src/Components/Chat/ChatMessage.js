import React, {useState, useEffect} from 'react';
import {auth, firestore} from '../../firebase';
import { doc, onSnapshot } from "firebase/firestore";
import ChatMessagePP from './ChatMessagePP';
import { Image } from 'react-bootstrap';

function ChatMessage(props) {
  const { text, uid, idField, bot, createdAt, rating, rating_uid, song_title, song_cover } = props.message;

  const [userData, setUserData] = useState()
  const [userRatingData, setUserRatingData] = useState()

  useEffect(() => {
    onSnapshot(doc(firestore, "/users/", uid), (doc) => {
      setUserData(doc.data());
    });
    if (rating_uid) {
      onSnapshot(doc(firestore, "/users/", rating_uid), (doc) => {
        setUserRatingData(doc.data());
      })
    }
  }, []);



  function secondsToHms(x) {
    const myDate = new Date(x.seconds * 1000);
    return myDate.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
  }
  
  if (bot) {
    if (rating) {
      return (
        <div key={idField} className='chat-message-bot d-flex align-items-center justify-content-center h-100'>
    
          {/* {userData&&(<ChatMessagePP id={userData.profilePic} />)}
    
            <b className='messages-username m-1' style={{color: `${userData&&(userData.color&&(userData.color))}`}}>
              {userData&&(userData.username&&(userData.username))}:
            </b>
          */}
          <a className='message-text'>
            {userRatingData&&(userRatingData.username)}
            {` Rated: `}
            <Image className='rate-cover-img' src={song_cover} />
            {song_title&&(song_title)}
            <b>
              {` ${rating}⭐`}
            </b>
          </a>
        </div>
      )
    } else {
      return (
        <div key={idField} className='chat-message-bot d-flex align-items-center justify-content-center h-100'>
          <a className='message-text text-uppercase'>{text}</a>
        </div>
      )
    }
  } else {
    return (
      <div key={idField} className='chat-message d-flex justify-content-between'>
        <div className='d-flex'>
          <div>
            {userData&&(<ChatMessagePP id={userData.profilePic} />)}
          </div>
          <div>
            <b className='messages-username m-1' style={{color: `${userData&&(userData.color&&(userData.color))}`}}>
              {userData&&(userData.username&&(userData.username))}:
            </b>
            <a className='message-text'>{text}</a>
          </div>
        </div>

        <div className='chat-message__time'>
          {secondsToHms(createdAt)}
        </div>
      </div>
    )
  }
  
}


export default ChatMessage;