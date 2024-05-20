import React, {useRef, useState, useEffect} from 'react';
import ChatRoom from './Chat/ChatRoom';
import AudioPlayerComponent from './AudioPlayer/AudioPlayerComponent';
import {firestore} from '../firebase';
import { doc, onSnapshot, getDoc, collection} from "firebase/firestore";
import firebase from 'firebase/compat/app';
import Footer from './Footer'

function StationComponent({user,station}) {
  const [currentSongIndex, setCurrentSongIndex] = useState();
  const [playlist, setPlaylist] = useState();
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
    
  // console.log(playlist)

  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setCurrentSongFromDB = async () => {
    // onSnapshot(doc(firestore, `/${station}/currentSong`), (doc) => {
    //   setCurrentSongIndex(doc.data().currentSong.index)
    //   const now = new Date().getTime()
    //   const seconds = now / 1000
    //   handleSeek(seconds-doc.data().currentSong.startTime)
    // });
    getDoc(doc(collection(firestore, station), "currentSong"))
    .then(doc => {
      setCurrentSongIndex(doc.data().currentSong.index)
      const now = new Date().getTime()
      const seconds = now / 1000
      handleSeek(seconds-doc.data().currentSong.startTime)
    })
  }

  // const setCurrentSongFromAPI = async () => {
  //   const response = await fetch(`http://3.129.87.85:8000/currentSong${station}`)
  //   const song = await response.json();
  //   setCurrentSongIndex(song.index)

  //   const now = new Date().getTime()
  //   const seconds = now / 1000
  //   handleSeek(seconds-song.startTime)
  // }


  const onEndedSong = () => {
    if (currentSongIndex+1===playlist.length) {
      setCurrentSongIndex(0)
    } else {
      setCurrentSongIndex(i => i + 1)
    }
    // setCurrentSongFromAPI()
  }

  // const setPlaylistSongFromAPI = async () => {
  //   const response = await fetch(`http://3.129.87.85:8000/playlist${station}`)
  //   const playlist = await response.json();
  //   setPlaylist(playlist)
  // }

  const setPlaylistSongFromDB = async () => {
    onSnapshot(doc(firestore, `/${station}/currentPlaylist`), (doc) => {
      setPlaylist(doc.data().currentPlaylist)
    });
  }

  useEffect(() => {
    setPlaylistSongFromDB()
  }, [])

  useEffect(() => {
    setCurrentSongFromDB()
  }, [playlist])

  // BOT MESSAGE 

  const sendBotMessage = (txt, rating, uid, song_title, song_cover) => {
    firestore.collection('messages').add({
      text: txt,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      bot: true,
      uid: "Abr91NqhIRagi2UygmUZpehKnM52",
      rating: rating,
      rating_uid: uid,
      song_title: song_title,
      song_cover: song_cover,
    })
  }

  // RATINGS

  const ratingsRef = firestore.collection('ratings');
  const [updateRating, setUpdateRating] = useState(false);


  const rate = (newRating, uid) => {
    if (newRating > 0 && newRating < 6) {
      ratingsRef.doc(playlist[currentSongIndex].id).collection("ratings").doc(user.uid).set({
        ratings: newRating,
      }, {merge: true})
      setUpdateRating(!updateRating)
      sendBotMessage(`Rated`,newRating,uid,playlist[currentSongIndex].title,playlist[currentSongIndex].cover)
    } else {
      sendBotMessage("Rating needs to be between 0 and 5")
    }
  };

  return (
    <>
      <AudioPlayerComponent playlist={playlist} currentSongIndex={currentSongIndex} updateRating={updateRating} setCurrentSongFromDB={setCurrentSongFromDB}
      audioRef={audioRef} user={user} onEndedSong={onEndedSong} currentTime={currentTime} setCurrentTime={setCurrentTime} />
      <ChatRoom user={user} rate={rate} station={station} />
      <Footer />
    </>
  );
}

export default StationComponent;