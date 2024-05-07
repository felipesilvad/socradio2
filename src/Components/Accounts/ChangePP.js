import React, {useState,useEffect} from 'react';
import {auth,firestore} from '../../firebase';
import firebase from 'firebase/compat/app';
import {query,collection,onSnapshot,where} from "firebase/firestore";
import {Image,Modal,Button,Dropdown,Alert} from 'react-bootstrap';

function ChangePP({userID}) {

  const [profilePics, setProfilePics] = useState('')
  const [selectedPic, setSelectedPic] = useState('Q82gC4OPteYZCJPP3ur2')

  useEffect (() => {
    onSnapshot(query(collection(firestore, `/profile-pics`), where("lv", "==", 1)), (snapshot) => {
      setProfilePics(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
    });
  }, [])

  const selectImage = (id) => {
    setSelectedPic(id)
  }

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const usersRef = firestore.collection('users');

  const SavePP = async () => {
    setLoading(true)
    usersRef.doc(userID).set({
      profilePic: selectedPic
    }, {merge: true}).then(
      setDone(true)
    )
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
