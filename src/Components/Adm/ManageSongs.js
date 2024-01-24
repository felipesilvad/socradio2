import React, { useState, useEffect } from 'react';
import { query, collection, onSnapshot, doc} from 'firebase/firestore';
import {firestore} from '../../firebase';
import {Table, Image} from 'react-bootstrap';
import Select from 'react-select'

function ManageSongs() {
  const [playlist, setPlaylist] = useState([])

  useEffect (() => {
    onSnapshot(query(collection(firestore, `/playlist`)), (snapshot) => {
      setPlaylist(snapshot.docs.map(doc => ({value: doc.id, label: doc.data().title})))
    });
  }, [])

  const getPlaylistSongs = (playlistID) => {
    var playlistSongs = []
    onSnapshot(doc(firestore, "/playlist/", playlistID), (doc) => {
      playlistSongs = doc.data().songs
    });
    return playlistSongs
  }

  const [songs, setSongs] = useState([])
  
  useEffect (() => {
    onSnapshot(query(collection(firestore, `/songs`)), (snapshot) => {
      setSongs(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
    });
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
    console.log(playlist, songID)
    playlist.map((playlistItem) => (
      firestore.collection('playlist').doc(playlistItem.value).set({
        songs: [...getPlaylistSongs(playlistItem.value), songID],
      }, {merge: true})
    ))
    
    firestore.collection('songs').doc(songID).set({
      playlists: playlist,
    }, {merge: true})
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
          {songs.map((song) => (
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
          ))}
        </tbody>
      </Table>
      
    </div>
  )
  ;
}

export default ManageSongs;