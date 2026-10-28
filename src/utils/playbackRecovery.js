import globalPlaybackAPI from '../api/globalPlayback';

// Playback recovery and edge case handling utilities
class PlaybackRecovery {
  constructor() {
    this.recoveryAttempts = new Map(); // Track recovery attempts per station
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  // Handle server restart recovery
  async handleServerRestart(stationId) {
    console.log(`Attempting server restart recovery for station ${stationId}`);
    
    try {
      // Check if playback state exists
      const state = await globalPlaybackAPI.getPlaybackState(stationId);
      
      if (!state || !state.song) {
        // Initialize playback state if it doesn't exist
        await this.initializeStation(stationId);
      }
      
      return true;
    } catch (error) {
      console.error('Server restart recovery failed:', error);
      return false;
    }
  }

  // Handle empty playlist
  async handleEmptyPlaylist(stationId) {
    console.log(`Handling empty playlist for station ${stationId}`);
    
    try {
      // Get all available playlists
      const { data: playlists, error } = await globalPlaybackAPI.supabase
        .from('playlists')
        .select('*')
        .limit(1);

      if (error) throw error;

      if (!playlists || playlists.length === 0) {
        // Create a default playlist with available songs
        await this.createDefaultPlaylist(stationId);
      } else {
        // Assign first available playlist to station
        await this.assignPlaylistToStation(stationId, playlists[0].id);
      }

      return true;
    } catch (error) {
      console.error('Empty playlist recovery failed:', error);
      return false;
    }
  }

  // Handle song duration mismatch
  async handleDurationMismatch(stationId, songId, expectedDuration) {
    console.log(`Handling duration mismatch for song ${songId} on station ${stationId}`);
    
    try {
      // Update song duration in database
      const { error } = await globalPlaybackAPI.supabase
        .from('songs')
        .update({ duration: expectedDuration / 1000 }) // Convert to seconds
        .eq('id', songId);

      if (error) throw error;

      // Force refresh playback state
      await globalPlaybackAPI.broadcastStateChange(stationId);

      return true;
    } catch (error) {
      console.error('Duration mismatch recovery failed:', error);
      return false;
    }
  }

  // Initialize station with default settings
  async initializeStation(stationId) {
    try {
      // Check if station exists
      const { error: stationError } = await globalPlaybackAPI.supabase
        .from('stations')
        .select('id')
        .eq('id', stationId)
        .single();

      if (stationError) throw stationError;

      // Create default playlist if needed
      await this.ensureDefaultPlaylist(stationId);

      // Initialize playback state
      await globalPlaybackAPI.initializePlaybackState(stationId);

      console.log(`Station ${stationId} initialized successfully`);
      return true;
    } catch (error) {
      console.error('Station initialization failed:', error);
      return false;
    }
  }

  // Ensure default playlist exists
  async ensureDefaultPlaylist(stationId) {
    try {
      // Check if station has active playlists
      const { data: stationPlaylists, error } = await globalPlaybackAPI.supabase
        .from('station_playlists')
        .select('*')
        .eq('station_id', stationId)
        .eq('is_active', true);

      if (error) throw error;

      if (stationPlaylists && stationPlaylists.length > 0) {
        return true; // Playlist already exists
      }

      // Create default playlist
      const { data: playlist, error: playlistError } = await globalPlaybackAPI.supabase
        .from('playlists')
        .insert({
          title: `${stationId} Default Playlist`,
          img: 'https://picsum.photos/300/300?random=default',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (playlistError) throw playlistError;

      // Add some songs to the playlist
      await this.addSongsToPlaylist(playlist.id);

      // Assign playlist to station
      await globalPlaybackAPI.supabase
        .from('station_playlists')
        .insert({
          station_id: stationId,
          playlist_id: playlist.id,
          is_active: true,
          priority: 1,
          created_at: new Date().toISOString()
        });

      return true;
    } catch (error) {
      console.error('Failed to ensure default playlist:', error);
      return false;
    }
  }

  // Add songs to playlist
  async addSongsToPlaylist(playlistId) {
    try {
      // Get some available songs
      const { data: songs, error } = await globalPlaybackAPI.supabase
        .from('songs')
        .select('*')
        .limit(10)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!songs || songs.length === 0) {
        // Create some default songs
        await this.createDefaultSongs(playlistId);
        return;
      }

      // Add songs to playlist
      const songPlaylists = songs.map(song => ({
        playlist_id: playlistId,
        song_id: song.id,
        created_at: new Date().toISOString()
      }));

      await globalPlaybackAPI.supabase
        .from('song_playlists')
        .insert(songPlaylists);

    } catch (error) {
      console.error('Failed to add songs to playlist:', error);
    }
  }

  // Create default songs
  async createDefaultSongs(playlistId) {
    const defaultSongs = [
      {
        title: 'Welcome Song',
        artist: 'Socradio',
        cover: 'https://picsum.photos/200/200?random=welcome',
        duration: 180, // 3 minutes
        lv: 1,
        main: true,
        color: '#007bff'
      },
      {
        title: 'System Check',
        artist: 'Socradio',
        cover: 'https://picsum.photos/200/200?random=system',
        duration: 120, // 2 minutes
        lv: 1,
        main: true,
        color: '#28a745'
      }
    ];

    try {
      const { data: createdSongs, error } = await globalPlaybackAPI.supabase
        .from('songs')
        .insert(defaultSongs)
        .select();

      if (error) throw error;

      // Add to playlist
      const songPlaylists = createdSongs.map(song => ({
        playlist_id: playlistId,
        song_id: song.id,
        created_at: new Date().toISOString()
      }));

      await globalPlaybackAPI.supabase
        .from('song_playlists')
        .insert(songPlaylists);

    } catch (error) {
      console.error('Failed to create default songs:', error);
    }
  }

  // Assign playlist to station
  async assignPlaylistToStation(stationId, playlistId) {
    try {
      await globalPlaybackAPI.supabase
        .from('station_playlists')
        .upsert({
          station_id: stationId,
          playlist_id: playlistId,
          is_active: true,
          priority: 1,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'station_id,playlist_id'
        });

      return true;
    } catch (error) {
      console.error('Failed to assign playlist to station:', error);
      return false;
    }
  }

  // Handle client desynchronization
  async handleClientDesync(stationId, sessionId, clientReportedTime) {
    try {
      // Get server time
      const serverTime = Date.now();
      const timeDiff = clientReportedTime - serverTime;

      console.log(`Client desync detected: ${timeDiff}ms difference`);

      // Update client sync session with drift
      await globalPlaybackAPI.updateSyncSession(sessionId, timeDiff);

      // Force state update to client
      await globalPlaybackAPI.broadcastStateChange(stationId);

      return true;
    } catch (error) {
      console.error('Failed to handle client desync:', error);
      return false;
    }
  }

  // Recovery with retry logic
  async recoverWithRetry(stationId, recoveryFunction, context = '') {
    const attemptKey = `${stationId}-${context}`;
    const currentAttempts = this.recoveryAttempts.get(attemptKey) || 0;

    if (currentAttempts >= this.maxRetries) {
      console.error(`Max recovery attempts reached for ${attemptKey}`);
      return false;
    }

    try {
      const result = await recoveryFunction();
      
      if (result) {
        // Success - reset attempts
        this.recoveryAttempts.delete(attemptKey);
        return true;
      }
    } catch (error) {
      console.error(`Recovery attempt ${currentAttempts + 1} failed for ${attemptKey}:`, error);
    }

    // Increment attempts and schedule retry
    this.recoveryAttempts.set(attemptKey, currentAttempts + 1);
    
    setTimeout(() => {
      this.recoverWithRetry(stationId, recoveryFunction, context);
    }, this.retryDelay * (currentAttempts + 1)); // Exponential backoff

    return false;
  }

  // Comprehensive health check
  async performHealthCheck(stationId) {
    const healthReport = {
      stationId,
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      // Check playback state
      const state = await globalPlaybackAPI.getPlaybackState(stationId);
      healthReport.checks.playbackState = {
        status: state ? 'healthy' : 'missing',
        data: state
      };

      // Check playlist
      const playlist = await globalPlaybackAPI.getStationPlaylist(stationId);
      healthReport.checks.playlist = {
        status: playlist && playlist.songs?.length > 0 ? 'healthy' : 'empty',
        songCount: playlist?.songs?.length || 0
      };

      // Check current song
      if (state?.song) {
        healthReport.checks.currentSong = {
          status: 'healthy',
          songId: state.song.id,
          title: state.song.title
        };
      } else {
        healthReport.checks.currentSong = {
          status: 'missing'
        };
      }

      // Overall health
      healthReport.overallHealth = Object.values(healthReport.checks).every(
        check => check.status === 'healthy'
      ) ? 'healthy' : 'unhealthy';

    } catch (error) {
      healthReport.error = error.message;
      healthReport.overallHealth = 'error';
    }

    return healthReport;
  }

  // Auto-recovery based on health check
  async autoRecover(stationId) {
    const healthReport = await this.performHealthCheck(stationId);
    
    console.log(`Health check for station ${stationId}:`, healthReport);

    if (healthReport.overallHealth === 'healthy') {
      return true;
    }

    // Attempt recovery based on issues found
    const recoveryActions = [];

    if (healthReport.checks.playbackState?.status === 'missing') {
      recoveryActions.push(() => this.handleServerRestart(stationId));
    }

    if (healthReport.checks.playlist?.status === 'empty') {
      recoveryActions.push(() => this.handleEmptyPlaylist(stationId));
    }

    if (healthReport.checks.currentSong?.status === 'missing') {
      recoveryActions.push(() => this.initializeStation(stationId));
    }

    // Execute recovery actions
    for (const action of recoveryActions) {
      const success = await this.recoverWithRetry(stationId, action, 'auto-recovery');
      if (!success) {
        console.error('Auto-recovery failed for station:', stationId);
        return false;
      }
    }

    console.log('Auto-recovery successful for station:', stationId);
    return true;
  }
}

const playbackRecovery = new PlaybackRecovery();
export default playbackRecovery;
