import React from 'react';
import {Image} from 'react-bootstrap';
import AudioPlayer from './AudioPlayer';

function AudioPlayerComponent({playlist, currentSongIndex, audioRef, onEndedSong, user, currentTime, setCurrentTime, updateRating}) {
  if (playlist) {
    if (Number.isInteger(currentSongIndex)) {
      const song = playlist[currentSongIndex]
      
      return (
        <>
          <div className="audio-player-display" 
          style={{
            backgroundImage: `url(${song.cover})`
          }}
          >
          </div>
          <div className='bg-overlay'>
            <Image className="cover-img" src={song.cover} />
            <div className='song-txt'>
              <div className='ml-2 mt-2' >
                <h1>{song.title}</h1>
                <h2>{song.artist}</h2>
                <h4>{song.album}</h4>
              </div>
  
              <AudioPlayer audioSrc={song.audio} audioRef={audioRef} songID={song.id} user={user}
              onEndedSong={onEndedSong} currentTime={currentTime} setCurrentTime={setCurrentTime} updateRating={updateRating} />
  
            </div>
          </div>
        </>
      )
    }
  }
}


export default AudioPlayerComponent;