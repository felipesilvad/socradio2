import React, {useState,useEffect} from 'react';
import {firestore} from '../../firebase';
import { doc, onSnapshot } from "firebase/firestore";
import {Dropdown} from 'react-bootstrap';
import SignOut from './SignOut';
import ChatMessagePP from '../Chat/ChatMessagePP';

function AccountHeader({user}) {

  const [userData, setUserData] = useState()
  useEffect(() => {
    onSnapshot(doc(firestore, "/users/", user.uid), (doc) => {
      setUserData(doc.data());
    });
  }, [user]);

  console.log(userData)
  return (
    <Dropdown>
      <Dropdown.Toggle className='profile-dropdown m-2' id="dropdown-basic">
        {userData&&(<ChatMessagePP id={userData.profilePic} />)}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
export default AccountHeader;

