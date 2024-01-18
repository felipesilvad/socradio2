import React, {useState,useEffect} from 'react';
import {auth,firestore} from '../../firebase';
import firebase from 'firebase/compat/app';
import {query,collection,onSnapshot,where} from "firebase/firestore";
import {Image,Modal,Button,Dropdown} from 'react-bootstrap';

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
  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const usersRef = firestore.collection('users');

  const SavePP = async () => {
    usersRef.doc(userID).set({
      profilePic: selectedPic
    }, {merge: true}).then(data => (
      console.log(data)
    ))
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
              <>
                <Image src={pic.url} key={pic.id}
                className={(selectedPic === pic.id) ? ('pic-select pic-select-active') : ('pic-select')}
                onClick={() => selectImage(pic.id,pic.url)} />
              </>
            )))}
          </div>          
          <Modal.Footer>
            <Button variant="secondary" onClick={() => SavePP()}>
              Save
            </Button>
          </Modal.Footer>
          
      </Modal>
    </>
  )
}
export default ChangePP;
