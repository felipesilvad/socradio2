import React, {useRef, useState, useEffect} from 'react';
import ChatRoom from './Chat/ChatRoom';
import AudioPlayerComponent from './AudioPlayer/AudioPlayerComponent';
import {firestore} from '../firebase';
import {onSnapshot, query, collection, where, limit} from "firebase/firestore";
import firebase from 'firebase/compat/app';
import PlaylistComponent from './Playlist/PlaylistComponent';

function DonatorStation({user,station}) {
  const [currentSongIndex, setCurrentSongIndex] = useState();
  const [playlist, setPlaylist] = useState();
  const [playlistList, setPlaylistList] = useState();
  const [currentPlaylist, setCurrentPlaylist] = useState();

  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
    
  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const onEndedSong = () => {
    if (currentSongIndex+1===playlist.length) {
      setCurrentSongIndex(0)
    } else {
      setCurrentSongIndex(i => i + 1)
    }
  }

  const setPlaylistSongFromDB = async (e) => {
    if (e) {
      onSnapshot(query(collection(firestore, `/songs`), where("playlists", "array-contains", e)), (snapshot) => {
        setPlaylist(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
      });
    }
  }

  useEffect(() => {
    onSnapshot(query(collection(firestore, `/playlist`)), (snapshot) => {
      setPlaylistList(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
    });
    onSnapshot(query(collection(firestore, `/songs`), where("main", "==", true), limit(100)), (snapshot) => {
      setPlaylist(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
    });
  }, [])

  useEffect(() => {
    setCurrentSongIndex(0)
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
    }
  };

  // RANGE FILTER

  const [minFilter, setMinFilter] = useState(1);
  const [maxFilter, setMaxFilter] = useState(5);


  const changeRangeFilter = (e) => {
    console.log(e)
    setMinFilter(e[0])
    setMaxFilter(e[1])
    if (!currentPlaylist) {
      if (minFilter > 3) {
        onSnapshot(query(collection(firestore, `/songs`), where("lv", ">=", minFilter), limit(100)), (snapshot) => {
          setPlaylist(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
        });
      } else {   
        onSnapshot(query(collection(firestore, `/songs`), where("lv", "<=", maxFilter), limit(100)), (snapshot) => {
          setPlaylist(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
        });
      }
    }
  }

  function rangeFilter(song) {
    return (song.lv >= minFilter) && (song.lv <= maxFilter);
  }


  if (playlist) {
    return (
      <>
        {playlist.filter(rangeFilter).length>0&&(
          <AudioPlayerComponent playlist={playlist.filter(rangeFilter)} currentSongIndex={currentSongIndex} updateRating={updateRating} setCurrentSongFromDB={""}
          audioRef={audioRef} user={user} onEndedSong={onEndedSong} currentTime={currentTime} setCurrentTime={setCurrentTime}
          dono={true}  />
        )}
        {/* <ChatRoom user={user} rate={rate} /> */}
        <PlaylistComponent playlist={playlist.filter(rangeFilter)} setCurrentSongIndex={setCurrentSongIndex} currentSongIndex={currentSongIndex }
        setPlaylistSongFromDB={setPlaylistSongFromDB} playlistList={playlistList} changeRangeFilter={changeRangeFilter}
        setCurrentPlaylist={setCurrentPlaylist} currentPlaylist={currentPlaylist} />
      </>
    );
  }
}

export default DonatorStation;