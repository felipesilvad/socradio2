import React, {useRef, useState} from 'react';
import {Row,Col,Image} from 'react-bootstrap';
import ProgressBar from 'react-bootstrap/ProgressBar';

function AudioPlayerDisplay({song, audioRef}) {
  if (song) {
    return (
      <>
        <div className="audio-player-display" style={{
          backgroundImage: `url(${song.cover})`
        }}>
        </div>
        <div className='bg-overlay'>
          <Image className="cover-img" src={song.cover} />
          <div className='song-txt'>
            <h1>{song.title}</h1>
            <h2>{song.artist}</h2>
            <h4>{song.album}</h4>
            {/* {audioRef&&(audioRef.audio&&(
              <ProgressBar animated now={audioRef.audio.current.currentTime} />
            ))} */}
          </div>
        </div>
      </>
    )
  }
}

export default AudioPlayerDisplay;