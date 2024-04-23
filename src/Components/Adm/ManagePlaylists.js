import React, { useState, useEffect } from 'react';
import { query, collection, onSnapshot, doc} from 'firebase/firestore';
import {firestore} from '../../firebase';
import {Table, Image, Button} from 'react-bootstrap';
import Select from 'react-select'

function ManagePlaylists() {
  const [playlist, setPlaylist] = useState([])

  useEffect (() => {
    onSnapshot(query(collection(firestore, `/playlist`)), (snapshot) => {
      setPlaylist(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
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