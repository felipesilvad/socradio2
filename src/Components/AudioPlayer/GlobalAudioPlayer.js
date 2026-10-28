import React, { useRef, useEffect, useState } from 'react';
import { useGlobalPlayback } from '../../hooks/useGlobalPlayback';
import { Button, ProgressBar, Alert } from 'react-bootstrap';
import { FaPlay, FaPause, FaForward, FaSync } from 'react-icons/fa';

const GlobalAudioPlayer = ({ stationId, user }) => {
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showSyncStatus, setShowSyncStatus] = useState(false);

  const {
    playbackState,
    isConnected,
    isLoading,
    error,
    currentSong,
    currentPlaylist,
    currentTime,
    progress,
    isPlaying,
    play,
    pause,
    seek,
    nextSong,
    initialize,
    clockDrift,
    sessionId
  } = useGlobalPlayback(stationId, user?.id);

  // Handle audio element synchronization
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    // Set audio source
    if (currentSong.audioUrl) {
      audio.src = currentSong.audioUrl;
    }

    // Sync playback position
    if (isPlaying && !audio.paused) {
      const expectedTime = currentTime / 1000;
      const actualTime = audio.currentTime;
      const timeDiff = Math.abs(expectedTime - actualTime);

      // Resync if difference is significant (> 0.5 seconds)
      if (timeDiff > 0.5) {
        audio.currentTime = expectedTime;
      }
    }

    // Handle play/pause
    if (isPlaying && audio.paused) {
      audio.play().catch(err => {
        console.error('Audio play failed:', err);
      });
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }

    // Handle volume
    audio.volume = isMuted ? 0 : volume;

  }, [currentSong, isPlaying, currentTime, volume, isMuted]);

  // Handle audio events
  const handleAudioTimeUpdate = () => {
    if (!audioRef.current || !playbackState) return;

    const audio = audioRef.current;
    const expectedTime = currentTime / 1000;
    const actualTime = audio.currentTime;
    const timeDiff = Math.abs(expectedTime - actualTime);

    // Auto-resync if difference is significant
    if (timeDiff > 1.0) {
      audio.currentTime = expectedTime;
    }
  };

  const handleAudioEnded = () => {
    // Let server handle song advancement
    // Client will receive update via SSE
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    seek(newTime * 1000); // Convert to milliseconds
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSyncStatusColor = () => {
    if (!isConnected) return 'text-danger';
    if (Math.abs(clockDrift) > 1000) return 'text-warning'; // > 1 second drift
    return 'text-success';
  };

  const getSyncStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (Math.abs(clockDrift) > 1000) return `Syncing (${Math.abs(clockDrift)}ms drift)`;
    return 'In Sync';
  };

  if (isLoading) {
    return (
      <div className="global-audio-player">
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading playback state...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="global-audio-player">
        <Alert variant="danger">
          <Alert.Heading>Playback Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={initialize}>
            <FaSync className="me-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="global-audio-player">
        <Alert variant="info">
          <Alert.Heading>No Song Playing</Alert.Heading>
          <p>No song is currently playing on this station.</p>
          <Button variant="outline-info" onClick={initialize}>
            <FaSync className="me-2" />
            Initialize Playback
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="global-audio-player">
      {/* Sync Status Indicator */}
      <div className="sync-status d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">
          {currentPlaylist?.title && `Playlist: ${currentPlaylist.title}`}
        </small>
        <small 
          className={`${getSyncStatusColor()} cursor-pointer`}
          onClick={() => setShowSyncStatus(!showSyncStatus)}
          style={{ cursor: 'pointer' }}
        >
          {getSyncStatusText()}
        </small>
      </div>

      {/* Detailed Sync Info */}
      {showSyncStatus && (
        <div className="sync-details mb-3 p-2 bg-light rounded">
          <small className="text-muted">
            <div>Session ID: {sessionId?.substring(0, 8)}...</div>
            <div>Clock Drift: {clockDrift}ms</div>
            <div>Server Time: {playbackState?.serverTime ? new Date(playbackState.serverTime).toLocaleTimeString() : 'N/A'}</div>
            <div>Current Position: {formatTime(currentTime)}</div>
          </small>
        </div>
      )}

      {/* Song Info */}
      <div className="song-info mb-3">
        <div className="d-flex align-items-center">
          {currentSong.cover && (
            <img 
              src={currentSong.cover} 
              alt={currentSong.title}
              className="me-3"
              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
            />
          )}
          <div className="flex-grow-1">
            <h5 className="mb-1">{currentSong.title}</h5>
            <p className="mb-0 text-muted">{currentSong.artist}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section mb-3">
        <ProgressBar 
          now={progress} 
          className="mb-2"
          style={{ height: '8px' }}
        />
        <div className="d-flex justify-content-between">
          <small>{formatTime(currentTime)}</small>
          <small>{formatTime(currentSong.duration || 0)}</small>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <Button 
            variant="outline-primary" 
            onClick={isPlaying ? pause : play}
            className="me-2"
            disabled={!isConnected}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={nextSong}
            className="me-2"
            disabled={!isConnected}
          >
            <FaForward />
          </Button>
        </div>

        {/* Seek Bar */}
        <div className="seek-section mb-3">
          <input
            type="range"
            min="0"
            max={currentSong.duration ? currentSong.duration / 1000 : 0}
            step="0.1"
            value={currentTime / 1000}
            onChange={handleSeek}
            className="form-range"
            disabled={!isConnected}
          />
        </div>

        {/* Volume Controls */}
        <div className="volume-section d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            onClick={toggleMute}
            className="me-2"
            size="sm"
          >
            {isMuted ? '🔇' : '🔊'}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="form-range flex-grow-1"
          />
          <small className="ms-2 text-muted">
            {Math.round(volume * 100)}%
          </small>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        preload="metadata"
      />
    </div>
  );
};

export default GlobalAudioPlayer;
