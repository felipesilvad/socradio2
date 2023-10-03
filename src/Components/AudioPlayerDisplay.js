import React, {useRef, useState} from 'react';
import {Row,Col,Image} from 'react-bootstrap';

function AudioPlayerDisplay({song}) {
  if (song) {
    return (
      <div className="audio-player-display" style={{
        backgroundImage: `url(${song.cover})`
      }}>
        <Row className='bg-overlay h-100 align-items-center'>
          <Col lg={4}>
            <div className='d-flex justify-content-end'>
              <Image className="cover-img" src={song.cover} />
            </div>
          </Col>
          <Col lg={8}>
            <div className='song-txt'>
              <h1>{song.title}</h1>
              <h2>{song.artist}</h2>
              <h4>{song.album}</h4>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default AudioPlayerDisplay;