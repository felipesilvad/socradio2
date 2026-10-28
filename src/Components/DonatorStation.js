import React, {useRef, useState, useEffect} from 'react';
import ChatRoom from './Chat/ChatRoom';
import AudioPlayerComponent from './AudioPlayer/AudioPlayerComponent';
import {db, subscriptions} from '../supabase';
import PlaylistComponent from './Playlist/PlaylistComponent';
import Footer from './Footer'

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
      try {
        const playlistSongs = await db.getSongs({ playlist: e });
        setPlaylist(playlistSongs);
      } catch (error) {
        console.error('Error fetching playlist songs:', error);
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch playlists
        const playlistData = await db.getPlaylists();
        setPlaylistList(playlistData);
        
        // Fetch main songs
        const mainSongs = await db.getSongs({ main: true, limit: 100 });
        setPlaylist(mainSongs);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [])

  useEffect(() => {
    setCurrentSongIndex(0)
  }, [playlist])

  // BOT MESSAGE 

  const sendBotMessage = (txt) => {
    db.addMessage({
      text: txt,
      bot: true,
      uid: "Abr91NqhIRagi2UygmUZpehKnM52"
    }).catch(error => {
      console.error('Error sending bot message:', error);
    });
  }

  // RATINGS

  const [updateRating, setUpdateRating] = useState(false);

  const rate = (newRating) => {
    if (newRating > 0 && newRating < 6) {
      db.addRating(playlist[currentSongIndex].id, user.uid, newRating)
        .then(() => {
          setUpdateRating(!updateRating);
        })
        .catch(error => {
          console.error('Error adding rating:', error);
        });
    } else {
      sendBotMessage("Rating needs to be between 0 and 5");
    }
  };

  // RANGE FILTER

  const [minFilter, setMinFilter] = useState(1);
  const [maxFilter, setMaxFilter] = useState(5);

  const changeRangeFilter = (e) => {
    setMinFilter(e[0])
    setMaxFilter(e[1])
    if (!currentPlaylist) {
      if (minFilter > 3) {
        db.getSongs({ lv_min: minFilter, limit: 100 }).then(songs => {
          setPlaylist(songs);
        }).catch(error => {
          console.error('Error filtering songs by min level:', error);
        });
      } else {   
        db.getSongs({ lv_max: maxFilter, limit: 100 }).then(songs => {
          setPlaylist(songs);
        }).catch(error => {
          console.error('Error filtering songs by max level:', error);
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
        <Footer />
      </>
    );
  }
}

export default DonatorStation;