import React, { useState, useEffect } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FaVolumeMute } from "react-icons/fa";
import { FaVolumeUp } from "react-icons/fa";
import {Button,Row,Col} from 'react-bootstrap';
import AudioPlayerRatings from './AudioPlayerRatings';

function AudioPlayer({audioSrc, onEndedSong, audioRef, currentTime, setCurrentTime, user, songID, updateRating}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  const handlePlay = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  function formatDuration(durationSeconds) {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.floor(durationSeconds % 60);
    const formattedSeconds = seconds.toString().padStart(2, "0");
    return `${minutes}:${formattedSeconds}`;
  }

  const handleVolume = () => {
    if (audioRef.current) {
      if (audioRef.current.volume) {
        audioRef.current.volume = 0;
        setVolume(0)
      } else {
        audioRef.current.volume = 1;
        setVolume(1)
      }
    }
  };

  useEffect(() => {
    // handlePlay()

    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return (
    <div className="player-card">
      <Row >
        <Col lg={1}>
          <div className="mx-1">
            {(volume) ? (
              <>
                <Button className="volume-button" onClick={() => handleVolume()}><FaVolumeUp className="volume-icon" /></Button>
              </>
            ) : (
              <>
                <Button className="volume-button volume-button-off" onClick={() => handleVolume()}><FaVolumeMute className="volume-icon" /></Button>
              </>
            )}
          </div>
        </Col>
        <Col>
          <ProgressBar variant="success" min="0" now={currentTime} max={duration} />
          <div className="d-flex justify-content-between w-100">
            <div className="mtsrt">{formatDuration(currentTime)}</div>
            <div className="mtsrt">{formatDuration(duration)}</div>
          </div>
        </Col>
      </Row>

      <div className="d-flex pb-2 h-100 mx-1">
        <div className="justify-content-center align-self-center">
          <AudioPlayerRatings songID={songID} user={user} updateRating={updateRating} />
        </div>
        <div className="ml-2 mt-1 mtsrt justify-content-center align-self-center">
          use command:
        </div>
        <div className="mx-1 mt-1 justify-content-center align-self-center">
          {"!rate {number from 0 to 5}"}
        </div>
      </div>

      <audio ref={audioRef} src={audioSrc} autoPlay={true} id="myAudio" onEnded={() => onEndedSong()} />
    </div>
  );
}

export default AudioPlayer;