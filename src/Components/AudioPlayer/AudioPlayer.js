import React, { useState, useEffect } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FaVolumeMute } from "react-icons/fa";
import { FaVolumeUp } from "react-icons/fa";
import {Button,Row,Col, Spinner} from 'react-bootstrap';
import AudioPlayerRatings from './AudioPlayerRatings';
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import { FaPlay } from "react-icons/fa6";

function AudioPlayer({audioSrc, onEndedSong, audioRef, currentTime, setCurrentTime, user, songID, updateRating, setCurrentSongFromDB}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const handlePlay = () => {
    audioRef.current.play();
    setIsPlaying(true);
    setCurrentSongFromDB()
    console.log("play")
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
    setVolume(audioRef.current.volume);
    setIsPlaying(!audioRef.current.paused)
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
      } else {
        if (volume > 0.09) {
          audioRef.current.volume = volume;
        } else {
          audioRef.current.volume = 0.8;
          setVolume(0.8)
        }
      }
    }
  };

  const lowerVolume = () => {
    if (audioRef.current) {
      if (audioRef.current.volume) {
        const newVolume = audioRef.current.volume-0.1;
        if (newVolume>0) {
          audioRef.current.volume = newVolume
          setVolume(newVolume)
        }
    }}
  }
  const increaseVolume = () => {
    if (audioRef.current) {
      if (audioRef.current.volume) {
        const newVolume = audioRef.current.volume+0.1;
        if (newVolume<1.1) {
          audioRef.current.volume = newVolume
          setVolume(newVolume)
        }
    }}
  }

  useEffect(() => {
    setTimeout(() => setLoading(false), 5000)
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 5000)
  }, [audioSrc]);


  return (
    <div className="player-card">
      <Row >
        <Col lg={3}>
          <div className="mx-1 d-flex justify-content-around">
            {(isPlaying) ? (
              <>
                <Button className={`volume-button ${volume<0.09&&("volume-button-off")}`} onClick={() => lowerVolume()}><FaMinus className="volume-icon" /></Button>
              {(volume > 0.09) ? (
                <Button className="volume-button" onClick={() => handleVolume()}><FaVolumeUp className="volume-icon" /></Button>
              ) : (
                <Button className="volume-button volume-button-off" onClick={() => handleVolume()}><FaVolumeMute className="volume-icon" /></Button>
              )}
              <Button className={`volume-button ${volume>0.91&&("volume-button-off")}`} onClick={() => increaseVolume()}><FaPlus className="volume-icon" /></Button>
              </>
            ): (
              <Button className={"volume-button volume-button-play"} onClick={() => handlePlay()}>
                {(loading)? (
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                ): (
                  <FaPlay className="volume-icon" />
                )}
              </Button>
            )}
            
          </div>
        </Col>
        <Col>
          <ProgressBar min="0" now={currentTime} max={duration} />
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