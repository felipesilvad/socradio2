import React, {useRef, useState, useEffect} from 'react';
import ChatRoom from './Chat/ChatRoom';
import AudioPlayerComponent from './AudioPlayer/AudioPlayerComponent';
import {firestore} from '../firebase';

function StationComponent({user,station}) {
  const [currentSongIndex, setCurrentSongIndex] = useState();
  const [playlist, setPlaylist] = useState();
  const player = useRef()

  // const setCurrentSongFromDB = (songID) => {
  //   onSnapshot(doc(firestore, "/songs/", songID), (doc) => {
  //     setCurrentSong(doc.data());
  //   });
  // }

  const PlayAudio = () => {
    if (player.current.audio.current) {
      player.current.audio.current.play();
    }
  }

  const toTime = (time) => {
    if (player.current) {
      const audio = player.current.audio.current
      audio.currentTime = time;
      console.log('moved to time', time)
    }
  };

  const setCurrentSongFromAPI = async () => {
    const response = await fetch(`http://127.0.0.1:5000/currentSong${station}`)
    const song = await response.json();
    setCurrentSongIndex(song.index)

    const now = new Date().getTime()
    const seconds = now / 1000
    toTime(seconds-song.startTime)
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
    const response = await fetch(`http://127.0.0.1:5000/playlist${station}`)
    const playlist = await response.json();
    setPlaylist(playlist)
  }

  useEffect(() => {
    setPlaylistSongFromAPI()
  }, [])

  useEffect(() => {
    setCurrentSongFromAPI()
  }, [playlist])


  // RATINGS

  const ratingsRef = firestore.collection('ratings');

  const rate =(newRating) => {
    ratingsRef.doc(playlist[currentSongIndex].id).collection("ratings").doc(user.uid).set({
      ratings: newRating,
    }, {merge: true})
    console.log(newRating);
  };

  return (
    <>
      <AudioPlayerComponent playlist={playlist} currentSongIndex={currentSongIndex} 
      player={player} user={user} onEndedSong={onEndedSong} />
      <ChatRoom user={user} rate={rate} />
    </>
  );
}

export default StationComponent;