import React, {useRef, useState, useEffect} from 'react';
import ChatRoom from './Chat/ChatRoom';
import AudioPlayerComponent from './AudioPlayer/AudioPlayerComponent';
import {firestore} from '../firebase';
import firebase from 'firebase/compat/app';

function StationComponent({user,station}) {
  const [currentSongIndex, setCurrentSongIndex] = useState();
  const [playlist, setPlaylist] = useState();
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
    
  console.log(playlist)

  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // const setCurrentSongFromDB = (songID) => {
  //   onSnapshot(doc(firestore, "/songs/", songID), (doc) => {
  //     setCurrentSong(doc.data());
  //   });
  // }

  const setCurrentSongFromAPI = async () => {
    const response = await fetch(`http://3.129.87.85:8000/currentSong${station}`)
    const song = await response.json();
    setCurrentSongIndex(song.index)

    const now = new Date().getTime()
    const seconds = now / 1000
    handleSeek(seconds-song.startTime)
  }


  const onEndedSong = () => {
    if (currentSongIndex+1===playlist.length) {
      setCurrentSongIndex(0)
    } else {
      setCurrentSongIndex(i => i + 1)
    }
    // setCurrentSongFromAPI()
  }

  const setPlaylistSongFromAPI = async () => {
    const response = await fetch(`http://3.129.87.85:8000/playlist${station}`)
    const playlist = await response.json();
    setPlaylist(playlist)
  }

  useEffect(() => {
    setPlaylistSongFromAPI()
  }, [])

  useEffect(() => {
    setCurrentSongFromAPI()
  }, [playlist])

  // BOT MESSAGE 

  const sendBotMessage = (txt) => {
    firestore.collection('messages').add({
      text: txt,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      bot: true,
      uid: "Abr91NqhIRagi2UygmUZpehKnM52"
    })
  }

  // RATINGS

  const ratingsRef = firestore.collection('ratings');
  const [updateRating, setUpdateRating] = useState(false);


  const rate = (newRating) => {
    if (newRating > 0 && newRating < 6) {
      ratingsRef.doc(playlist[currentSongIndex].id).collection("ratings").doc(user.uid).set({
        ratings: newRating,
      }, {merge: true})
      setUpdateRating(!updateRating)
    } else {
      sendBotMessage("Rating needs to be between 0 and 5")
      // console.log("Rating needs to be between 0 and 5")
    }
  };

  return (
    <>
      <AudioPlayerComponent playlist={playlist} currentSongIndex={currentSongIndex} updateRating={updateRating}
      audioRef={audioRef} user={user} onEndedSong={onEndedSong} currentTime={currentTime} setCurrentTime={setCurrentTime} />
      <ChatRoom user={user} rate={rate} />
    </>
  );
}

export default StationComponent;