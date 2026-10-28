-- Initialize Global Playback System
-- Run this after the main schema and template data

-- First, make sure we have stations
INSERT INTO stations (id, name, current_song_index, current_song_start_time, updated_at) VALUES
(gen_random_uuid(), 'Main Station', 0, NOW(), NOW()),
(gen_random_uuid(), 'Chill Station', 0, NOW(), NOW()),
(gen_random_uuid(), 'Rock Station', 0, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Get station IDs for initialization
DO $$
DECLARE
    main_station UUID;
    chill_station UUID;
    rock_station UUID;
    main_playlist UUID;
BEGIN
    -- Get station IDs
    SELECT id INTO main_station FROM stations WHERE name = 'Main Station';
    SELECT id INTO chill_station FROM stations WHERE name = 'Chill Station';
    SELECT id INTO rock_station FROM stations WHERE name = 'Rock Station';
    
    -- Get main playlist ID
    SELECT id INTO main_playlist FROM playlists WHERE title = 'Main Playlist' LIMIT 1;
    
    -- Initialize playback state for Main Station
    INSERT INTO global_playback_state (
        station_id, 
        current_song_id, 
        current_playlist_id, 
        current_song_index, 
        song_start_time, 
        current_position_ms, 
        is_playing, 
        last_updated
    ) VALUES (
        main_station,
        (SELECT song_id FROM song_playlists WHERE playlist_id = main_playlist LIMIT 1),
        main_playlist,
        0,
        NOW(),
        0,
        true,
        NOW()
    ) ON CONFLICT (station_id) DO UPDATE SET
        current_song_id = EXCLUDED.current_song_id,
        current_playlist_id = EXCLUDED.current_playlist_id,
        song_start_time = NOW(),
        last_updated = NOW();
    
    -- Initialize other stations with same playlist
    INSERT INTO global_playback_state (
        station_id, 
        current_song_id, 
        current_playlist_id, 
        current_song_index, 
        song_start_time, 
        current_position_ms, 
        is_playing, 
        last_updated
    ) VALUES (
        chill_station,
        (SELECT song_id FROM song_playlists WHERE playlist_id = main_playlist LIMIT 1),
        main_playlist,
        0,
        NOW(),
        0,
        true,
        NOW()
    ) ON CONFLICT (station_id) DO NOTHING;
    
    INSERT INTO global_playback_state (
        station_id, 
        current_song_id, 
        current_playlist_id, 
        current_song_index, 
        song_start_time, 
        current_position_ms, 
        is_playing, 
        last_updated
    ) VALUES (
        rock_station,
        (SELECT song_id FROM song_playlists WHERE playlist_id = main_playlist LIMIT 1),
        main_playlist,
        0,
        NOW(),
        0,
        true,
        NOW()
    ) ON CONFLICT (station_id) DO NOTHING;
    
    -- Assign playlists to stations
    INSERT INTO station_playlists (station_id, playlist_id, is_active, priority, created_at) VALUES
    (main_station, main_playlist, true, 1, NOW()),
    (chill_station, main_playlist, true, 1, NOW()),
    (rock_station, main_playlist, true, 1, NOW())
    ON CONFLICT (station_id, playlist_id) DO NOTHING;
    
    RAISE NOTICE 'Global playback system initialized successfully';
END $$;

-- Verify initialization
SELECT 
    s.name as station_name,
    gps.current_song_index,
    gps.is_playing,
    gps.song_start_time,
    pl.title as playlist_title,
    song.title as current_song
FROM global_playback_state gps
JOIN stations s ON gps.station_id = s.id
LEFT JOIN playlists pl ON gps.current_playlist_id = pl.id
LEFT JOIN songs song ON gps.current_song_id = song.id
ORDER BY s.name;
