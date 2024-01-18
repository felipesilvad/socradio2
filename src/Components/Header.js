import React from 'react';
import SignIn from './Accounts/SignIn';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Container, Image} from 'react-bootstrap';
import AccountHeader from './Accounts/AccountHeader';

function Header({user}){

  return (
    <div className='header'>
      <div className='d-flex justify-content-between w-100'>
        <Navbar expand="lg" variant="dark" className="">
        <Container>
          <Navbar.Brand>Stations:</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/Event">
                <div className='station-link d-flex h-100'>
                  <div className='station-txt mtsrt hover-underline-animation st-txt-img justify-content-center align-self-center'>Event</div>
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/soc-radio-f3953.appspot.com/o/events%2FChristmas.png?alt=media&token=df6e8fd3-24e9-4021-8440-30c8e8e65a91">
                  </Image>
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
      
      
      {user ? <AccountHeader user={user}  /> : <SignIn />}
      </div>
    </div>
  )

}

export default Header;