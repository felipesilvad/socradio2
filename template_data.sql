-- Template Data for Socradio2 Testing
-- Run this in your Supabase SQL Editor after creating the schema

-- USERS TABLE
INSERT INTO users (uid, email, username, created_at, updated_at) VALUES
('demo-user-1', 'admin@socradio.com', 'AdminUser', NOW(), NOW()),
('demo-user-2', 'donator@socradio.com', 'DonatorUser', NOW(), NOW()),
('demo-user-3', 'regular@socradio.com', 'RegularUser', NOW(), NOW()),
('demo-user-4', 'testuser@socradio.com', 'TestUser', NOW(), NOW());

-- USER_ROLES TABLE
INSERT INTO user_roles (user_id, role, created_at) VALUES
((SELECT id FROM users WHERE uid = 'demo-user-1'), 'Admin', NOW()),
((SELECT id FROM users WHERE uid = 'demo-user-2'), 'Donator', NOW()),
((SELECT id FROM users WHERE uid = 'demo-user-3'), 'User', NOW()),
((SELECT id FROM users WHERE uid = 'demo-user-4'), 'User', NOW());

-- PLAYLISTS TABLE
INSERT INTO playlists (id, title, img, created_at, updated_at) VALUES
(gen_random_uuid(), 'Main Playlist', 'https://picsum.photos/300/300?random=1', NOW(), NOW()),
(gen_random_uuid(), 'Chill Vibes', 'https://picsum.photos/300/300?random=2', NOW(), NOW()),
(gen_random_uuid(), 'Rock Classics', 'https://picsum.photos/300/300?random=3', NOW(), NOW()),
(gen_random_uuid(), 'Electronic Beats', 'https://picsum.photos/300/300?random=4', NOW(), NOW()),
(gen_random_uuid(), 'Jazz Lounge', 'https://picsum.photos/300/300?random=5', NOW(), NOW());

-- SONGS TABLE (assuming you already added one, here are more)
INSERT INTO songs (title, album, artist, cover, lv, main, color, created_at, updated_at) VALUES
('Bohemian Rhapsody', 'A Night at the Opera', 'Queen', 'https://picsum.photos/200/200?random=10', 5, true, '#FF6B6B', NOW(), NOW()),
('Stairway to Heaven', 'Led Zeppelin IV', 'Led Zeppelin', 'https://picsum.photos/200/200?random=11', 4, true, '#4ECDC4', NOW(), NOW()),
('Hotel California', 'Hotel California', 'Eagles', 'https://picsum.photos/200/200?random=12', 3, true, '#45B7D1', NOW(), NOW()),
('Sweet Child O Mine', 'Appetite for Destruction', 'Guns N Roses', 'https://picsum.photos/200/200?random=13', 4, true, '#96CEB4', NOW(), NOW()),
('Smells Like Teen Spirit', 'Nevermind', 'Nirvana', 'https://picsum.photos/200/200?random=14', 3, true, '#FFEAA7', NOW(), NOW()),
('Imagine', 'Imagine', 'John Lennon', 'https://picsum.photos/200/200?random=15', 2, true, '#DDA0DD', NOW(), NOW()),
('Billie Jean', 'Thriller', 'Michael Jackson', 'https://picsum.photos/200/200?random=16', 3, true, '#98D8C8', NOW(), NOW()),
('Like a Rolling Stone', 'Highway 61 Revisited', 'Bob Dylan', 'https://picsum.photos/200/200?random=17', 4, true, '#FFB6C1', NOW(), NOW()),
('Good Vibrations', 'Good Vibrations', 'The Beach Boys', 'https://picsum.photos/200/200?random=18', 3, false, '#87CEEB', NOW(), NOW()),
('Hey Jude', 'Hey Jude', 'The Beatles', 'https://picsum.photos/200/200?random=19', 2, true, '#F0E68C', NOW(), NOW());

-- SONG_PLAYLISTS JUNCTION TABLE (Associate songs with playlists)
INSERT INTO song_playlists (song_id, playlist_id, created_at) VALUES
-- Main Playlist gets most songs
((SELECT id FROM songs WHERE title = 'Bohemian Rhapsody'), (SELECT id FROM playlists WHERE title = 'Main Playlist'), NOW()),
((SELECT id FROM songs WHERE title = 'Stairway to Heaven'), (SELECT id FROM playlists WHERE title = 'Main Playlist'), NOW()),
((SELECT id FROM songs WHERE title = 'Hotel California'), (SELECT id FROM playlists WHERE title = 'Main Playlist'), NOW()),
((SELECT id FROM songs WHERE title = 'Sweet Child O Mine'), (SELECT id FROM playlists WHERE title = 'Main Playlist'), NOW()),
((SELECT id FROM songs WHERE title = 'Imagine'), (SELECT id FROM playlists WHERE title = 'Main Playlist'), NOW()),
((SELECT id FROM songs WHERE title = 'Billie Jean'), (SELECT id FROM playlists WHERE title = 'Main Playlist'), NOW()),
((SELECT id FROM songs WHERE title = 'Hey Jude'), (SELECT id FROM playlists WHERE title = 'Main Playlist'), NOW()),

-- Chill Vibes
((SELECT id FROM songs WHERE title = 'Imagine'), (SELECT id FROM playlists WHERE title = 'Chill Vibes'), NOW()),
((SELECT id FROM songs WHERE title = 'Good Vibrations'), (SELECT id FROM playlists WHERE title = 'Chill Vibes'), NOW()),
((SELECT id FROM songs WHERE title = 'Hey Jude'), (SELECT id FROM playlists WHERE title = 'Chill Vibes'), NOW()),

