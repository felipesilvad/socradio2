import React, { useState, useEffect } from 'react';
import { query, collection, onSnapshot, doc} from 'firebase/firestore';
import {firestore} from '../../firebase';
import {Table, Image} from 'react-bootstrap';
import Select from 'react-select'
import EventCalendar from '../EventCalendar/EventCalendar';

function ManageEventCalendar() {
  const [playlist, setPlaylist] = useState([])
  const [events, setEvents] = useState([])

  useEffect (() => {
    onSnapshot(query(collection(firestore, `/playlist`)), (snapshot) => {
      setPlaylist(snapshot.docs.map(doc => ({value: doc.id, label: doc.data().title})))
    });
    onSnapshot(query(collection(firestore, `/eventCalendar`)), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
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

  // const updateRoles = (playlist, songID) => {
  //   console.log(playlist, songID)
  //   playlist.map((playlistItem) => (
  //     firestore.collection('playlist').doc(playlistItem.value).set({
  //       songs: [...getPlaylistSongs(playlistItem.value), songID],
  //     }, {merge: true})
  //   ))
    
  //   firestore.collection('songs').doc(songID).set({
  //     playlists: playlist,
  //   }, {merge: true})
  // }

  return (
    <div className='playlist-display'>
      <h3 className='ardela text-center'>Songs</h3>

      <EventCalendar events={events} />
    </div>
  )
  ;
}

export default ManageEventCalendar;