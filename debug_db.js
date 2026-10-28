// Debug database state
const { supabase } = require('./server/supabase');

async function debugDatabase() {
  console.log('🔍 Debugging database state...\n');

  try {
    // 1. Check stations
    console.log('1. Checking stations:');
    const { data: stations, error: stationError } = await supabase
      .from('stations')
      .select('id, name');
    
    if (stationError) throw stationError;
    console.log(`Found ${stations.length} stations:`);
    stations.forEach(s => console.log(`  - ${s.name} (${s.id})`));

    // 2. Check playlists
    console.log('\n2. Checking playlists:');
    const { data: playlists, error: playlistError } = await supabase
      .from('playlists')
      .select('id, title');
    
    if (playlistError) throw playlistError;
    console.log(`Found ${playlists.length} playlists:`);
    playlists.forEach(p => console.log(`  - ${p.title} (${p.id})`));

    // 3. Check global playback state
    console.log('\n3. Checking global playback state:');
    const { data: playbackStates, error: playbackError } = await supabase
      .from('global_playback_state')
      .select('*');
    
    if (playbackError) throw playbackError;
    console.log(`Found ${playbackStates.length} playback states:`);
    playbackStates.forEach(state => {
      console.log(`  - Station: ${state.station_id}, Song: ${state.current_song_id}, Playing: ${state.is_playing}`);
    });

    // 4. Check song-playlist links
    console.log('\n4. Checking song-playlist links:');
    const { data: songPlaylists, error: linkError } = await supabase
      .from('song_playlists')
      .select('playlist_id, song_id')
      .limit(10);
    
    if (linkError) throw linkError;
    console.log(`Found ${songPlaylists.length} song-playlist links:`);
    songPlaylists.forEach(link => {
      console.log(`  - Playlist: ${link.playlist_id}, Song: ${link.song_id}`);
    });

    // 5. Test specific station lookup
    console.log('\n5. Testing Main Station lookup:');
    const mainStation = stations.find(s => s.name === 'Main Station');
    if (mainStation) {
      console.log(`Main Station ID: ${mainStation.id}`);
      
      const { data: stationState, error: stateError } = await supabase
        .from('global_playback_state')
        .select('*')
        .eq('station_id', mainStation.id)
        .single();
      
      if (stateError) {
        console.log('State lookup error:', stateError);
      } else if (stationState) {
        console.log('✅ Found state:', {
          station_id: stationState.station_id,
          current_song_id: stationState.current_song_id,
          is_playing: stationState.is_playing
        });
      } else {
        console.log('❌ No state found for Main Station');
      }
    }

  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugDatabase();
