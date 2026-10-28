import { useState, useEffect, useRef, useCallback } from 'react';
import globalPlaybackAPI from '../api/globalPlayback';

// Global Playback Hook for synchronized playback
export const useGlobalPlayback = (stationId, userId = null) => {
  const [playbackState, setPlaybackState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs for synchronization
  const eventSourceRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const sessionIdRef = useRef(null);
  const clockDriftRef = useRef(0);
  
  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Calculate clock drift
  const calculateClockDrift = useCallback((serverTime) => {
    const localTime = Date.now();
    const drift = localTime - new Date(serverTime).getTime();
    clockDriftRef.current = drift;
    return drift;
  }, []);

  // Get compensated current time
  const getCompensatedTime = useCallback(() => {
    return Date.now() - clockDriftRef.current;
  }, []);

  // Calculate current playback position
  const calculateCurrentPosition = useCallback((startTime, duration) => {
    const compensatedTime = getCompensatedTime();
    const elapsed = compensatedTime - new Date(startTime).getTime();
    return Math.max(0, Math.min(elapsed, duration));
  }, [getCompensatedTime]);

  // Register sync session
  const registerSyncSession = useCallback(async () => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
    }

    try {
      await globalPlaybackAPI.registerSyncSession(
        sessionIdRef.current,
        userId,
        stationId
      );
    } catch (error) {
      console.error('Failed to register sync session:', error);
    }
  }, [generateSessionId, userId, stationId]);

  // Update sync session with clock drift
  const updateSyncSession = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      await globalPlaybackAPI.updateSyncSession(
        sessionIdRef.current,
        clockDriftRef.current
      );
    } catch (error) {
      console.error('Failed to update sync session:', error);
    }
  }, []);

  // Fetch initial playback state
  const fetchPlaybackState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const state = await globalPlaybackAPI.getPlaybackState(stationId);
      
      // Calculate clock drift
      if (state.serverTime) {
        calculateClockDrift(state.serverTime);
      }
      
      // Calculate current position with drift compensation
      if (state.startTime && state.song?.duration) {
        state.currentTime = calculateCurrentPosition(
          state.startTime,
          state.song.duration
        );
        state.progress = (state.currentTime / state.song.duration) * 100;
      }
      
      setPlaybackState(state);
      setIsLoading(false);
      
      // Register sync session
      await registerSyncSession();
      
    } catch (error) {
      console.error('Failed to fetch playback state:', error);
      setError(error.message || 'Failed to load playback state');
      setIsLoading(false);
    }
  }, [stationId, calculateClockDrift, calculateCurrentPosition, registerSyncSession]);

  // Setup Server-Sent Events for real-time updates
  const setupSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `${process.env.REACT_APP_API_URL || ''}/api/playback/stream/${stationId}`
    );

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const newState = JSON.parse(event.data);
        
        // Update clock drift
        if (newState.serverTime) {
          calculateClockDrift(newState.serverTime);
        }
        
        // Calculate current position with drift compensation
        if (newState.startTime && newState.song?.duration) {
          newState.currentTime = calculateCurrentPosition(
            newState.startTime,
            newState.song.duration
          );
          newState.progress = (newState.currentTime / newState.song.duration) * 100;
        }
        
        setPlaybackState(newState);
        setIsLoading(false);
        setError(null);
        
        // Update sync session periodically
        updateSyncSession();
        
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
      
      // Attempt to reconnect after delay
      setTimeout(() => {
        if (eventSourceRef.current === eventSource) {
          setupSSE();
        }
      }, 5000);
    };

    eventSourceRef.current = eventSource;
  }, [stationId, calculateClockDrift, calculateCurrentPosition, updateSyncSession]);

  // Periodic sync to prevent drift
  const startPeriodicSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(async () => {
      try {
        // Fetch fresh state to resync
        await fetchPlaybackState();
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, 30000); // Every 30 seconds
  }, [fetchPlaybackState]);

  // Control functions
  const play = useCallback(async () => {
    try {
      await globalPlaybackAPI.updatePlaybackState(stationId, {
        isPlaying: true
      });
    } catch (error) {
      console.error('Failed to play:', error);
      setError(error.message || 'Failed to play');
    }
  }, [stationId]);

  const pause = useCallback(async () => {
    try {
      await globalPlaybackAPI.updatePlaybackState(stationId, {
        isPlaying: false
      });
    } catch (error) {
      console.error('Failed to pause:', error);
      setError(error.message || 'Failed to pause');
    }
  }, [stationId]);

  const seek = useCallback(async (position) => {
    try {
      await globalPlaybackAPI.updatePlaybackState(stationId, {
        currentTime: position
      });
    } catch (error) {
      console.error('Failed to seek:', error);
      setError(error.message || 'Failed to seek');
    }
  }, [stationId]);

  const nextSong = useCallback(async () => {
    try {
      await globalPlaybackAPI.advanceToNextSong(stationId);
    } catch (error) {
      console.error('Failed to advance song:', error);
      setError(error.message || 'Failed to advance song');
    }
  }, [stationId]);

  const initialize = useCallback(async () => {
    try {
      await globalPlaybackAPI.initializePlaybackState(stationId);
      await fetchPlaybackState();
    } catch (error) {
      console.error('Failed to initialize playback:', error);
      setError(error.message || 'Failed to initialize playback');
    }
  }, [stationId, fetchPlaybackState]);

  // Setup on mount
  useEffect(() => {
    if (!stationId) return;

    fetchPlaybackState();
    setupSSE();
    startPeriodicSync();

    return () => {
      // Cleanup
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [stationId, fetchPlaybackState, setupSSE, startPeriodicSync]);

  // Update playback position in real-time
  useEffect(() => {
    if (!playbackState || !playbackState.isPlaying) return;

    const interval = setInterval(() => {
      setPlaybackState(prev => {
        if (!prev || !prev.song || !prev.startTime) return prev;

        const currentTime = calculateCurrentPosition(
          prev.startTime,
          prev.song.duration
        );
        
        // Check if song should advance (client-side check)
        if (currentTime >= prev.song.duration) {
          // Let server handle advancement, just update state
          return {
            ...prev,
            currentTime: prev.song.duration,
            progress: 100
          };
        }

        return {
          ...prev,
          currentTime,
          progress: (currentTime / prev.song.duration) * 100
        };
      });
    }, 100); // Update every 100ms for smooth playback

    return () => clearInterval(interval);
  }, [playbackState, playbackState?.isPlaying, calculateCurrentPosition]);

  return {
    // State
    playbackState,
    isConnected,
    isLoading,
    error,
    
    // Computed values
    currentSong: playbackState?.song,
    currentPlaylist: playbackState?.playlist,
    currentTime: playbackState?.currentTime || 0,
    progress: playbackState?.progress || 0,
    isPlaying: playbackState?.isPlaying || false,
    
    // Control functions
    play,
    pause,
    seek,
    nextSong,
    initialize,
    
    // Sync info
    clockDrift: clockDriftRef.current,
    sessionId: sessionIdRef.current,
    
    // Utilities
    refresh: fetchPlaybackState,
    getCompensatedTime
  };
};
