import React, {useEffect, useState} from 'react';
import SignIn from './Accounts/SignIn';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Container, OverlayTrigger, Button, Tooltip} from 'react-bootstrap';
import AccountHeader from './Accounts/AccountHeader';
import {firestore} from '../firebase';
import {query, collection, onSnapshot, doc, orderBy, where, getDoc} from 'firebase/firestore';
import { TbCalendarTime } from "react-icons/tb";
import { Link } from 'react-router-dom';
import Clock from "react-live-clock";

function Header({user}){
  const [upcomingPlaylists, setUpcomingPlaylists] = useState([])
  const [currentPlaylist, setCurrentPlaylist] = useState([])
  const [eventImg, setEventImg] = useState()
  const [eventTitle, setEventTitle] = useState()
  const [currDate, setCurrDate] = useState(new Date())
  // const [currTime, setCurrTime] = useState(new Date().toLocaleTimeString)

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


  return (
    <div className='header'>
      <div className='d-flex justify-content-between w-100'>
        
        <Navbar expand="lg" variant="dark" className="">
        <Container>
          <div className='station-label mtsrt'>Stations</div>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto stations-m">
              <Nav.Link className='station-link d-flex' style={{backgroundImage: `url(${eventImg})`}} href="/Event">
                <div className='station-link-border justify-content-center align-self-center'>
                  <div className='station-link__div d-flex h-100'>
                    <div  className='mtsrt station-txt h-100 w-100'>
                      <div className='station-txt__event-label'>
                        Event
                      </div>
                      <div className='station-txt__event w-100'>
                        {eventTitle}
                      </div>
                    </div>
                  </div>
                </div>
              </Nav.Link>
              <Nav.Link href="/">
                <div className='station-link d-flex h-100'>
                  <div className='station-txt mtsrt hover-underline-animation justify-content-center align-self-center'>Main</div>
                </div>
              </Nav.Link>
              <Nav.Link href="/Chill">
                <div className='station-link d-flex h-100'>
                  <div className='station-txt mtsrt hover-underline-animation justify-content-center align-self-center'>Chill</div>
                </div>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <div className='d-flex justify-conent-end align-self-center'>
        <Clock className='d-flex justify-conent-end align-self-center mx-2' format={'HH:mm:ss'} ticking={true} />

        <OverlayTrigger placement="bottom" 
        overlay={tooltip("Event Station Calendar")}>
          <Link to={"/event-calendar"} className='d-flex justify-conent-end align-self-center'>
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