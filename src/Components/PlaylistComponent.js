import React from 'react';
import {Image} from 'react-bootstrap';
import Select from 'react-select'

function PlaylistComponent({playlist,setCurrentSongIndex,setPlaylistSongFromDB,playlistList}) {
  const customStyles = {
    option: provided => ({
      ...provided,
      color: 'black'
    }),
    control: provided => ({
      ...provided,
      color: 'black'
    }),
    singleValue: provided => ({
      ...provided,
      color: 'black'
    })
  }


  return (
    <div className='playlist-div'>
      <label className='ardela'>Select playlist</label>
      <Select
        closeMenuOnSelect={false}
        // defaultValue={user.roles}
        options={playlistList}
        styles={customStyles}
        onChange={(e) => setPlaylistSongFromDB(e)}
      />
      <table>
        {playlist.map((song, index) => (
          <tr className='playlist-tr' onClick={() => setCurrentSongIndex(index)}>
            <td><Image src={song.cover} className="list-cover-img" /></td>
            <td className='playlist-song-title'>{song.title}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}

export default PlaylistComponent;