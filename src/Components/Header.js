import React, {useRef, useEffect} from 'react';
import SignIn from './Accounts/SignIn';
import SignOut from './Accounts/SignOut';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { Link } from "react-router-dom";
function Header({user}){

  return (
    <div className='header'>
      <div className='d-flex justify-content-between w-100'>
        <Navbar expand="lg" variant="dark" className="">
        <Container>
          <Navbar.Brand href="#home">Stations:</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Main</Nav.Link>
              <Nav.Link href="/Chill">Chill</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
        
        {user ? <SignOut /> : <SignIn />}
      </div>
    </div>
  )

}

export default Header;