// Simple test to isolate the issue
const { supabase } = require('./server/supabase');

async function testSimpleQuery() {
  console.log('🧪 Testing simple database query...\n');

  try {
    // Test 1: Direct station query
    console.log('1. Testing direct station query...');
    const { data: station, error: stationError } = await supabase
      .from('stations')
      .select('id, name')
      .eq('name', 'Main Station')
      .single();
    
    if (stationError) {
      console.error('❌ Station query failed:', stationError);
      return;
    }
    
    console.log('✅ Station found:', station);

    // Test 2: Direct playback state query
    console.log('\n2. Testing direct playback state query...');
    const { data: playback, error: playbackError } = await supabase
      .from('global_playback_state')
      .select('*')
      .eq('station_id', station.id)
      .single();
    
    if (playbackError) {
      console.error('❌ Playback state query failed:', playbackError);
      return;
    }
    
    console.log('✅ Playback state found:', playback);

    // Test 3: Test the exact query from API
    console.log('\n3. Testing API query format...');
    const { data: apiData, error: apiError } = await supabase
      .from('global_playback_state')
      .select(`
        *,
        songs(id, title, artist, cover, duration),
        playlists(id, title)
      `)
      .eq('station_id', station.id)
      .single();
    
    if (apiError) {
      console.error('❌ API query format failed:', apiError);
      return;
    }
    
    console.log('✅ API query format works:', apiData);

    // Test 4: Format response like API does
    if (apiData) {
      const currentTime = Math.max(0, Math.min(
        Date.now() - new Date(apiData.song_start_time).getTime(),
        (apiData.songs.duration || 180) * 1000
      ));

      const progress = apiData.songs.duration > 0 
        ? (currentTime / (apiData.songs.duration * 1000)) * 100 
        : 0;

      const response = {
        stationId: station.id,
        song: {
          id: apiData.current_song_id,
          title: apiData.songs.title,
          artist: apiData.songs.artist,
          cover: apiData.songs.cover,
          duration: (apiData.songs.duration || 180) * 1000
        },
        playlist: {
          id: apiData.current_playlist_id,
          title: apiData.playlists.title
        },
        currentTime,
        progress,
        isPlaying: apiData.is_playing,
        startTime: apiData.song_start_time,
        nextSongTime: new Date(apiData.song_start_time).getTime() + ((apiData.songs.duration || 180) * 1000),
        serverTime: new Date().toISOString()
      };

      console.log('✅ Formatted response:', JSON.stringify(response, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleQuery();
