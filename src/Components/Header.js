import React, {useEffect, useState} from 'react';
import SignIn from './Accounts/SignIn';
import Navbar from 'react-bootstrap/Navbar';
import {Container, OverlayTrigger, Tooltip} from 'react-bootstrap';
import AccountHeader from './Accounts/AccountHeader';
import {firestore} from '../firebase';
import {query, collection, onSnapshot, doc, orderBy, where, getDoc} from 'firebase/firestore';
import { TbCalendarTime } from "react-icons/tb";
import { Link } from 'react-router-dom';
import Clock from "react-live-clock";
import { FiGift } from "react-icons/fi";
import HeaderStations from "./HeaderStations"
import { FaCaretDown } from "react-icons/fa";

function Header({user}){
  const [upcomingPlaylists, setUpcomingPlaylists] = useState([])
  const [currentPlaylist, setCurrentPlaylist] = useState([])
  const [eventImg, setEventImg] = useState()
  const [eventTitle, setEventTitle] = useState()
  const [currDate, setCurrDate] = useState(new Date())
  // const [currTime, setCurrTime] = useState(new Date().toLocaleTimeString)

  const [userData, setUserData] = useState()
  useEffect(() => {
    if (user) {
      onSnapshot(doc(firestore, "/users/", user.uid), (doc) => {
        setUserData(doc.data());
      });
    }
  }, [user]);

  useEffect (() => {
    var first = new Date(currDate.getDate() - currDate.getDay());
    onSnapshot(query(collection(firestore, 'eventCalendar'), where("startTime", ">=", first), orderBy("startTime")), (snapshot) => {
      setUpcomingPlaylists(snapshot.docs.map(doc => ({...doc.data()})))
    });
  }, [])

  useEffect (() => {
    if (upcomingPlaylists.length>0) {
      const nextPlaylist = upcomingPlaylists.filter(x => x.startTime.toDate() >= currDate)[0]
      setCurrentPlaylist(upcomingPlaylists[upcomingPlaylists.indexOf(nextPlaylist)-1])
    }
  }, [upcomingPlaylists])
  useEffect (() => {
    if (currentPlaylist) {
      if (currentPlaylist.playlist) {
        const docRef = doc(firestore, "playlist", currentPlaylist.playlist);
        getDoc(docRef).then(docSnap => {
          if (docSnap.exists()) {
            setEventImg(docSnap.data().img)
            setEventTitle(docSnap.data().title)
          } else {
            console.log("No such document!");
          }
        })
      }
    }
  }, [currentPlaylist])

  const tooltip = (text) => {
    return (
      <Tooltip id="tooltip">
        {text}
      </Tooltip>
    )
  }

  const [showNav, setShowNav] = useState(false)

  return (
    <div className='header'>
      <div className='d-flex justify-content-between w-100'>

        <Navbar expand="lg" variant="dark" className="d-none d-lg-block">
          <Container className='mt-2'>
            <div className='station-label mtsrt'>Stations</div>
            <HeaderStations userData={userData} eventImg={eventImg} eventTitle={eventTitle} />
          </Container>
        </Navbar>

        <div className='nav-bar-mobile d-lg-none d-xl-none'>

          <div className='mtsrt nav-bar-mobile__btn' 
          onClick={() => setShowNav(!showNav)}>
            STATIONS <FaCaretDown />
          </div>

          {showNav&&(
            <div className='nav-bar-show'>
              <HeaderStations userData={userData} eventImg={eventImg} eventTitle={eventTitle} />
            </div>
          )}
        </div>
      
        <div className='d-flex justify-conent-end align-self-center'>

          <Clock className='d-none d-lg-block d-flex justify-conent-end align-self-center mx-2'
           format={'HH:mm:ss'} ticking={true} />
          
          <OverlayTrigger placement="bottom" 
          overlay={tooltip("No Unlockables available")}>
            <div className='d-flex justify-conent-end align-self-center mx-2'>
              <FiGift  className='header-icon-unavaible' />
            </div>
          </OverlayTrigger>

          <OverlayTrigger placement="bottom" 
          overlay={tooltip("Event Station Calendar")}>
            <Link to={"/event-calendar"} className='d-flex justify-conent-end align-self-center mx-2'>
              <TbCalendarTime className='header-icon' />
            </Link>
          </OverlayTrigger>

          {user ? <AccountHeader user={user}  /> : <SignIn />}
        </div>
      </div>
    </div>
  )

}

export default Header;