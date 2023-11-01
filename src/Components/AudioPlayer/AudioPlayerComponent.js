import React, {useRef, useState, useEffect} from 'react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import {firestore} from '../../firebase';
import {Image} from 'react-bootstrap';
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import AudioPlayerRatings from './AudioPlayerRatings';

function AudioPlayerComponent({station, user}) {
  const player = useRef()

  const songsRef = firestore.collection('songs');
  // const query = songsRef.limit(5);
  // const [songList] = useCollectionData(query, { idField: 'id' });
  // const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState();
  const [currentSongStartTime, setCurrentSongStartTime] = useState();
  const [playlist, setPlaylist] = useState();

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
    setCurrentSongStartTime(song.startTime)

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


  // console.log("playlist:",playlist)
  // console.log("currentSongIndex",currentSongIndex)
  
  if (Number.isInteger(currentSongIndex)) {
    return (
      <>
        {/* <Radio audio={currentSong.audio} /> */}
        <div className="audio-player-display" style={{
          backgroundImage: `url(${playlist[currentSongIndex].data.cover})`
        }}>
        </div>
        <div className='bg-overlay'>
          <Image className="cover-img" src={playlist[currentSongIndex].data.cover} />
          <div className='song-txt'>
            <div className='ml-2 mt-2' >
              <h1>{playlist[currentSongIndex].data.title}</h1>
              <h2>{playlist[currentSongIndex].data.artist}</h2>
              <h4>{playlist[currentSongIndex].data.album}</h4>
            </div>
            <AudioPlayer
              autoPlay={true}
              src={playlist[currentSongIndex].data.audio}
              // onPlay={e => console.log("onPlay")}
              ref={player}
              onEnded={() => onEndedSong()}
              showDownloadProgress={false}
              showJumpControls={false}
              hasDefaultKeyBindings={false}
              autoPlayAfterSrcChange={true}
              customControlsSection={[RHAP_UI.VOLUME_CONTROLS]}
              layout={'horizontal'}
            />

            <AudioPlayerRatings songID={playlist[currentSongIndex].id} user={user} />

          </div>
        </div>
      </>
    )
  }
}


export default AudioPlayerComponent;