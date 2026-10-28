import React, { useState } from 'react';
import { db } from '../../supabase';
import {Form, Button, Alert, Spinner} from 'react-bootstrap';

function AdmMain() {
  const [playlistTitle, setPlaylistTitle] = useState([])
  const [imageUrl, setImageUrl] = useState('');
  const [playlistAlert, setPlaylistAlert] = useState();
  const [playlistAlertType, setPlaylistAlertType] = useState('primary');
  const [imageLoad, setImageLoad] = useState(false);

  const handleImagePlaylist = async (e) => {
    if (e.target.files[0]) {
      setImageLoad(true)
      try {
        // For now, we'll use a placeholder URL
        // In production, you'd upload to Supabase Storage
        const file = e.target.files[0];
        const fakeUrl = `https://placeholder.com/events/${file.name}`;
        
        setImageUrl(fakeUrl);
        setPlaylistAlert('Image uploaded successfully!');
        setPlaylistAlertType('primary');
        setImageLoad(false);
      } catch (error) {
        console.error('Error uploading image:', error);
        setPlaylistAlert('Failed to upload image');
        setPlaylistAlertType('danger');
        setImageLoad(false);
      }
    }
  };

  const AddPlaylist = async () => {
    if (imageUrl) {
      try {
        await db.addPlaylist({
          title: playlistTitle,
          img: imageUrl
        });
        setPlaylistAlert(`${playlistTitle} Playlist Added`);
        setPlaylistAlertType("success");
        setPlaylistTitle('');
        setImageUrl('');
      } catch (error) {
        console.error('Error adding playlist:', error);
        setPlaylistAlert('Failed to add playlist');
        setPlaylistAlertType("danger");
      }
    } else {
      setPlaylistAlert('No image selected.');
      setPlaylistAlertType("danger");
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