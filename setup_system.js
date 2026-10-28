// Complete system setup script
const { supabase } = require('./server/supabase');

async function setupCompleteSystem() {
  console.log('🔧 Setting up complete global playback system...\n');

  try {
    // Step 1: Check if stations exist
    console.log('1. Checking existing stations...');
    const { data: existingStations, error: stationError } = await supabase
      .from('stations')
      .select('id, name');

    if (stationError) throw stationError;

    if (existingStations && existingStations.length > 0) {
      console.log(`✅ Found ${existingStations.length} existing stations`);
      existingStations.forEach(station => {
        console.log(`   - ${station.name} (${station.id})`);
      });
    } else {
      console.log('❌ No stations found, creating...');
    }

    // Step 2: Create default station if none exist
    if (!existingStations || existingStations.length === 0) {
      console.log('2. Creating default station...');
      const { data: newStation, error: createError } = await supabase
        .from('stations')
        .insert({
          id: 'main-station-id',
          name: 'Main Station',
          current_song_index: 0,
          current_song_start_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      console.log(`✅ Created station: ${newStation.name}`);
    }

    // Step 3: Check if playlists exist
    console.log('\n3. Checking existing playlists...');
    const { data: existingPlaylists, error: playlistError } = await supabase
      .from('playlists')
      .select('id, title');

    if (playlistError) throw playlistError;

    if (existingPlaylists && existingPlaylists.length > 0) {
      console.log(`✅ Found ${existingPlaylists.length} existing playlists`);
      existingPlaylists.forEach(playlist => {
        console.log(`   - ${playlist.title} (${playlist.id})`);
      });
    } else {
      console.log('❌ No playlists found, creating...');
    }

    // Step 4: Create default playlist if none exist
    let mainPlaylist;
    if (!existingPlaylists || existingPlaylists.length === 0) {
      console.log('4. Creating default playlist...');
      const { data: newPlaylist, error: playlistCreateError } = await supabase
        .from('playlists')
        .insert({
          title: 'Main Playlist',
          img: 'https://picsum.photos/300/300?random=default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (playlistCreateError) throw playlistCreateError;
      mainPlaylist = newPlaylist;
      console.log(`✅ Created playlist: ${newPlaylist.title}`);
    } else {
      mainPlaylist = existingPlaylists[0]; // Use first existing playlist
    }

    // Step 5: Check if songs exist
    console.log('\n5. Checking existing songs...');
    const { data: existingSongs, error: songError } = await supabase
      .from('songs')
      .select('id, title');

    if (songError) throw songError;

    if (existingSongs && existingSongs.length > 0) {
      console.log(`✅ Found ${existingSongs.length} existing songs`);
    } else {
      console.log('❌ No songs found, creating...');
    }

    // Step 6: Create default songs if none exist
    if (!existingSongs || existingSongs.length === 0) {
      console.log('6. Creating default songs...');
      const defaultSongs = [
        {
          title: 'Welcome to Socradio',
          artist: 'System',
          cover: 'https://picsum.photos/200/200?random=welcome',
          duration: 180, // 3 minutes
          lv: 1,
          main: true,
          color: '#007bff',
          created_at: new Date().toISOString()
        },
        {
          title: 'Test Song',
          artist: 'System',
          cover: 'https://picsum.photos/200/200?random=test',
          duration: 120, // 2 minutes
          lv: 1,
          main: true,
          color: '#28a745',
          created_at: new Date().toISOString()
        }
      ];

      const { data: createdSongs, error: songCreateError } = await supabase
        .from('songs')
        .insert(defaultSongs)
        .select();

      if (songCreateError) throw songCreateError;
      console.log(`✅ Created ${createdSongs.length} default songs`);
    }

    // Step 7: Link songs to playlist
    console.log('\n7. Linking songs to playlist...');
    
    // Get all songs
    const { data: allSongs, error: allSongsError } = await supabase
      .from('songs')
      .select('id');

    if (allSongsError) throw allSongsError;

    if (allSongs && allSongs.length > 0) {
      const songPlaylists = allSongs.map(song => ({
        playlist_id: mainPlaylist.id,
        song_id: song.id,
        created_at: new Date().toISOString()
      }));

      const { error: linkError } = await supabase
        .from('song_playlists')
        .insert(songPlaylists);

      if (linkError) throw linkError;
      console.log(`✅ Linked ${allSongs.length} songs to playlist`);
    }

    // Step 8: Initialize playback state
    console.log('\n8. Initializing playback state...');
    
    // Get station ID (use existing or created)
    const stationId = existingStations && existingStations.length > 0 
      ? existingStations[0].id 
      : 'main-station-id';

    // Get first song for playback
    const { data: firstSong, error: firstSongError } = await supabase
      .from('song_playlists')
      .select(`
        song_id,
        songs(id, title, duration)
      `)
      .eq('playlist_id', mainPlaylist.id)
      .limit(1);

    if (firstSongError) throw firstSongError;

    const initialSongId = firstSong && firstSong.length > 0 ? firstSong[0].song_id : null;

    const { error: stateError } = await supabase
      .from('global_playback_state')
      .upsert({
        station_id: stationId,
        current_song_id: initialSongId,
        current_playlist_id: mainPlaylist.id,
        current_song_index: 0,
        song_start_time: new Date().toISOString(),
        current_position_ms: 0,
        is_playing: true,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'station_id'
      });

    if (stateError) throw stateError;
    console.log(`✅ Playback state initialized for station: ${stationId}`);

    // Step 9: Link playlist to station
    console.log('\n9. Linking playlist to station...');
    const { error: stationPlaylistError } = await supabase
      .from('station_playlists')
      .upsert({
        station_id: stationId,
        playlist_id: mainPlaylist.id,
        is_active: true,
        priority: 1,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'station_id,playlist_id'
      });

    if (stationPlaylistError) throw stationPlaylistError;
    console.log(`✅ Playlist linked to station`);

    console.log('\n🎉 Global playback system setup complete!');
    console.log('\n📋 Summary:');
    console.log(`   - Stations: ${existingStations ? existingStations.length : 1}`);
    console.log(`   - Playlists: ${existingPlaylists ? existingPlaylists.length : 1}`);
    console.log(`   - Songs: ${existingSongs ? existingSongs.length : 2}`);
    console.log(`   - Station ID: ${stationId}`);
    console.log(`   - Playlist ID: ${mainPlaylist.id}`);
    console.log('\n🚀 You can now test the API:');
    console.log(`   curl http://localhost:3001/api/playback/state-by-name/Main%20Station`);
    console.log(`   curl http://localhost:3001/api/playback/playlist/${stationId}`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupCompleteSystem();
