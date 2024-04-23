import React, { useState, useEffect } from 'react';
import { query, collection, onSnapshot, doc} from 'firebase/firestore';
import {firestore} from '../../firebase';
import {Form, Button, Alert, Spinner} from 'react-bootstrap';

import firebase from 'firebase/compat/app';
import "firebase/compat/storage";

function AdmMain() {
  const [playlistTitle, setPlaylistTitle] = useState([])
  const [imageUrl, setImageUrl] = useState('');
  const [playlistAlert, setPlaylistAlert] = useState();
  const [playlistAlertType, setPlaylistAlertType] = useState('primary');
  const [imageLoad, setImageLoad] = useState(false);

  const handleImagePlaylist = (e) => {
    if (e.target.files[0]) {
      setImageLoad(true)
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(`events/${e.target.files[0].name}`);
      imageRef.put(e.target.files[0]).then(() => {
        setPlaylistAlert('Image uploaded successfully!');
        setPlaylistAlertType('primary')
        imageRef.getDownloadURL().then((url) => {
          setImageUrl(url);
          setImageLoad(false)
        });
      });
    }
  };


  const AddPlaylist = () => {
    if (imageUrl) {
      firestore.collection('playlist').add({
        title: playlistTitle,
        img: imageUrl
      })
      setPlaylistAlert(`${playlistTitle} Playlist Added`)
      setPlaylistAlertType("success")
    } else {
      setPlaylistAlert('No image selected.')
      setPlaylistAlertType("danger")
    }
  }

  return (
    <div className='playlist-display mt-5'>
      <label>Add Playlist</label>
      <div className=''>
        <Form.Control onChange={(e) => setPlaylistTitle(e.target.value)} placeholder="Playlist Title" />
        <input type="file" onChange={handleImagePlaylist} />
        {imageLoad?(
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ):(
          <Button onClick={()=>AddPlaylist()}>Add</Button>
        )}
        {playlistAlert&&(
          <Alert className='d-flex' key={playlistAlertType} variant={playlistAlertType}>
            {playlistAlert}
            {imageUrl && <img className='playlist-add-img' src={imageUrl} alt="Uploaded" />}
          </Alert>
        )}
      </div>
    </div>
  )
  ;
}

export default AdmMain;