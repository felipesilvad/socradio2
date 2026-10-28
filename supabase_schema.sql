-- Supabase SQL Schema for Socradio2 Migration
-- This schema replaces Firestore collections with relational tables

-- Users table (replaces 'users' collection)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid VARCHAR(255) UNIQUE NOT NULL, -- Firebase auth UID
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles junction table (replaces roles array in users)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Songs table (replaces 'songs' collection)
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    cover TEXT, -- URL to cover image
    lv INTEGER, -- level/rating
    color VARCHAR(20), -- color code
    main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists table (replaces 'playlist' collection)
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    img TEXT, -- URL to playlist image
    lv INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Song-Playlist junction table (replaces playlists array in songs)
CREATE TABLE song_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(song_id, playlist_id)
);

-- Messages table (replaces 'messages' collection)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uid VARCHAR(255) NOT NULL, -- Firebase auth UID
    bot BOOLEAN DEFAULT FALSE,
    rating INTEGER, -- 1-5 rating if applicable
    rating_uid VARCHAR(255), -- UID of user being rated
    song_title VARCHAR(255),
    song_cover TEXT
);

-- Ratings table (replaces nested 'ratings' collection)
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    user_uid VARCHAR(255) NOT NULL, -- Firebase auth UID
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(song_id, user_uid)
);

-- Event Calendar table (replaces 'eventCalendar' collection)
CREATE TABLE event_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Station data table (replaces station-specific collections)
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'Main', 'Chill', 'Event', 'Private'
    current_song_index INTEGER DEFAULT 0,
    current_song_start_time TIMESTAMP WITH TIME ZONE,
    current_playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_uid ON messages(uid);
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_lv ON songs(lv);
CREATE INDEX idx_songs_main ON songs(main);
CREATE INDEX idx_ratings_song_id ON ratings(song_id);
CREATE INDEX idx_ratings_user_uid ON ratings(user_uid);
CREATE INDEX idx_event_calendar_start_time ON event_calendar(start_time);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_song_playlists_song_id ON song_playlists(song_id);
CREATE INDEX idx_song_playlists_playlist_id ON song_playlists(playlist_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_calendar_updated_at BEFORE UPDATE ON event_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (uid = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (uid = auth.uid()::text);

-- User roles policy
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE uid = auth.uid()::text));

-- Messages policy - everyone can read, authenticated users can write
CREATE POLICY "Everyone can view messages" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Ratings policy
CREATE POLICY "Users can view all ratings" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own ratings" ON ratings
    FOR ALL USING (user_uid = auth.uid()::text);
