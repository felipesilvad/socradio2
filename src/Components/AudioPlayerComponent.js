import React, {useRef, useState} from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import {firestore} from '../firebase';
import AudioPlayerDisplay from './AudioPlayerDisplay';

function AudioPlayerComponent() {
  const player = useRef()

  const songsRef = firestore.collection('songs');
  const query = songsRef.limit(5);
  const [songList] = useCollectionData(query, { idField: 'id' });
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const PlayAudio = () => {
    if (player.current.audio.current) {
      player.current.audio.current.play();
    }
  }

  const delay = ms => new Promise(
    resolve => setTimeout(resolve, ms)
  );

  const NextSong = () => {
    setCurrentSongIndex(currentSongIndex+1)
    PlayAudio()
  }
  
  if (songList) {
    const currentSong = songList[currentSongIndex]
    return (
      <>
        <div className='d-none'>
          <AudioPlayer
            autoPlay={true}
            src={currentSong.audio}
            onPlay={e => console.log("onPlay")}
            ref={player}
            onEnded={() => NextSong()}
          />
        </div>

        <AudioPlayerDisplay song={currentSong} />
      </>
    )
  }
}


export default AudioPlayerComponent;