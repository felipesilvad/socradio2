# Global Playback Synchronization System

## Overview

The Global Playback System enables synchronized radio-style playback where all users hear the same song at the same time, regardless of when they join. This creates a live radio experience rather than independent playback per user.

## Architecture

### Core Components

1. **Database Schema** (`global_playback_schema.sql`)
   - `global_playback_state`: Single source of truth for playback state
   - `playback_history`: Analytics and recovery data
   - `client_sync_sessions`: Track client connections and drift
   - `station_playlists`: Curated playlists per station

2. **Backend API** (`src/api/globalPlayback.js`)
   - Playback state management
   - Server-Sent Events for real-time updates
   - Automatic song advancement
   - Client synchronization tracking

3. **Client Hooks** (`src/hooks/useGlobalPlayback.js`)
   - Real-time state synchronization
   - Clock drift compensation
   - Automatic reconnection
   - Playback controls

4. **UI Components** (`src/Components/AudioPlayer/GlobalAudioPlayer.js`)
   - Synchronized audio player
   - Visual sync indicators
   - Playback controls

5. **Recovery System** (`src/utils/playbackRecovery.js`)
   - Edge case handling
   - Auto-recovery mechanisms
   - Health monitoring

## Key Features

### 🎯 Perfect Synchronization
- All users hear the same song at the same position
- Server is the single source of truth
- Client-side drift compensation

### 🔄 Real-time Updates
- Server-Sent Events for instant updates
- Automatic reconnection on connection loss
- Periodic resync to prevent drift

### 🛡️ Robust Error Handling
- Auto-recovery from server restarts
- Empty playlist handling
- Song duration mismatch correction
- Client desync detection and correction

### 📊 Health Monitoring
- System health checks
- Performance metrics
- Recovery status tracking

## Data Model

### Global Playback State
```sql
CREATE TABLE global_playback_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES stations(id),
    current_song_id UUID REFERENCES songs(id),
    current_playlist_id UUID REFERENCES playlists(id),
    current_song_index INTEGER DEFAULT 0,
    song_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    current_position_ms INTEGER DEFAULT 0,
    is_playing BOOLEAN DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id)
);
```

### Client Sync Sessions
```sql
CREATE TABLE client_sync_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    station_id UUID REFERENCES stations(id),
    last_sync_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_offset_ms INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);
```

## API Endpoints

### Playback State
- `GET /api/playback/state/:stationId` - Get current playback state
- `PUT /api/playback/state/:stationId` - Update playback state (play/pause/seek)
- `POST /api/playback/initialize/:stationId` - Initialize playback state

### Playlist Management
- `GET /api/playback/playlist/:stationId` - Get station playlist
- `POST /api/playback/advance/:stationId` - Advance to next song

### Synchronization
- `GET /api/playback/stream/:stationId` - Server-Sent Events stream
- `POST /api/playback/sync/:stationId` - Register sync session
- `PUT /api/playback/sync/:sessionId` - Update sync session

### Recovery & Health
- `GET /api/playback/history/:stationId` - Get playback history
- `POST /api/playback/cleanup` - Clean inactive sessions
- `POST /api/playback/manual-sync/:stationId` - Manual sync trigger

## Client Implementation

### Using the Global Playback Hook

```javascript
import { useGlobalPlayback } from '../hooks/useGlobalPlayback';

const MyComponent = ({ stationId, user }) => {
  const {
    playbackState,
    isConnected,
    isLoading,
    error,
    currentSong,
    currentTime,
    progress,
    isPlaying,
    play,
    pause,
    seek,
    nextSong,
    clockDrift
  } = useGlobalPlayback(stationId, user?.id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>{currentSong?.title}</h3>
      <p>Progress: {progress.toFixed(1)}%</p>
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <small>Drift: {clockDrift}ms</small>
    </div>
  );
};
```

### Global Audio Player Component

```javascript
import GlobalAudioPlayer from '../Components/AudioPlayer/GlobalAudioPlayer';

<GlobalAudioPlayer stationId={stationId} user={user} />
```

## Synchronization Strategy

### Clock Drift Compensation

1. **Server Time Reference**: Each response includes server timestamp
2. **Drift Calculation**: `drift = localTime - serverTime`
3. **Compensated Time**: `compensatedTime = localTime - drift`
4. **Position Calculation**: `position = compensatedTime - songStartTime`

