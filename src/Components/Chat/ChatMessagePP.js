import React, {useState, useEffect} from 'react';
import {firestore} from '../../firebase';
import { doc, onSnapshot } from "firebase/firestore";


function ChatMessagePP({id,header}) {
  const [profilePic, setProfilePic] = useState()

  useEffect(() => {
    onSnapshot(doc(firestore, "/profile-pics/", id), (doc) => {
      setProfilePic(doc.data());
    });
  }, []);

  if (profilePic) {
    return (
      <img className={`profile-img ${header&&("profile-img-header")}`} src={profilePic.url} />
    )
  }
}


export default ChatMessagePP;