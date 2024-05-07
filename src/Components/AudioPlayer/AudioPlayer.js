import React, { useState, useEffect } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FaVolumeMute } from "react-icons/fa";
import { FaVolumeUp } from "react-icons/fa";
import {Row,Col,Spinner,Form} from 'react-bootstrap';
import AudioPlayerRatings from './AudioPlayerRatings';
import { FaPlus, FaPause,  FaMinus } from "react-icons/fa";
import { FaPlay } from "react-icons/fa6";
import { MdSkipNext } from "react-icons/md";
import bestContrast from 'get-best-contrast-color';
import VolumeRange from './VolumeRange'

function AudioPlayer({
  audioSrc, onEndedSong, audioRef, currentTime, setCurrentTime, 
  user, songID, updateRating, setCurrentSongFromDB, dono, color,
}) {
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

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
      setVolume(audioRef.current.volume);
      setIsPlaying(!audioRef.current.paused)
    }
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

  const changeVolume = (value) => {
    if (audioRef.current) {
      if (audioRef.current.volume) {
        audioRef.current.volume = value/100
        setVolume(value/100)
    }}
  }
  // const lowerVolume = () => {
  //   if (audioRef.current) {
  //     if (audioRef.current.volume) {
  //       const newVolume = audioRef.current.volume-0.1;
  //       if (newVolume>0) {
  //         audioRef.current.volume = newVolume
  //         setVolume(newVolume)
  //       }
  //   }}
  // }
  // const increaseVolume = () => {
  //   if (audioRef.current) {
  //     if (audioRef.current.volume) {
  //       const newVolume = audioRef.current.volume+0.1;
  //       if (newVolume<1.1) {
  //         audioRef.current.volume = newVolume
  //         setVolume(newVolume)
  //       }
  //   }}
  // }

  useEffect(() => {
    setTimeout(() => setLoading(false), 5000)
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    // return () => {
    //   audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
    // };
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 5000)
  }, [audioSrc]);

  const pallete = ["#FEFEFE", "#2F4858", "#282C34"]

  const bgColor = {
    backgroundColor: `${color}`,
  }
  const barColor = {
    '--bs-progress-bar-bg': `${color}`,
    backgroundColor: bestContrast(color, pallete)
  }
  


  return (
    <div className="player-card">
      <Row >
        <Col lg={(dono)?(5):(3)}>
          <div className="mx-1 d-flex justify-content-around pb-2">
            {dono&&(
              <>
                <button className="px-2 mt-1 volume-button" style={bgColor} onClick={() => handlePlayPause()}>
                  {(isPlaying) ? (
                    <FaPause className="volume-icon" />
                  ) : (
                    <FaPlay className="volume-icon" />
                  )}
                </button>

                <button className="px-2 mt-1 volume-button" style={bgColor} onClick={() => onEndedSong()}><MdSkipNext className="volume-icon" /></button>
              </>
            )}


            {(isPlaying||dono) ? (
              <>
                {/* <button className={`volume-button ${volume<0.09&&("volume-button-off")}`} style={bgColor} onClick={() => lowerVolume()}><FaMinus className="volume-icon" /></button> */}
                {(volume > 0.09) ? (
                  <button className="px-2 mt-1 volume-button" style={bgColor} onClick={() => handleVolume()}><FaVolumeUp className="volume-icon" /></button>
                ) : (
                  <button className="px-2 mt-1 volume-button volume-button-off" style={bgColor} onClick={() => handleVolume()}><FaVolumeMute className="volume-icon" /></button>
                )}
                {/* <button className={`volume-button ${volume>0.91&&("volume-button-off")}`} style={bgColor} onClick={() => increaseVolume()}><FaPlus className="volume-icon" /></button> */}

                {/* <Form.Range  id="disabledRange" className="mx-2 align-self-center" style={rangeColor} onChange={(e) => changeVolume(e.target.value)} value={volume*100} /> */}
                <VolumeRange changeVolume={changeVolume} volume={volume} />
              </>
            ): (
              <button className={"volume-button volume-button-play"} style={bgColor} onClick={() => handlePlay()}>
                {(loading)? (
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                ): (
                  <FaPlay className="volume-icon" />
                )}
              </button>
            )}
          </div>
        </Col>
        <Col className="px-1">
          <ProgressBar min="0" now={currentTime} max={duration} style={barColor} />
          <div className="d-flex justify-content-between w-100">
            <div className="mtsrt">{formatDuration(currentTime)}</div>
            <div className="mtsrt">{formatDuration(duration)}</div>
          </div>
        </Col>
      </Row>

      {!dono&&(
        <div className="ratings pb-2 mx-1">
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
      )}

      <audio ref={audioRef} src={audioSrc} autoPlay={true} id="myAudio" onEnded={() => onEndedSong()} />
    </div>
  );
}

export default AudioPlayer;