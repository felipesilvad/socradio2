-- Global Playback State Schema for Socradio2
-- This schema enables synchronized playback across all users

-- Global playback state table (single source of truth)
CREATE TABLE global_playback_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
    current_song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
    current_playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    current_song_index INTEGER DEFAULT 0,
    song_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    current_position_ms INTEGER DEFAULT 0, -- Current position in milliseconds
    is_playing BOOLEAN DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one playback state per station
    UNIQUE(station_id)
);

-- Playback history for analytics and recovery
CREATE TABLE playback_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
    playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER, -- Actual duration played
    listeners_count INTEGER DEFAULT 0, -- Peak listeners during this song
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client synchronization tracking
CREATE TABLE client_sync_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL, -- Client session identifier
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
    last_sync_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_offset_ms INTEGER DEFAULT 0, -- Clock drift compensation
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Station playlists (curated lists for each station)
CREATE TABLE station_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority = more likely to play
    shuffle_order INTEGER DEFAULT 0, -- For shuffled playback
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(station_id, playlist_id)
);

-- Indexes for performance
CREATE INDEX idx_global_playback_state_station ON global_playback_state(station_id);
CREATE INDEX idx_global_playback_state_updated ON global_playback_state(last_updated);
CREATE INDEX idx_playback_history_station_time ON playback_history(station_id, started_at DESC);
CREATE INDEX idx_client_sync_sessions_active ON client_sync_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_station_playlists_active ON station_playlists(station_id, is_active) WHERE is_active = true;

-- Row Level Security Policies
ALTER TABLE global_playback_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view playback state" ON global_playback_state
    FOR SELECT USING (true);

ALTER TABLE playback_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view playback history" ON global_playback_state
    FOR SELECT USING (true);

ALTER TABLE client_sync_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sync sessions" ON client_sync_sessions
    FOR ALL USING (user_id IN (SELECT id FROM users WHERE uid = auth.uid()::text));

-- Function to get current playback state with calculated position
CREATE OR REPLACE FUNCTION get_current_playback_state(p_station_id UUID)
RETURNS TABLE (
    song_id UUID,
    song_title VARCHAR,
    song_artist VARCHAR,
    song_cover TEXT,
    song_duration_ms INTEGER,
    playlist_id UUID,
    playlist_title VARCHAR,
    current_position_ms INTEGER,
    progress_percentage NUMERIC,
    is_playing BOOLEAN,
    song_start_time TIMESTAMP WITH TIME ZONE,
    next_song_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as song_id,
        s.title as song_title,
        s.artist as song_artist,
        s.cover as song_cover,
        -- Convert duration to milliseconds (assuming duration is stored in seconds)
        COALESCE(s.duration * 1000, 180000) as song_duration_ms,
        p.id as playlist_id,
        p.title as playlist_title,
        -- Calculate current position
        GREATEST(0, LEAST(
            EXTRACT(EPOCH FROM (NOW() - gps.song_start_time)) * 1000,
            COALESCE(s.duration * 1000, 180000)
        ))::INTEGER as current_position_ms,
        -- Calculate progress percentage
        CASE 
            WHEN COALESCE(s.duration, 0) > 0 THEN
                (EXTRACT(EPOCH FROM (NOW() - gps.song_start_time)) / s.duration) * 100
            ELSE 0
        END as progress_percentage,
        gps.is_playing,
        gps.song_start_time,
        -- Calculate when next song starts
        gps.song_start_time + (COALESCE(s.duration, 180) || ' seconds')::INTERVAL as next_song_time
    FROM global_playback_state gps
    LEFT JOIN songs s ON gps.current_song_id = s.id
    LEFT JOIN playlists p ON gps.current_playlist_id = p.id
    WHERE gps.station_id = p_station_id;
END;
$$ LANGUAGE plpgsql;

-- Function to advance to next song in playlist
CREATE OR REPLACE FUNCTION advance_to_next_song(p_station_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_state RECORD;
    next_song UUID;
    playlist_songs UUID[];
    current_index INTEGER;
BEGIN
    -- Get current playback state
    SELECT * INTO current_state 
    FROM global_playback_state 
    WHERE station_id = p_station_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Get songs in current playlist
    SELECT array_agg(song_id ORDER BY song_order) INTO playlist_songs
    FROM (
        SELECT sp.song_id, ROW_NUMBER() OVER (ORDER BY sp.created_at) as song_order
        FROM song_playlists sp
        WHERE sp.playlist_id = current_state.current_playlist_id
    ) ordered_songs;
    
    IF playlist_songs IS NULL OR array_length(playlist_songs, 1) = 0 THEN
        RETURN false;
    END IF;
    
    -- Find current song index
    current_index := current_state.current_song_index;
    
    -- Calculate next song index (with wrap-around)
    current_index := (current_index + 1) % array_length(playlist_songs, 1);
    next_song := playlist_songs[current_index + 1]; -- +1 because array is 1-based
    
    -- Update playback state
    UPDATE global_playback_state SET
        current_song_id = next_song,
        current_song_index = current_index,
        song_start_time = NOW(),
        current_position_ms = 0,
        last_updated = NOW()
    WHERE station_id = p_station_id;
    
    -- Add to playback history
    INSERT INTO playback_history (
        station_id, 
        song_id, 
        playlist_id, 
        started_at, 
        ended_at
    ) VALUES (
        p_station_id,
        current_state.current_song_id,
        current_state.current_playlist_id,
        current_state.song_start_time,
        NOW()
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically advance songs when duration is exceeded
CREATE OR REPLACE FUNCTION check_and_advance_song()
RETURNS TRIGGER AS $$
DECLARE
    current_state RECORD;
    song_duration_seconds INTEGER;
    elapsed_seconds NUMERIC;
BEGIN
    -- Get current playback state
    SELECT * INTO current_state 
    FROM global_playback_state 
    WHERE station_id = NEW.station_id;
    
    IF NOT FOUND OR NOT current_state.is_playing THEN
        RETURN NEW;
    END IF;
    
    -- Get song duration
    SELECT COALESCE(duration, 180) INTO song_duration_seconds
    FROM songs 
    WHERE id = current_state.current_song_id;
    
    -- Calculate elapsed time
    elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - current_state.song_start_time));
    
    -- Check if song should advance
    IF elapsed_seconds >= song_duration_seconds THEN
        PERFORM advance_to_next_song(NEW.station_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic song advancement
CREATE TRIGGER trigger_advance_song
    AFTER UPDATE ON global_playback_state
    FOR EACH ROW
    EXECUTE FUNCTION check_and_advance_song();
