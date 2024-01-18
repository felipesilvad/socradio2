import React from 'react';
import {Image} from 'react-bootstrap';
import AudioPlayer from './AudioPlayer';

function AudioPlayerComponent({playlist, currentSongIndex, audioRef, onEndedSong, user, currentTime, setCurrentTime, updateRating}) {
  
  if (Number.isInteger(currentSongIndex)) {
    return (
      <>
        <div className="audio-player-display" 
        style={{
          backgroundImage: `url(${playlist[currentSongIndex].cover&&(playlist[currentSongIndex].cover)})`
        }}
        >
        </div>
        <div className='bg-overlay'>
          <Image className="cover-img" src={playlist[currentSongIndex].cover} />
          <div className='song-txt'>
            <div className='ml-2 mt-2' >
              <h1>{playlist[currentSongIndex].title}</h1>
              <h2>{playlist[currentSongIndex].artist}</h2>
              <h4>{playlist[currentSongIndex].album}</h4>
            </div>

            <AudioPlayer audioSrc={playlist[currentSongIndex].audio} audioRef={audioRef} songID={playlist[currentSongIndex].id} user={user}
            onEndedSong={onEndedSong} currentTime={currentTime} setCurrentTime={setCurrentTime} updateRating={updateRating} />

          </div>
        </div>
      </>
    )
  }
}


export default AudioPlayerComponent;