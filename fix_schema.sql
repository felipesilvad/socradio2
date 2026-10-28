-- Fix schema issues for global playback system

-- Add duration column to songs table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'songs' AND column_name = 'duration'
    ) THEN
        ALTER TABLE songs ADD COLUMN duration INTEGER DEFAULT 180; -- 3 minutes default
        RAISE NOTICE 'Added duration column to songs table';
    END IF;
END $$;

-- Update existing songs with default duration
UPDATE songs SET duration = 180 WHERE duration IS NULL;

-- Add audio_url column if it doesn't exist (for audio files)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'songs' AND column_name = 'audio_url'
    ) THEN
        ALTER TABLE songs ADD COLUMN audio_url TEXT;
        RAISE NOTICE 'Added audio_url column to songs table';
    END IF;
END $$;

-- Update global playback schema function to handle missing duration
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
        -- Convert duration to milliseconds, use default if null
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

-- Fix the check_and_advance_song function
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
    
    -- Get song duration with fallback
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

-- Verify the schema
SELECT 
    'songs' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'songs' 
    AND column_name IN ('duration', 'audio_url')
ORDER BY column_name;
