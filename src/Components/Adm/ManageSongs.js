import React, { useState, useEffect } from 'react';
import { db, subscriptions } from '../../supabase';
import {Table, Image, Form, Button} from 'react-bootstrap';
import Select from 'react-select'
import { BsSendFill } from 'react-icons/bs';

function ManageSongs() {
  const [playlist, setPlaylist] = useState([])

  useEffect (() => {
    const fetchPlaylists = async () => {
      try {
        const playlistData = await db.getPlaylists();
        setPlaylist(playlistData.map(p => ({value: p.id, label: p.title})));
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, [])

  const [songs, setSongs] = useState([])
  const [search, setSearch] = useState([])
  const [updateDefaultValues, setUpdateDefaultValues] = useState(false)

  const getSongs = () => {
    setSongs([])
    db.getSongsWithPlaylists({ title: search }).then(songData => {
      setSongs(songData);
    }).catch(error => {
      console.error('Error fetching songs:', error);
    });
  }

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

  const updateRoles = (playlist, songID) => {
    db.updateSongPlaylists(songID, playlist).catch(error => {
      console.error('Error updating song playlists:', error);
    });
  }

  return (
    <div className='playlist-display'>
      <h3 className='ardela text-center'>Songs</h3>
      <Form.Control maxlength="200" onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
      <Button onClick={getSongs} className='send-btn'>
        <BsSendFill className='mb-1' />
      </Button>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>cover</th>
            <th className='list-txt'>title</th>
            <th className='list-txt'>album</th>
            <th>lv</th>
            <th>Playlist</th>
          </tr>
        </thead>
        <tbody>
          {songs&&(songs.map((song) => (
            <tr>
              <td className='p-0'><Image src={song.cover} className="list-cover-img" /></td>
              <td className='list-txt'>{song.title}</td>
              <td className='list-txt'>{song.album}</td>
              <td>{song.lv}</td>
              <td>
                <Select
                  closeMenuOnSelect={false}
                  defaultValue={song.playlists&&(song.playlists)}
                  isMulti
                  options={playlist}
                  styles={customStyles}
                  onChange={(e) => updateRoles(e,song.id)}
                />
              </td>
            </tr>
          )))}
        </tbody>
      </Table>
      
    </div>
  )
  ;
}

export default ManageSongs;