const { db, supabase } = require('../supabase/supabase');

// Global Playback API
class GlobalPlaybackAPI {
  constructor() {
    this.syncIntervals = new Map(); // Store sync intervals for each station
    this.sseConnections = new Map(); // Store SSE connections
  }

  // Get current playback state for a station
  async getPlaybackState(stationId) {
    try {
      // Direct database query instead of RPC function
      const { data, error } = await supabase
        .from('global_playback_state')
        .select(`
          *,
          songs(id, title, artist, cover, duration),
          playlists(id, title)
        `)
        .eq('station_id', stationId)
        .single();

      if (error) throw error;

      if (!data) {
        // Initialize playback state if it doesn't exist
        await this.initializePlaybackState(stationId);
        return await this.getPlaybackState(stationId); // Retry after initialization
      }

      const playbackState = data;

      // Calculate current position and progress
      const currentTime = Math.max(0, Math.min(
        Date.now() - new Date(playbackState.song_start_time).getTime(),
        (playbackState.songs.duration || 180) * 1000
      ));

      const progress = playbackState.songs.duration > 0 
        ? (currentTime / (playbackState.songs.duration * 1000)) * 100 
        : 0;

      return {
        stationId,
        song: {
          id: playbackState.current_song_id,
          title: playbackState.songs.title,
          artist: playbackState.songs.artist,
          cover: playbackState.songs.cover,
          duration: (playbackState.songs.duration || 180) * 1000 // Convert to ms
        },
        playlist: {
          id: playbackState.current_playlist_id,
          title: playbackState.playlists.title
        },
        currentTime,
        progress,
        isPlaying: playbackState.is_playing,
        startTime: playbackState.song_start_time,
        nextSongTime: new Date(playbackState.song_start_time).getTime() + ((playbackState.songs.duration || 180) * 1000),
        serverTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting playback state:', error);
      return { error: 'Failed to get playback state', details: error.message };
    }
  }

  // Initialize playback state for a station
  async initializePlaybackState(stationId) {
    try {
      // Get first playlist for this station
      const { data: playlists, error: playlistError } = await supabase
        .from('station_playlists')
        .select(`
          playlist_id,
          playlists(id, title)
        `)
        .eq('station_id', stationId)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(1);

      if (playlistError) throw playlistError;

      if (!playlists || playlists.length === 0) {
        throw new Error('No active playlist found for station');
      }

      const playlistId = playlists[0].playlist_id;

      // Get first song from playlist
      const { data: songs, error: songError } = await supabase
        .from('song_playlists')
        .select(`
          song_id,
          songs(id, title, artist, cover, duration)
        `)
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: true })
        .limit(1);

      if (songError) throw songError;

      if (!songs || songs.length === 0) {
        throw new Error('No songs found in playlist');
      }

      const song = songs[0];

      // Create or update playback state
      const { error: stateError } = await supabase
        .from('global_playback_state')
        .upsert({
          station_id: stationId,
          current_song_id: song.song_id,
          current_playlist_id: playlistId,
          current_song_index: 0,
          song_start_time: new Date().toISOString(),
          current_position_ms: 0,
          is_playing: true,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'station_id'
        });

      if (stateError) throw stateError;

      return true;
    } catch (error) {
      console.error('Error initializing playback state:', error);
      throw error;
    }
  }

  // Advance to next song in playlist
  async advanceToNextSong(stationId) {
    try {
      const { data, error } = await supabase
        .rpc('advance_to_next_song', { p_station_id: stationId });

      if (error) throw error;

      // Notify all connected clients
      this.broadcastStateChange(stationId);

      return data;
    } catch (error) {
      console.error('Error advancing song:', error);
      throw error;
    }
  }

  // Update playback state (play/pause, seek)
  async updatePlaybackState(stationId, updates) {
    try {
      const { error } = await supabase
        .from('global_playback_state')
        .upsert({
          station_id: stationId,
          ...updates,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'station_id'
        });

      if (error) throw error;

      // Notify all connected clients
      this.broadcastStateChange(stationId);

      return true;
    } catch (error) {
      console.error('Error updating playback state:', error);
      throw error;
    }
  }

  // Get full playlist for a station
  async getStationPlaylist(stationId) {
    try {
      const { data: playlistData, error } = await supabase
        .from('station_playlists')
        .select(`
          playlist_id,
          playlists(id, title, img)
        `)
        .eq('station_id', stationId)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!playlistData || playlistData.length === 0) {
        return null;
      }

      const playlist = playlistData[0].playlists;

      // Get all songs in playlist
      const { data: songs, error: songError } = await supabase
        .from('song_playlists')
        .select(`
          song_id,
          songs(id, title, artist, cover, duration, lv, color)
        `)
        .eq('playlist_id', playlist.id)
        .order('created_at', { ascending: true });

      if (songError) throw songError;

      return {
        ...playlist,
        songs: songs.map(item => item.songs)
      };
    } catch (error) {
      console.error('Error getting station playlist:', error);
      throw error;
    }
  }

  // Register client sync session
  async registerSyncSession(sessionId, userId, stationId) {
    try {
      const { error } = await supabase
        .from('client_sync_sessions')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          station_id: stationId,
          last_sync_time: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'session_id'
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error registering sync session:', error);
      throw error;
    }
  }

  // Update client sync session
  async updateSyncSession(sessionId, clientOffsetMs = 0) {
    try {
      const { error } = await supabase
        .from('client_sync_sessions')
        .update({
          last_sync_time: new Date().toISOString(),
          client_offset_ms: clientOffsetMs,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating sync session:', error);
      throw error;
    }
  }

  // Clean up inactive sync sessions
  async cleanupSyncSessions() {
    try {
      const { error } = await supabase
        .from('client_sync_sessions')
        .update({ is_active: false })
        .lt('last_sync_time', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutes ago

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error cleaning up sync sessions:', error);
      throw error;
    }
  }

  // Server-Sent Events for real-time updates
  createSSEEndpoint(stationId, res) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    };

    res.writeHead(200, headers);

    const clientId = Date.now() + '-' + Math.random();
    
    // Store connection
    if (!this.sseConnections.has(stationId)) {
      this.sseConnections.set(stationId, new Map());
    }
    this.sseConnections.get(stationId).set(clientId, res);

    // Send initial state
    this.sendStateUpdate(stationId, clientId);

    // Send periodic sync updates
    const syncInterval = setInterval(() => {
      this.sendStateUpdate(stationId, clientId);
    }, 5000); // Every 5 seconds

    // Clean up on disconnect
    res.on('close', () => {
      clearInterval(syncInterval);
      if (this.sseConnections.has(stationId)) {
        this.sseConnections.get(stationId).delete(clientId);
        if (this.sseConnections.get(stationId).size === 0) {
          this.sseConnections.delete(stationId);
        }
      }
    });

    return clientId;
  }

  // Send state update to specific client
  async sendStateUpdate(stationId, clientId) {
    try {
      const state = await this.getPlaybackState(stationId);
      const connections = this.sseConnections.get(stationId);
      
      if (connections && connections.has(clientId)) {
        const res = connections.get(clientId);
        const data = `data: ${JSON.stringify(state)}\n\n`;
        res.write(data);
      }
    } catch (error) {
      console.error('Error sending state update:', error);
    }
  }

  // Broadcast state change to all clients
  async broadcastStateChange(stationId) {
    try {
      const state = await this.getPlaybackState(stationId);
      const connections = this.sseConnections.get(stationId);
      
      if (connections) {
        const data = `data: ${JSON.stringify(state)}\n\n`;
        connections.forEach(res => {
          try {
            res.write(data);
          } catch (error) {
            console.error('Error broadcasting to client:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error broadcasting state change:', error);
    }
  }

  // Start automatic song advancement
  startAutoAdvancement(stationId) {
    if (this.syncIntervals.has(stationId)) {
      clearInterval(this.syncIntervals.get(stationId));
    }

    const interval = setInterval(async () => {
      try {
        const state = await this.getPlaybackState(stationId);
        
        // Check if song should advance
        if (state.currentTime >= state.song.duration) {
          await this.advanceToNextSong(stationId);
        }
      } catch (error) {
        console.error('Error in auto advancement:', error);
      }
    }, 1000); // Check every second

    this.syncIntervals.set(stationId, interval);
  }

  // Stop automatic song advancement
  stopAutoAdvancement(stationId) {
    if (this.syncIntervals.has(stationId)) {
      clearInterval(this.syncIntervals.get(stationId));
      this.syncIntervals.delete(stationId);
    }
  }

  // Get playback history
  async getPlaybackHistory(stationId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('playback_history')
        .select(`
          *,
          songs(id, title, artist, cover),
          playlists(id, title)
        `)
        .eq('station_id', stationId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting playback history:', error);
      throw error;
    }
  }
}

module.exports = new GlobalPlaybackAPI();
