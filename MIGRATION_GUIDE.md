# Firestore to Supabase Migration Guide

## Overview
This document outlines the complete migration of the Socradio2 project from Firebase Firestore to Supabase (PostgreSQL). The migration maintains all existing functionality while leveraging Supabase's superior performance and SQL capabilities.

## Schema Migration

### Firestore Collections → Supabase Tables

| Firestore Collection | Supabase Table | Notes |
|----------------------|----------------|-------|
| `users` | `users` + `user_roles` | Normalized roles into junction table |
| `messages` | `messages` | Direct migration with timestamp handling |
| `songs` | `songs` + `song_playlists` | Normalized playlists into junction table |
| `playlist` | `playlists` | Direct migration |
| `ratings` | `ratings` | Flattened nested collection structure |
| `eventCalendar` | `event_calendar` | Direct migration with snake_case naming |
| Station collections (`Main`, `Chill`, etc.) | `stations` | Unified station management |

### Key Schema Changes

1. **Normalized User Roles**: 
   - Before: `users.roles: ["Admin", "Donator"]`
   - After: `user_roles` junction table with one role per row

2. **Normalized Song Playlists**:
   - Before: `songs.playlists: ["playlist1", "playlist2"]`
   - After: `song_playlists` junction table

3. **Flattened Ratings**:
   - Before: `ratings/{songId}/ratings/{userId}`
   - After: Single `ratings` table with `song_id` and `user_uid` columns

4. **Timestamp Handling**:
   - Firestore: `createdAt: { seconds: 123, nanoseconds: 456 }`
   - Supabase: `created_at: TIMESTAMP WITH TIME ZONE`

## Code Changes by Component

### 1. App.js
**Before (Firestore)**:
```javascript
import { useAuthState } from 'react-firebase-hooks/auth';
import { onSnapshot, doc } from 'firebase/firestore';

const [user] = useAuthState(auth);

useEffect(() => {
  if (user) {
    onSnapshot(doc(firestore, "/users/", user.uid), (doc) => {
      setUserData(doc.data());
      setLoading(false);
    });
  }
}, [user]);
```

**After (Supabase)**:
```javascript
import { auth, db, subscriptions } from './supabase';

const [user, setUser] = useState(null);

useEffect(() => {
  auth.currentUser().then(({ data: { user } }) => {
    setUser(user);
  });

  const { data: { subscription } } = auth.onAuthStateChanged((event, session) => {
    setUser(session?.user || null);
  });

  return () => subscription.unsubscribe();
}, []);

useEffect(() => {
  if (user) {
    db.getUser(user.uid).then(data => {
      setUserData(data);
      setLoading(false);
    });

    const userSubscription = subscriptions.subscribeToUser(user.uid, (payload) => {
      if (payload.eventType === 'UPDATE') {
        db.getUser(user.uid).then(data => setUserData(data));
      }
    });

    return () => userSubscription.unsubscribe();
  }
}, [user]);
```

### 2. Station.js
**Before (Firestore)**:
```javascript
const setCurrentSongFromDB = async () => {
  getDoc(doc(collection(firestore, station), "currentSong"))
    .then(doc => {
      setCurrentSongIndex(doc.data().currentSong.index)
      const now = new Date().getTime()
      const seconds = now / 1000
      handleSeek(seconds-doc.data().currentSong.startTime)
    })
}
```

**After (Supabase)**:
```javascript
const setCurrentSongFromDB = async () => {
  try {
    const stationData = await db.getStation(station);
    if (stationData) {
      setCurrentSongIndex(stationData.current_song_index);
      const now = new Date().getTime();
      const seconds = now / 1000;
      if (stationData.current_song_start_time) {
        handleSeek(seconds - new Date(stationData.current_song_start_time).getTime() / 1000);
      }
    }
  } catch (error) {
    console.error('Error fetching current song:', error);
  }
}
```

### 3. ChatRoom.js
**Before (Firestore)**:
```javascript
const [messages] = useCollectionData(query, { idField: 'id' });

const sendMessage = async (e) => {
  await messagesRef.add({
    text: formValue,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    uid,
  });
}
```

**After (Supabase)**:
```javascript
const [messages, setMessages] = useState([]);

useEffect(() => {
  db.getMessages(15).then(setMessages);
  
  const subscription = subscriptions.subscribeToMessages((payload) => {
    if (payload.eventType === 'INSERT') {
      setMessages(prev => [payload.new, ...prev].slice(0, 15));
    }
  });

  return () => subscription.unsubscribe();
}, []);

const sendMessage = async (e) => {
  await db.addMessage({
    text: formValue,
    uid: currentUser.id,
  });
}
```

## Real-time Subscriptions

### Firestore vs Supabase Real-time

