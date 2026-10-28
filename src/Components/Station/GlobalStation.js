import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import GlobalAudioPlayer from '../AudioPlayer/GlobalAudioPlayer';
import { useGlobalPlayback } from '../../hooks/useGlobalPlayback';
import playbackRecovery from '../../utils/playbackRecovery';
import { Alert, Button, Row, Col, Card } from 'react-bootstrap';
import { FaSync, FaExclamationTriangle } from 'react-icons/fa';

const GlobalStation = ({ user }) => {
  const { stationId } = useParams();
  const [showRecovery, setShowRecovery] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

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
    initialize,
    refresh
  } = useGlobalPlayback(stationId, user?.id);

  // Console log current song for debugging
  useEffect(() => {
    if (currentSong) {
      console.log('🎵 Current Song:', {
        title: currentSong.title,
        artist: currentSong.artist,
        position: currentTime,
        progress: progress.toFixed(1) + '%',
        isPlaying: isPlaying,
        stationId: stationId
      });
    }
  }, [currentSong, currentTime, progress, isPlaying, stationId]);

  const handleAutoRecovery = useCallback(async () => {
    try {
      setShowRecovery(true);
      const success = await playbackRecovery.autoRecover(stationId);
      
      if (success) {
        setTimeout(() => {
          refresh(); // Refresh playback state
          setShowRecovery(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Auto-recovery failed:', error);
      setShowRecovery(false);
    }
  }, [stationId, refresh]);

  // Auto-recovery on errors
  useEffect(() => {
    if (error) {
      console.log('Playback error detected, attempting recovery...');
      handleAutoRecovery();
    }
  }, [error, handleAutoRecovery]);

  // Periodic health check
  useEffect(() => {
    const healthCheckInterval = setInterval(async () => {
      const health = await playbackRecovery.performHealthCheck(stationId);
      setHealthStatus(health);
    }, 60000); // Every minute

    return () => clearInterval(healthCheckInterval);
  }, [stationId]);

  const handleManualRecovery = async () => {
    try {
      setShowRecovery(true);
      await playbackRecovery.autoRecover(stationId);
      await refresh();
      setShowRecovery(false);
    } catch (error) {
      console.error('Manual recovery failed:', error);
      setShowRecovery(false);
    }
  };

  const getHealthStatusColor = () => {
    if (!healthStatus) return 'text-muted';
    switch (healthStatus.overallHealth) {
      case 'healthy': return 'text-success';
      case 'unhealthy': return 'text-warning';
      case 'error': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getHealthStatusText = () => {
    if (!healthStatus) return 'Checking...';
    switch (healthStatus.overallHealth) {
      case 'healthy': return 'All Systems Operational';
      case 'unhealthy': return 'Issues Detected';
      case 'error': return 'System Error';
      default: return 'Unknown Status';
    }
  };

  if (isLoading) {
    return (
      <div className="global-station">
        <div className="text-center p-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading station...</span>
          </div>
          <h4>Loading Station...</h4>
          <p className="text-muted">Initializing global playback synchronization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="global-station">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Global Radio Station</h2>
            <div className="d-flex align-items-center">
              <div className="me-3">
                <small className={getHealthStatusColor()}>
                  {getHealthStatusText()}
                </small>
              </div>
              <div className="connection-status">
                <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Recovery Alert */}
      {showRecovery && (
        <Alert variant="info" className="mb-4">
          <FaSync className="me-2 fa-spin" />
          <strong>Recovery in Progress</strong>
          <p className="mb-0">Attempting to restore playback functionality...</p>
        </Alert>
      )}

      {/* Error Alert */}
      {error && !showRecovery && (
        <Alert variant="danger" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>Playback Error</strong>
          <p className="mb-2">{error}</p>
          <Button variant="outline-danger" onClick={handleManualRecovery}>
            <FaSync className="me-2" />
            Manual Recovery
          </Button>
        </Alert>
      )}

      {/* Station Info */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h4>Now Playing</h4>
              {currentSong ? (
                <div className="current-song-info">
                  <h5>{currentSong.title}</h5>
                  <p className="text-muted">{currentSong.artist}</p>
                  {currentPlaylist && (
                    <small className="text-muted">
                      From: {currentPlaylist.title}
                    </small>
                  )}
                </div>
              ) : (
                <p className="text-muted">No song currently playing</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>Sync Status</h5>
              <div className="sync-info">
                <div className="mb-2">
                  <small className="text-muted">Connection:</small>
                  <div>
                    <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Progress:</small>
                  <div>{progress.toFixed(1)}%</div>
                </div>
                <div>
                  <small className="text-muted">Position:</small>
                  <div>{Math.floor(currentTime / 1000)}s</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Global Audio Player */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Synchronized Player</h4>
              <small className="text-muted">
                All users hear the same song at the same time
              </small>
            </Card.Header>
            <Card.Body>
              <GlobalAudioPlayer stationId={stationId} user={user} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Health Details */}
      {healthStatus && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">System Health</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <h6>Playback State</h6>
                    <p className="mb-0">
                      <span className={`badge bg-${
                        healthStatus.checks.playbackState?.status === 'healthy' 
                          ? 'success' : 'danger'
                      }`}>
                        {healthStatus.checks.playbackState?.status || 'Unknown'}
                      </span>
                    </p>
                  </Col>
                  <Col md={4}>
                    <h6>Playlist</h6>
                    <p className="mb-0">
                      <span className={`badge bg-${
                        healthStatus.checks.playlist?.status === 'healthy' 
                          ? 'success' : 'warning'
                      }`}>
                        {healthStatus.checks.playlist?.status || 'Unknown'} 
                        {healthStatus.checks.playlist?.songCount && 
                          ` (${healthStatus.checks.playlist.songCount} songs)`
                        }
                      </span>
                    </p>
                  </Col>
                  <Col md={4}>
                    <h6>Current Song</h6>
                    <p className="mb-0">
                      <span className={`badge bg-${
                        healthStatus.checks.currentSong?.status === 'healthy' 
                          ? 'success' : 'danger'
                      }`}>
                        {healthStatus.checks.currentSong?.status || 'Unknown'}
                      </span>
                    </p>
                  </Col>
                </Row>
                {healthStatus.error && (
                  <div className="mt-3">
                    <Alert variant="danger" size="sm">
                      <strong>Error:</strong> {healthStatus.error}
                    </Alert>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default GlobalStation;
