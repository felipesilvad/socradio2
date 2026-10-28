// Try both import methods for compatibility
let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (error) {
  console.warn('Using fallback import method for createClient');
  createClient = require('@supabase/supabase-js').default;
}

// Supabase configuration for backend server
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mqsuyloykwyaneamqxhs.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc3V5bG95a3d5YW5lYW1xeGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTE4ODcsImV4cCI6MjA5MjY4Nzg4N30.vLrlePyMX8DSsASQXhay3uA1nd_RZiTlGN_rYqr7G1c';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
const db = {
  // Playlist operations
  async getPlaylists() {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addPlaylist(playlist) {
    const { data, error } = await supabase
      .from('playlists')
      .insert(playlist)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Song operations
  async getSongs() {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addSong(song) {
    const { data, error } = await supabase
      .from('songs')
      .insert(song)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User operations
  async getUser(uid) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async addUser(user) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Station operations
  async getStations() {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getStation(stationId) {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .eq('id', stationId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Message operations
  async getMessages(limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async addMessage(message) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Rating operations
  async addRating(rating) {
    const { data, error } = await supabase
      .from('ratings')
      .insert(rating)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRatings(songId) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('song_id', songId);
    
    if (error) throw error;
    return data;
  },

  // Song-Playlist operations
  async getSongPlaylists(playlistId) {
    const { data, error } = await supabase
      .from('song_playlists')
      .select(`
        *,
        songs(id, title, artist, cover, duration, lv, color)
      `)
      .eq('playlist_id', playlistId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data.map(item => ({
      ...item,
      song: item.songs
    }));
  },

  // Event Calendar operations
  async getEventCalendar() {
    const { data, error } = await supabase
      .from('event_calendar')
      .select(`
        *,
        playlists(id, title, img)
      `)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async addEvent(event) {
    const { data, error } = await supabase
      .from('event_calendar')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

module.exports = { supabase, db };