| Feature | Firestore | Supabase |
|---------|-----------|----------|
| Syntax | `onSnapshot()` | `supabase.channel()` |
| Granularity | Document/collection level | Table level with filters |
| Performance | Good | Excellent (PostgreSQL) |
| Connection | WebSockets | WebSockets |
| Payload format | Full document | Change event with new/old records |

### Subscription Examples

**User Data Changes**:
```javascript
// Supabase
const subscription = subscriptions.subscribeToUser(uid, (payload) => {
  if (payload.eventType === 'UPDATE') {
    // Handle user update
  }
});
```

**New Messages**:
```javascript
// Supabase
const subscription = subscriptions.subscribeToMessages((payload) => {
  if (payload.eventType === 'INSERT') {
    setMessages(prev => [payload.new, ...prev]);
  }
});
```

## Authentication Changes

### Firebase Auth → Supabase Auth

| Feature | Firebase | Supabase |
|---------|----------|----------|
| Current User | `auth.currentUser` | `supabase.auth.getUser()` |
| Auth State | `onAuthStateChanged` | `onAuthStateChange` |
| User Object | `{ uid, email, ... }` | `{ id, email, ... }` |
| Sign In | Various methods | `supabase.auth.signInWithPassword()` |

**Migration Note**: The UID field name changes from `uid` (Firebase) to `id` (Supabase), but we maintain `uid` in our database for compatibility.

## Performance Improvements

### Query Optimization

1. **Indexed Queries**: All frequently queried columns are indexed
2. **Joins Instead of Multiple Queries**: Using SQL joins for related data
3. **Filtered Subscriptions**: Only subscribe to relevant data changes

### Example Optimizations

**Before**: Multiple Firestore queries
```javascript
// Multiple round trips
onSnapshot(query(collection(firestore, `/playlist`)), ...);
onSnapshot(query(collection(firestore, `/songs`), where("main", "==", true)), ...);
```

**After**: Single optimized query with joins
```javascript
// Single query with joins
const { data } = await supabase
  .from('songs')
  .select(`
    *,
    song_playlists(
      playlists(id, title)
    )
  `)
  .eq('main', true);
```

## Migration Steps

### 1. Database Setup
```sql
-- Run the supabase_schema.sql file in your Supabase project
-- This creates all tables, indexes, and RLS policies
```

### 2. Environment Variables
```bash
# Add to .env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Package Dependencies
```bash
# Remove Firebase
npm uninstall firebase react-firebase-hooks

# Add Supabase
npm install @supabase/supabase-js
```

### 4. Code Migration
- Replace `firebase.js` with `supabase.js`
- Update all component imports
- Test real-time functionality
- Verify authentication flow

## Potential Issues & Solutions

### 1. Data Structure Changes
**Issue**: User roles and song playlists are now normalized
**Solution**: Update UI components to handle the new structure:
```javascript
// Before
user.roles.includes('Admin')

// After
user.user_roles && user.user_roles.some(r => r.role === 'Admin')
```

### 2. Timestamp Format
**Issue**: Firestore timestamps vs Supabase timestamps
**Solution**: Use consistent date handling:
```javascript
// Both work with new Date()
new Date(firestoreTimestamp.toDate())
new Date(supabaseTimestamp)
```

### 3. Real-time Subscription Limits
**Issue**: Supabase has limits on concurrent subscriptions
**Solution**: Implement subscription management:
```javascript
// Cleanup subscriptions on unmount
useEffect(() => {
  const subscription = subscriptions.subscribeToMessages(callback);
  return () => subscription.unsubscribe();
}, []);
```

### 4. Error Handling
**Issue**: Supabase errors have different structure
**Solution**: Update error handling:
```javascript
try {
  const { data, error } = await db.someOperation();
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Operation failed:', error);
}
```

## Testing Checklist

- [ ] User authentication works correctly
- [ ] Real-time chat messages appear instantly
- [ ] Song ratings update in real-time
- [ ] Admin user management functions
- [ ] Playlist management works
- [ ] Event calendar updates
- [ ] Station data syncs properly
- [ ] All role-based access controls work
- [ ] Error handling displays appropriately
- [ ] Performance is acceptable

## Rollback Plan

If issues arise during migration:

1. **Database**: Keep Firestore backup until migration is verified
2. **Code**: Maintain feature flags to switch between implementations
3. **Gradual Migration**: Migrate one component at a time
4. **Monitoring**: Monitor error rates and performance metrics

## Post-Migration Benefits

1. **Performance**: SQL queries are faster than NoSQL for structured data
2. **Scalability**: PostgreSQL handles complex queries better
3. **Cost**: Potentially lower costs at scale
4. **Features**: Full SQL capabilities, stored procedures, etc.
5. **Real-time**: More efficient real-time subscriptions
6. **Security**: Row-level security with SQL policies

## Support

For issues during migration:
1. Check Supabase documentation
2. Review error logs in Supabase dashboard
3. Test with smaller datasets first
4. Use Supabase's built-in query editor for debugging
