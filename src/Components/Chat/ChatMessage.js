import React, {useState, useEffect} from 'react';
import {db} from '../../supabase';
import ChatMessagePP from './ChatMessagePP';
import { Image } from 'react-bootstrap';

function ChatMessage(props) {
  const { text, uid, idField, bot, createdAt, rating, rating_uid, song_title, song_cover } = props.message;

  const [userData, setUserData] = useState()
  const [userRatingData, setUserRatingData] = useState()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await db.getUser(uid);
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    if (rating_uid) {
      const fetchRatingUserData = async () => {
        try {
          const data = await db.getUser(rating_uid);
          setUserRatingData(data);
        } catch (error) {
          console.error('Error fetching rating user data:', error);
        }
      };

      fetchRatingUserData();
    }
  }, [uid, rating_uid]);

  function secondsToHms(x) {
    const myDate = new Date(x);
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
          <span className='message-text' role="button" tabIndex={0} onClick={(e) => e.preventDefault()}>
            {userRatingData&&(userRatingData.username)}
            {` Rated: `}
            <Image className='rate-cover-img' src={song_cover} />
            {song_title&&(song_title)}
            <b>
              {` ${rating}⭐`}
            </b>
          </span>
        </div>
      )
    } else {
      return (
        <div key={idField} className='chat-message-bot d-flex align-items-center justify-content-center h-100'>
          <span className='message-text text-uppercase' role="button" tabIndex={0} onClick={(e) => e.preventDefault()}>{text}</span>
          <span className='message-text text-uppercase'>{text}</span>
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
            <span className='message-text' role="button" tabIndex={0}>{text}</span>
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