-- Rock Classics
((SELECT id FROM songs WHERE title = 'Bohemian Rhapsody'), (SELECT id FROM playlists WHERE title = 'Rock Classics'), NOW()),
((SELECT id FROM songs WHERE title = 'Stairway to Heaven'), (SELECT id FROM playlists WHERE title = 'Rock Classics'), NOW()),
((SELECT id FROM songs WHERE title = 'Hotel California'), (SELECT id FROM playlists WHERE title = 'Rock Classics'), NOW()),
((SELECT id FROM songs WHERE title = 'Sweet Child O Mine'), (SELECT id FROM playlists WHERE title = 'Rock Classics'), NOW()),
((SELECT id FROM songs WHERE title = 'Smells Like Teen Spirit'), (SELECT id FROM playlists WHERE title = 'Rock Classics'), NOW()),

-- Electronic Beats
((SELECT id FROM songs WHERE title = 'Billie Jean'), (SELECT id FROM playlists WHERE title = 'Electronic Beats'), NOW()),

-- Jazz Lounge
((SELECT id FROM songs WHERE title = 'Good Vibrations'), (SELECT id FROM playlists WHERE title = 'Jazz Lounge'), NOW());

-- RATINGS TABLE
INSERT INTO ratings (song_id, user_uid, rating, created_at, updated_at) VALUES
((SELECT id FROM songs WHERE title = 'Bohemian Rhapsody'), 'demo-user-1', 5, NOW(), NOW()),
((SELECT id FROM songs WHERE title = 'Bohemian Rhapsody'), 'demo-user-2', 4, NOW(), NOW()),
((SELECT id FROM songs WHERE title = 'Stairway to Heaven'), 'demo-user-1', 5, NOW(), NOW()),
((SELECT id FROM songs WHERE title = 'Hotel California'), 'demo-user-3', 4, NOW(), NOW()),
((SELECT id FROM songs WHERE title = 'Sweet Child O Mine'), 'demo-user-2', 5, NOW(), NOW()),
((SELECT id FROM songs WHERE title = 'Imagine'), 'demo-user-4', 3, NOW(), NOW()),
((SELECT id FROM songs WHERE title = 'Billie Jean'), 'demo-user-1', 4, NOW(), NOW()),
((SELECT id FROM songs WHERE title = 'Hey Jude'), 'demo-user-3', 5, NOW(), NOW());

-- MESSAGES TABLE
INSERT INTO messages (text, uid, created_at) VALUES
('Welcome to Socradio! This is an amazing platform!', 'demo-user-1', NOW()),
('Great music selection today!', 'demo-user-2', NOW()),
('Love the chill vibes playlist', 'demo-user-3', NOW()),
('This station is awesome!', 'demo-user-4', NOW()),
('Bohemian Rhapsody is my favorite!', 'demo-user-1', NOW()),
('The sound quality is excellent', 'demo-user-2', NOW()),
('Can we get more rock classics?', 'demo-user-3', NOW()),
('Thanks for the great music!', 'demo-user-4', NOW());

-- EVENT_CALENDAR TABLE
INSERT INTO event_calendar (playlist_id, start_time, created_at, updated_at) VALUES
((SELECT id FROM playlists WHERE title = 'Main Playlist'), NOW() + INTERVAL '1 hour', NOW(), NOW()),
((SELECT id FROM playlists WHERE title = 'Chill Vibes'), NOW() + INTERVAL '3 hours', NOW(), NOW()),
((SELECT id FROM playlists WHERE title = 'Rock Classics'), NOW() + INTERVAL '6 hours', NOW(), NOW()),
((SELECT id FROM playlists WHERE title = 'Electronic Beats'), NOW() + INTERVAL '9 hours', NOW(), NOW()),
((SELECT id FROM playlists WHERE title = 'Jazz Lounge'), NOW() + INTERVAL '12 hours', NOW(), NOW()),
((SELECT id FROM playlists WHERE title = 'Main Playlist'), NOW() + INTERVAL '1 day', NOW(), NOW()),
((SELECT id FROM playlists WHERE title = 'Rock Classics'), NOW() + INTERVAL '2 days', NOW(), NOW()),
((SELECT id FROM playlists WHERE title = 'Chill Vibes'), NOW() + INTERVAL '3 days', NOW(), NOW());

-- STATIONS TABLE
INSERT INTO stations (id, name, current_song_index, current_song_start_time, updated_at) VALUES
(gen_random_uuid(), 'Main Station', 0, NOW(), NOW()),
(gen_random_uuid(), 'Chill Station', 2, NOW() - INTERVAL '5 minutes', NOW()),
(gen_random_uuid(), 'Rock Station', 1, NOW() - INTERVAL '10 minutes', NOW()),
(gen_random_uuid(), 'Electronic Station', 0, NOW() - INTERVAL '15 minutes', NOW()),
(gen_random_uuid(), 'Jazz Station', 0, NOW() - INTERVAL '20 minutes', NOW());

-- Note: User profile fields like color, profilePic, unlockedProfilePics, unlockedTitles
-- are not in the current users table schema. These would need to be added as separate columns
-- or handled in a different way if needed for testing.

-- Add some bot messages for testing
INSERT INTO messages (text, uid, bot, created_at) VALUES
('Welcome to the chat! Enjoy the music!', 'system', true, NOW()),
('New song starting: Bohemian Rhapsody', 'system', true, NOW() - INTERVAL '30 minutes'),
('DonatorUser rated Sweet Child O Mine 5 stars!', 'system', true, NOW() - INTERVAL '1 hour'),
('RegularUser rated Imagine 3 stars!', 'system', true, NOW() - INTERVAL '2 hours');
