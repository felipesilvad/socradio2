import React from 'react';
import {Image} from 'react-bootstrap';
import Select from 'react-select'
import PlaylistSong from './PlaylistSong';
import PlaylistSelector from './PlaylistSelector';

function PlaylistComponent({playlist,setCurrentSongIndex,setPlaylistSongFromDB,playlistList,currentSongIndex, changeRangeFilter, setCurrentPlaylist, currentPlaylist}) {
  
  return (
    <div className='playlist-div'>
      <PlaylistSelector playlistList={playlistList} setPlaylistSongFromDB={setPlaylistSongFromDB} 
      changeRangeFilter={changeRangeFilter} setCurrentPlaylist={setCurrentPlaylist} currentPlaylist={currentPlaylist} />

      <div className='playlist-table'>
        {(playlist.length>0)?(
          <table className='w-100'>
            {playlist.map((song, index) => (
              <PlaylistSong song={song} index={index} setCurrentSongIndex={setCurrentSongIndex} currentSongIndex={currentSongIndex} />
            ))}
          </table>
        ):(
          <div className='playlist-nosongs mtsrt'>
            No Songs Found
          </div>
        )}

      </div>
    </div>
  )
}

export default PlaylistComponent;