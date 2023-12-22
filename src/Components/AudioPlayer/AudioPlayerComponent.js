import React from 'react';
import {Image} from 'react-bootstrap';
import AudioPlayer from './AudioPlayer';

function AudioPlayerComponent({playlist, currentSongIndex, audioRef, onEndedSong, user, currentTime, setCurrentTime, updateRating}) {
  
  if (Number.isInteger(currentSongIndex)) {
    return (
      <>
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

            <AudioPlayer audioSrc={playlist[currentSongIndex].data.audio} audioRef={audioRef} songID={playlist[currentSongIndex].id} user={user}
            onEndedSong={onEndedSong} currentTime={currentTime} setCurrentTime={setCurrentTime} updateRating={updateRating} />

          </div>
        </div>
      </>
    )
  }
}


export default AudioPlayerComponent;