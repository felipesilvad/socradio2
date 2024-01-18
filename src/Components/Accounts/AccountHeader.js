import React, {useState,useEffect} from 'react';
import {firestore} from '../../firebase';
import { doc, onSnapshot, query, collection, where } from "firebase/firestore";
import {Dropdown,Modal,Button,Image} from 'react-bootstrap';
import SignOut from './SignOut';
import ChatMessagePP from '../Chat/ChatMessagePP';
import ChangePP from './ChangePP';
import { BiSolidGift } from "react-icons/bi";

function AccountHeader({user}) {

  const [userData, setUserData] = useState()
  useEffect(() => {
    onSnapshot(doc(firestore, "/users/", user.uid), (doc) => {
      setUserData(doc.data());
    });
  }, [user]);

  const [profilePics, setProfilePics] = useState('')
  const [profilePicsUnlocked, setProfilePicsUnlocked] = useState('')

  const now = new Date().getTime()

  useEffect (() => {
    onSnapshot(query(collection(firestore, `/profile-pics`), where("lv", "==", 2)), (snapshot) => {
      setProfilePics(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
    });
  }, [])

  useEffect (() => {
    if (profilePics && userData.unlockedProfilePics) {
      const profilePicsUnlocked = profilePics.filter((item) => (
        now >= (item.startDate.seconds*1000) && now <= (item.endDate.seconds*1000)
      )).filter((item) => (
        !userData.unlockedProfilePics.includes(item.id)
      ));
  
      setProfilePicsUnlocked(profilePicsUnlocked)
    }
  }, [profilePics, userData])


  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const ClaimUnlocks = () => {
    const NewArray = userData.unlockedProfilePics
    profilePicsUnlocked.map(pp => (
      NewArray.push(pp.id)
    ))

    firestore.collection('users').doc(user.uid).set({
      unlockedProfilePics: NewArray
    }, {merge: true}).then(data => (
      console.log(data)
    ))

    console.log(NewArray)

    handleClose()
  }

  return (
    <Dropdown>
      {profilePicsUnlocked&&((profilePicsUnlocked.length > 0) ? (
        <>
         <BiSolidGift className='present-icon' onClick={() => handleShow()} />
        </>
      ) : (
        <>
          <BiSolidGift className='present-icon present-icon-none' />
        </>
      ))}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Unlocks</Modal.Title>
        </Modal.Header>
          <div>
            {!!profilePicsUnlocked && (profilePicsUnlocked.map(pic => (
              <>
                <Image src={pic.url} key={pic.id}
                className="pic-select"
                />
              </>
            )))}
          </div>          
          <Modal.Footer>
            <Button variant="secondary" onClick={() => ClaimUnlocks()}>
              Claim
            </Button>
          </Modal.Footer>
      </Modal>


      <Dropdown.Toggle className='profile-dropdown m-2' id="dropdown-basic">
        {userData&&(<ChatMessagePP id={userData.profilePic} header={true} />)}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
        <ChangePP userID={user.uid}/>
        <SignOut />
      </Dropdown.Menu>
    </Dropdown>
  )
}
export default AccountHeader;

