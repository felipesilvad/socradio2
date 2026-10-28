import React, {useRef, useState, useEffect} from 'react';
import ChatRoom from './Chat/ChatRoom';
import AudioPlayerComponent from './AudioPlayer/AudioPlayerComponent';
import {db, subscriptions} from '../supabase';
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
    try {
      const stationData = await db.getStation(station);
      if (stationData) {
        setCurrentSongIndex(stationData.current_song_index);
        const now = new Date().getTime();
        const seconds = now / 1000;
        if (stationData.current_song_start_time) {
          handleSeek(seconds - new Date(stationData.current_song_start_time).getTime() / 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching current song:', error);
    }
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
    try {
      const stationData = await db.getStation(station);
      if (stationData && stationData.current_playlist_id) {
        const playlistSongs = await db.getSongs({ playlist: stationData.current_playlist_id });
        setPlaylist(playlistSongs);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  }

  useEffect(() => {
    setPlaylistSongFromDB()
  }, [])

  useEffect(() => {
    setCurrentSongFromDB()
  }, [playlist])

  // BOT MESSAGE 

  const sendBotMessage = (txt, rating, uid, song_title, song_cover) => {
    db.addMessage({
      text: txt,
      bot: true,
      uid: "Abr91NqhIRagi2UygmUZpehKnM52",
      rating: rating,
      rating_uid: uid,
      song_title: song_title,
      song_cover: song_cover,
    }).catch(error => {
      console.error('Error sending bot message:', error);
    });
  }

  // RATINGS

  const [updateRating, setUpdateRating] = useState(false);

  const rate = (newRating, uid) => {
    if (newRating > 0 && newRating < 6) {
      db.addRating(playlist[currentSongIndex].id, user.uid, newRating)
        .then(() => {
          setUpdateRating(!updateRating);
          sendBotMessage(`Rated`, newRating, uid, playlist[currentSongIndex].title, playlist[currentSongIndex].cover);
        })
        .catch(error => {
          console.error('Error adding rating:', error);
        });
    } else {
      sendBotMessage("Rating needs to be between 0 and 5");
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