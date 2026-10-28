import React, { useState, useEffect } from 'react';
import { db, subscriptions } from '../../supabase';
import {Table, Image, Button} from 'react-bootstrap';
import Select from 'react-select'

function ManagePlaylists() {
  const [playlist, setPlaylist] = useState([])

  useEffect (() => {
    const fetchPlaylists = async () => {
      try {
        const playlistData = await db.getPlaylists();
        setPlaylist(playlistData);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, [])

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
    db.updateSongPlaylists(songID, [playlist]).catch(error => {
      console.error('Error updating song playlists:', error);
    });
  }

  return (
    <div className='playlist-display'>
      <h3 className='ardela text-center'>Songs</h3>
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
          {playlist.map((playlist) => (
            <tr>
              <td className='p-0'><Image src={playlist.img} className="list-cover-img" /></td>
              <td className='list-txt'>{playlist.title}</td>
              <td>{playlist.lv}</td>
              <td>
                <Button small onClick={(e) => updateRoles(e,playlist.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
  ;
}

export default ManagePlaylists;