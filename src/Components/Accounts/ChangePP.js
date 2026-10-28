import React, {useState,useEffect} from 'react';
import {db} from '../../supabase';
import {Image,Modal,Button,Dropdown} from 'react-bootstrap';

function ChangePP({userID}) {

  const [profilePics, setProfilePics] = useState([])
  const [selectedPic, setSelectedPic] = useState('Q82gC4OPteYZCJPP3ur2')

  useEffect (() => {
    // Static profile pics for now - could be moved to a database table
    const staticProfilePics = [
      { id: 'Q82gC4OPteYZCJPP3ur2', url: 'some-url-1' },
      { id: 'another-pic-id', url: 'some-url-2' }
    ];
    setProfilePics(staticProfilePics);
  }, [])

  const selectImage = (id, url) => {
    setSelectedPic(id)
  }

  const [done, setDone] = useState(false);

  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const SavePP = async () => {
    try {
      await db.updateUser(userID, {
        profilePic: selectedPic
      });
      setDone(true);
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  }

  function refreshPage(){ 
    window.location.reload(); 
  }

  return (
    <>
      <Dropdown.Item  onClick={handleShow}>Change Profile Pic</Dropdown.Item>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select Profile Pic</Modal.Title>
        </Modal.Header>
          <div>
            {!!profilePics && (profilePics.map(pic => (
              <Image src={pic.url} key={pic.id}
              className={(selectedPic === pic.id) ? ('pic-select pic-select-active') : ('pic-select')}
              onClick={() => selectImage(pic.id,pic.url)} />
            )))}
          </div>          
          <Modal.Footer>
            {done&&(
              <div className='d-flex mtsrt text-success'>
                PROFILE PIC UPDATED
                <b className='reload-btn mx-1' onClick={refreshPage}>
                  Reload
                </b>
              </div>
            )}
            <Button className='sign-in-btn' onClick={() => SavePP()}>
              Save
            </Button>
          </Modal.Footer>
      </Modal>
    </>
  )
}
export default ChangePP;
