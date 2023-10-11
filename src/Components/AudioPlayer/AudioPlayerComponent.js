import React, {useRef, useState} from 'react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import {firestore} from '../../firebase';
import {Image} from 'react-bootstrap';

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

  const toTime = (time) => {
    const audio = player.current.audio.current
    audio.currentTime = time;
  };

  const NextSong = () => {
    setCurrentSongIndex(currentSongIndex+1)
    PlayAudio()
  }
  
  if (songList) {
    const currentSong = songList[currentSongIndex]
    return (
      <>
        <div className="audio-player-display" style={{
          backgroundImage: `url(${currentSong.cover})`
        }}>
        </div>
        <div className='bg-overlay'>
          <Image className="cover-img" src={currentSong.cover} />
          <div className='song-txt'>
            <div className='ml-2 mt-2' >
              <h1>{currentSong.title}</h1>
              <h2>{currentSong.artist}</h2>
              <h4>{currentSong.album}</h4>
            </div>
            <AudioPlayer
              autoPlay={true}
              src={currentSong.audio}
              onPlay={e => console.log("onPlay")}
              ref={player}
              onEnded={() => NextSong()}
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