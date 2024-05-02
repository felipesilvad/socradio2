import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {Container, OverlayTrigger, Tooltip} from 'react-bootstrap';
import Clock from "react-live-clock";

function Footer({user}){
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const tooltip = (text) => {
    return (
      <Tooltip id="tooltip">
        {text}
      </Tooltip>
    )
  }

  


  return (
    <div className='footer'>
      <div className='d-flex justify-content-between w-100'>
        <Clock className='d-none d-lg-block d-flex justify-conent-end align-self-center mx-2'
        format={'HH:mm:ss'} ticking={true} />
        <div className='version-btn' onClick={handleShow}>
          v0.8
        </div>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Features being worked</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          - Improve UI for mobile<br/>
          - Unlockables Profile Pics When Listening to Event Station<br/>
          - Fix Profile Pic Change not changing until refresh<br/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )

}

export default Footer;