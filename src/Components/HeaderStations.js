import React, {useEffect, useState} from 'react';
import SignIn from './Accounts/SignIn';
import Nav from 'react-bootstrap/Nav';
import { FaLock } from "react-icons/fa";
import {Container, OverlayTrigger, Tooltip} from 'react-bootstrap';

function HeaderStations({userData, eventImg, eventTitle}) {

  const privateStationTooltip = () => {
    return (
      <Tooltip id="tooltip">
        Private Station for Subscribers only
      </Tooltip>
    )
  }

  return (
    <Nav className="me-auto stations-m">
      <Nav.Link className='station-link d-flex' style={{backgroundImage: `url(https://firebasestorage.googleapis.com/v0/b/soc-radio-f3953.appspot.com/o/mix%2Fmix1.jpg?alt=media&token=c5d8c87e-caea-482b-b89e-f74649ee5d9e)`}} href="/">
        <div className='station-link-border justify-content-center align-self-center'>
          <div className='station-link__div d-flex h-100'>
            <div className='station-link d-flex h-100'>
              <div className='station-txt station-txt-main mtsrt justify-content-center align-self-center'>Mix</div>
            </div>
          </div>
        </div>
      </Nav.Link>
      <Nav.Link className='station-link d-flex' style={{backgroundImage: `url(https://firebasestorage.googleapis.com/v0/b/soc-radio-f3953.appspot.com/o/chill%2FChill1.jpg?alt=media&token=cedc74d7-7e50-4baf-93ed-8cd2ac3aa254)`}} href="/chill">
        <div className='station-link-border justify-content-center align-self-center'>
          <div className='station-link__div d-flex h-100'>
            <div className='station-link d-flex h-100'>
              <div className='station-txt station-txt-main mtsrt justify-content-center align-self-center'>Chill</div>
            </div>
          </div>
        </div>
      </Nav.Link>
      <Nav.Link className='station-link d-flex' style={{backgroundImage: `url(${eventImg})`}} href="/event">
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
      {userData&&(userData.roles.includes('Donator')||userData.roles.includes('Admin'))?(
        <Nav.Link className='station-link d-flex'  href="/private">
          <div className='station-link-border justify-content-center align-self-center'>
            <div className='station-link__div d-flex h-100'>
              <div className='station-link d-flex h-100'>
                <div className='station-txt station-txt-main mtsrt justify-content-center align-self-center'>Private</div>
              </div>
            </div>
          </div>
        </Nav.Link>
      ) : (
        <OverlayTrigger placement="bottom" 
          overlay={privateStationTooltip()}>
          <Nav.Link className='station-link d-flex'>
            <div className='station-link-border-deactive justify-content-center align-self-center'>
              <div className='lock-icon'>
                <FaLock />
              </div>
              <div className='station-link__div d-flex h-100'>
                <div className='station-link d-flex h-100'>
                  <div className='station-txt station-txt-main station-txt-deactive mtsrt justify-content-center align-self-center'>Private</div>
                </div>
              </div>
            </div>
          </Nav.Link>
        </OverlayTrigger>
      )}
    </Nav>
  )
  ;
}

export default HeaderStations;