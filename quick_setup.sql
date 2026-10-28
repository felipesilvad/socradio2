-- Quick Setup for Global Playback System
-- Run this if you're having issues with the full setup

-- Clean up duplicate song-playlist entries
DELETE FROM song_playlists WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY song_id, playlist_id) as row_num
        FROM song_playlists
    ) duplicates
    WHERE row_num > 1
);

-- Initialize Main Station with first song
INSERT INTO global_playback_state (station_id, current_song_id, current_playlist_id, current_song_index, song_start_time, current_position_ms, is_playing, last_updated)
SELECT 
    (SELECT id FROM stations WHERE name = 'Main Station' LIMIT 1),
    (SELECT song_id FROM song_playlists 
     WHERE playlist_id = (SELECT id FROM playlists WHERE title = 'Main Playlist' LIMIT 1) 
     LIMIT 1),
    (SELECT id FROM playlists WHERE title = 'Main Playlist' LIMIT 1),
    0,
    NOW(),
    0,
    true,
    NOW()
ON CONFLICT (station_id) DO UPDATE SET
    current_song_id = EXCLUDED.current_song_id,
    current_playlist_id = EXCLUDED.current_playlist_id,
    song_start_time = NOW(),
    last_updated = NOW();

-- Verify setup
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
WHERE s.name = 'Main Station';