### Real-time Updates

1. **Server-Sent Events**: Instant state changes broadcast
2. **Periodic Resync**: Every 30 seconds to prevent drift
3. **Connection Recovery**: Auto-reconnect with exponential backoff

### Edge Case Handling

1. **Server Restart**: Auto-initialize playback state
2. **Empty Playlist**: Create default playlist with songs
3. **Duration Mismatch**: Update song duration in database
4. **Client Desync**: Detect and correct large time differences

## Deployment

### Database Setup

```sql
-- Run the global playback schema
-- Run the template data for testing
```

### Environment Variables

```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

### Server Setup

```javascript
const express = require('express');
const playbackRoutes = require('./src/server/playbackRoutes');

const app = express();
app.use('/api/playback', playbackRoutes);

app.listen(3001, () => {
  console.log('Playback API server running on port 3001');
});
```

## Testing

### Multi-Client Testing

1. Open multiple browser tabs to the same station
2. Verify all clients show the same song position
3. Test play/pause synchronization
4. Test song advancement
5. Test reconnection after page refresh

### Edge Case Testing

1. **Server Restart**: Stop and restart the server
2. **Empty Playlist**: Clear playlist and test recovery
3. **Network Issues**: Simulate connection loss
4. **Clock Drift**: Test with different time zones

### Performance Testing

1. **Concurrent Users**: Test with 100+ simultaneous clients
2. **Memory Usage**: Monitor server memory consumption
3. **Latency**: Measure sync delay across clients
4. **Recovery Time**: Measure auto-recovery duration

## Monitoring

### Health Metrics

- Connection count per station
- Average clock drift
- Recovery success rate
- Song advancement accuracy

### Logging

```javascript
// Enable detailed logging
console.log('Playback state updated:', state);
console.log('Client connected:', sessionId);
console.log('Recovery triggered:', error);
```

### Alerts

- High drift (> 1 second)
- Frequent disconnections
- Recovery failures
- Empty playlists

## Troubleshooting

### Common Issues

1. **Clients Not Synced**
   - Check server time accuracy
   - Verify SSE connection
   - Check clock drift compensation

2. **Song Not Advancing**
   - Verify song duration in database
   - Check auto-advancement logic
   - Test manual advancement

3. **Connection Issues**
   - Check CORS settings
   - Verify SSE endpoint
   - Test network connectivity

### Debug Tools

```javascript
// Enable debug mode
localStorage.setItem('debugPlayback', 'true');

// View sync status
console.log('Clock drift:', clockDrift);
console.log('Session ID:', sessionId);
console.log('Server time:', playbackState.serverTime);
```

## Performance Optimization

### Database Indexes

```sql
-- Critical indexes for performance
CREATE INDEX idx_global_playback_state_station ON global_playback_state(station_id);
CREATE INDEX idx_playback_history_station_time ON playback_history(station_id, started_at DESC);
CREATE INDEX idx_client_sync_sessions_active ON client_sync_sessions(is_active);
```

### Caching

- Playback state cached in memory
- Playlist data cached per station
- Client session data cached

### Load Balancing

- Multiple API servers possible
- Shared database state
- Sticky sessions for SSE connections

## Security

### Authentication

- User authentication required for control
- Read-only access for anonymous users
- Session validation for SSE

### Rate Limiting

- Control actions rate limited
- API endpoints protected
- DDoS protection for SSE

### Data Validation

- Input validation on all endpoints
- SQL injection prevention
- XSS protection in UI

## Future Enhancements

### Advanced Features

1. **Adaptive Bitrate**: Adjust audio quality based on connection
2. **Geo-sync**: Different playlists per region
3. **Social Features**: User requests, voting system
4. **Analytics**: Detailed listening statistics
5. **Live Streaming**: Real-time audio streaming

### Scalability

1. **Microservices**: Separate playback service
2. **CDN Integration**: Audio file distribution
3. **Database Sharding**: Scale database horizontally
4. **WebRTC**: Peer-to-peer synchronization

## Support

For issues and questions:
1. Check the troubleshooting guide
2. Review the API documentation
3. Enable debug logging
4. Contact the development team

---

This system provides a robust, scalable solution for synchronized radio-style playback across all users, ensuring everyone hears the same content at the same time regardless of when they join.
