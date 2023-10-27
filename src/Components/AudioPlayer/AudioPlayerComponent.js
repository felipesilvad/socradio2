import React, {useRef, useState, useEffect} from 'react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import {firestore} from '../../firebase';
import {Image} from 'react-bootstrap';
import { doc, getDoc, onSnapshot } from "firebase/firestore";

function AudioPlayerComponent({station}) {
  const player = useRef()

  const songsRef = firestore.collection('songs');
  // const query = songsRef.limit(5);
  // const [songList] = useCollectionData(query, { idField: 'id' });
  // const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState();
  const [currentSongIndex, setCurrentSongIndex] = useState();
  const [playlist, setPlaylist] = useState();

  const setCurrentSongFromDB = (songID) => {
    onSnapshot(doc(firestore, "/songs/", songID), (doc) => {
      setCurrentSong(doc.data());
    });
  }

  const PlayAudio = () => {
    if (player.current.audio.current) {
      player.current.audio.current.play();
    }
  }

  const toTime = (time) => {
    const audio = player.current.audio.current
    audio.currentTime = time;
    console.log('moved to time')
  };

  const setCurrentSongFromAPI = async () => {
    const response = await fetch(`http://127.0.0.1:5000/currentSong${station}`)
    const song = await response.json();
    setCurrentSong(song)
    setCurrentSongIndex(song.index)
    console.log(song)
  }


  const setPlaylistSongFromAPI = async () => {
    const response = await fetch(`http://127.0.0.1:5000/playlist${station}`)
    const playlist = await response.json();
    setPlaylist(playlist)
  }

  const onEndedSong = () => {
    setCurrentSong(playlist[currentSongIndex+1])
    setCurrentSongIndex(currentSongIndex+1)
  }

  useEffect(() => {
    setCurrentSongFromAPI()
    setPlaylistSongFromAPI()
  }, [])

  useEffect(() => {
    if (currentSong) {
      const now = new Date().getTime()
      const seconds = now / 1000
      const songStart =  currentSong.startTime
      toTime(seconds-songStart)
    }
  }, [currentSong])

  // console.log(playlist)
  // console.log([currentSongIndex])
  
  if (currentSong&&currentSong.data) {
    return (
      <>
        {/* <Radio audio={currentSong.audio} /> */}
        <div className="audio-player-display" style={{
          backgroundImage: `url(${currentSong.data.cover})`
        }}>
        </div>
        <div className='bg-overlay'>
          <Image className="cover-img" src={currentSong.data.cover} />
          <div className='song-txt'>
            <div className='ml-2 mt-2' >
              <h1>{currentSong.data.title}</h1>
              <h2>{currentSong.data.artist}</h2>
              <h4>{currentSong.data.album}</h4>
            </div>
            <AudioPlayer
              autoPlay={true}
              src={currentSong.data.audio}
              onPlay={e => console.log("onPlay")}
              ref={player}
              onEnded={() => onEndedSong()}
              showDownloadProgress={false}
              showJumpControls={false}
              hasDefaultKeyBindings={false}
              autoPlayAfterSrcChange={true}
              customControlsSection={[RHAP_UI.VOLUME_CONTROLS]}
              layout={'horizontal'}
            />
          </div>
        </div>
      </>
    )
  }
}


export default AudioPlayerComponent;