import React from 'react';
import {Image} from 'react-bootstrap';
import Select from 'react-select'

function PlaylistSong({song, index, setCurrentSongIndex, currentSongIndex}) {

  return (
    <tr key={index} className={`playlist-tr ${(currentSongIndex===index)&&('playlist-tr-current')}`}  onClick={() => setCurrentSongIndex(index)}>
      <td><Image src={song.cover} className="list-cover-img" /></td>
      <td className='playlist-song-title'>{song.title}</td>
    </tr>
  )
}

export default PlaylistSong;