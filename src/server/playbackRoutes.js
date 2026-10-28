const express = require('express');
const router = express.Router();
const globalPlaybackAPI = require('../../src/api/globalPlayback');

// Get current playback state for a station
router.get('/state/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const state = await globalPlaybackAPI.getPlaybackState(stationId);
    res.json(state);
  } catch (error) {
    console.error('Error getting playback state:', error);
    res.status(500).json({ error: 'Failed to get playback state' });
  }
});

// Get playback state by station name (easier for testing)
router.get('/state-by-name/:stationName', async (req, res) => {
  try {
    const { stationName } = req.params;
    
    // Get station ID by name
    const { supabase } = require('../supabase/supabase');
    const { data: station, error } = await supabase
      .from('stations')
      .select('id')
      .eq('name', stationName)
      .single();
    
    if (error || !station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    const state = await globalPlaybackAPI.getPlaybackState(station.id);
    res.json(state);
  } catch (error) {
    console.error('Error getting playback state by name:', error);
    res.status(500).json({ error: 'Failed to get playback state' });
  }
});

// Get full playlist for a station
router.get('/playlist/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const playlist = await globalPlaybackAPI.getStationPlaylist(stationId);
    res.json(playlist);
  } catch (error) {
    console.error('Error getting playlist:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

// Initialize playback state for a station
router.post('/initialize/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    await globalPlaybackAPI.initializePlaybackState(stationId);
    res.json({ success: true, message: 'Playback state initialized' });
  } catch (error) {
    console.error('Error initializing playback state:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize playback state' });
  }
});

// Advance to next song
router.post('/advance/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    await globalPlaybackAPI.advanceToNextSong(stationId);
    res.json({ success: true, message: 'Advanced to next song' });
  } catch (error) {
    console.error('Error advancing song:', error);
    res.status(500).json({ error: 'Failed to advance song' });
  }
});

// Update playback state (play/pause)
router.put('/state/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const { isPlaying, currentTime } = req.body;
    
    const updates = {};
    if (typeof isPlaying === 'boolean') {
      updates.is_playing = isPlaying;
    }
    if (typeof currentTime === 'number') {
      updates.current_position_ms = currentTime;
      // If seeking, update start time to maintain sync
      updates.song_start_time = new Date(Date.now() - currentTime).toISOString();
    }

    await globalPlaybackAPI.updatePlaybackState(stationId, updates);
    res.json({ success: true, message: 'Playback state updated' });
  } catch (error) {
    console.error('Error updating playback state:', error);
    res.status(500).json({ error: 'Failed to update playback state' });
  }
});

// Register client sync session
router.post('/sync/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const { sessionId, userId, clientOffsetMs } = req.body;
    
    await globalPlaybackAPI.registerSyncSession(sessionId, userId, stationId);
    
    if (typeof clientOffsetMs === 'number') {
      await globalPlaybackAPI.updateSyncSession(sessionId, clientOffsetMs);
    }
    
    res.json({ success: true, message: 'Sync session registered' });
  } catch (error) {
    console.error('Error registering sync session:', error);
    res.status(500).json({ error: 'Failed to register sync session' });
  }
});

// Update sync session with clock drift
router.put('/sync/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { clientOffsetMs } = req.body;
    
    await globalPlaybackAPI.updateSyncSession(sessionId, clientOffsetMs);
    res.json({ success: true, message: 'Sync session updated' });
  } catch (error) {
    console.error('Error updating sync session:', error);
    res.status(500).json({ error: 'Failed to update sync session' });
  }
});

// Server-Sent Events endpoint for real-time updates
router.get('/stream/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const clientId = globalPlaybackAPI.createSSEEndpoint(stationId, res);
    
    // Start auto-advancement if not already running
    globalPlaybackAPI.startAutoAdvancement(stationId);
    
    console.log(`SSE client ${clientId} connected to station ${stationId}`);
  } catch (error) {
    console.error('Error setting up SSE:', error);
    res.status(500).json({ error: 'Failed to set up real-time updates' });
  }
});

// Get playback history
router.get('/history/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const { limit = 50 } = req.query;
    const history = await globalPlaybackAPI.getPlaybackHistory(stationId, parseInt(limit));
    res.json(history);
  } catch (error) {
    console.error('Error getting playback history:', error);
    res.status(500).json({ error: 'Failed to get playback history' });
  }
});

// Clean up inactive sessions (admin endpoint)
router.post('/cleanup', async (req, res) => {
  try {
    await globalPlaybackAPI.cleanupSyncSessions();
    res.json({ success: true, message: 'Inactive sessions cleaned up' });
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    res.status(500).json({ error: 'Failed to clean up sessions' });
  }
});

// Manual sync trigger (for testing/recovery)
router.post('/manual-sync/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    await globalPlaybackAPI.broadcastStateChange(stationId);
    res.json({ success: true, message: 'Manual sync triggered' });
  } catch (error) {
    console.error('Error triggering manual sync:', error);
    res.status(500).json({ error: 'Failed to trigger manual sync' });
  }
});

module.exports = router;
