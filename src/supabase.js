import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  currentUser: () => supabase.auth.getUser(),
  onAuthStateChanged: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Users
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles(role)
      `)
    
    if (error) throw error
    return data
  },

  getUser: async (uid) => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles(role)
      `)
      .eq('uid', uid)
      .single()
    
    if (error) throw error
    return data
  },

  updateUser: async (uid, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('uid', uid)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateUserRoles: async (uid, roles) => {
    // First get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('uid', uid)
      .single()
    
    if (!user) throw new Error('User not found')
    
    // Delete existing roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', user.id)
    
    // Insert new roles
    if (roles.length > 0) {
      const roleData = roles.map(role => ({
        user_id: user.id,
        role: role
      }))
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert(roleData)
        .select()
      
      if (error) throw error
      return data
    }
    
    return []
  },

  // Songs
  getSongs: async (filters = {}) => {
    let query = supabase.from('songs').select('*')
    
    if (filters.title) {
      query = query.eq('title', filters.title)
    }
    
    if (filters.main !== undefined) {
      query = query.eq('main', filters.main)
    }
    
    if (filters.lv_min !== undefined) {
      query = query.gte('lv', filters.lv_min)
    }
    
    if (filters.lv_max !== undefined) {
      query = query.lte('lv', filters.lv_max)
    }
    
    if (filters.playlist) {
      query = query.select(`
        *,
        song_playlists!inner(
          playlist_id
        )
      `).eq('song_playlists.playlist_id', filters.playlist)
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  getSongsWithPlaylists: async (filters = {}) => {
    let query = supabase.from('songs').select(`
      *,
      song_playlists(
        playlist_id,
        playlists(id, title)
      )
    `)
    
    if (filters.title) {
      query = query.eq('title', filters.title)
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    // Transform the data to match the expected format
    return data.map(song => ({
      ...song,
      playlists: song.song_playlists.map(sp => sp.playlist_id)
    }))
  },

  updateSongPlaylists: async (songId, playlists) => {
    // Delete existing playlist associations
    await supabase
      .from('song_playlists')
      .delete()
      .eq('song_id', songId)
    
    // Insert new playlist associations
    if (playlists.length > 0) {
      const playlistData = playlists.map(playlistId => ({
        song_id: songId,
        playlist_id: playlistId
      }))
      
      const { data, error } = await supabase
        .from('song_playlists')
        .insert(playlistData)
        .select()
      
      if (error) throw error
      return data
    }
    
    return []
  },

  updateSongColor: async (fromColor, toColor) => {
    const { data, error } = await supabase
      .from('songs')
      .update({ color: toColor })
      .eq('color', fromColor)
      .select()
    
    if (error) throw error
    return data
  },

  // Playlists
  getPlaylists: async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
    
    if (error) throw error
    return data
  },

  // Messages
  getMessages: async (limit = 15) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  addMessage: async (message) => {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Ratings
  getSongRatings: async (songId) => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('song_id', songId)
    
    if (error) throw error
    return data
  },

  addRating: async (songId, userUid, rating) => {
    const { data, error } = await supabase
      .from('ratings')
      .upsert({
        song_id: songId,
        user_uid: userUid,
        rating: rating
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Stations
  getStation: async (stationName) => {
    const { data, error } = await supabase
      .from('stations')
      .select(`
        *,
        playlists!stations_current_playlist_id_fkey(title)
      `)
      .eq('name', stationName)
      .single()
    
    if (error) throw error
    return data
  },

  updateStation: async (stationName, updates) => {
    const { data, error } = await supabase
      .from('stations')
      .update(updates)
      .eq('name', stationName)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Event Calendar
  getEvents: async () => {
    const { data, error } = await supabase
      .from('event_calendar')
      .select(`
        *,
        playlists(title)
      `)
      .order('start_time', { ascending: true })
    
    if (error) throw error
    return data
  },

  addEvent: async (playlistId, startTime) => {
    const { data, error } = await supabase
      .from('event_calendar')
      .insert({
        playlist_id: playlistId,
        start_time: startTime
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to user data changes
  subscribeToUser: (uid, callback) => {
    return supabase
      .channel(`user-${uid}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users',
          filter: `uid=eq.${uid}`
        }, 
        callback
      )
      .subscribe()
  },

  // Subscribe to user roles changes
  subscribeToUserRoles: (uid, callback) => {
    return supabase
      .channel(`user-roles-${uid}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles',
          filter: `user_id=eq.(SELECT id FROM users WHERE uid=eq.${uid})`
        }, 
        callback
      )
      .subscribe()
  },

  // Subscribe to messages
  subscribeToMessages: (callback) => {
    return supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        callback
      )
      .subscribe()
  },

  // Subscribe to station changes
  subscribeToStation: (stationName, callback) => {
    return supabase
      .channel(`station-${stationName}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'stations',
          filter: `name=eq.${stationName}`
        }, 
        callback
      )
      .subscribe()
  },

  // Subscribe to playlist changes
  subscribeToPlaylist: (playlistId, callback) => {
    return supabase
      .channel(`playlist-${playlistId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'playlists',
          filter: `id=eq.${playlistId}`
        }, 
        callback
      )
      .subscribe()
  },

  // Subscribe to song ratings
  subscribeToRatings: (songId, callback) => {
    return supabase
      .channel(`ratings-${songId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ratings',
          filter: `song_id=eq.${songId}`
        }, 
        callback
      )
      .subscribe()
  },

  // Unsubscribe from all channels
  unsubscribeAll: () => {
    supabase.removeAllChannels()
  }
}
