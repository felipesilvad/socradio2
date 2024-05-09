import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Clock from "react-live-clock";

function Footer({user}){
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className='footer'>
      <div className='d-flex justify-content-between w-100'>
        <Clock className='d-none d-lg-block d-flex justify-conent-end align-self-center mx-2'
        format={'HH:mm:ss'} ticking={true} />
        <div className='d-flex align-self-center h-100'>
          <Button className='footer-btn px-2 mx-1' target='_blank' href='https://forms.gle/7N4emHZs7jFdgeSE9'>Send Feedback</Button>
          <div className='version-btn' onClick={handleShow}>
            Beta v0.8
          </div>
        </div>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Features being worked</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          - Improve UI for mobile<br/>
          - Display current Station on Message<br/>
          - Unlockables Profile Pics When Listening to Event Station<br/>
          - See Other People Profile info on chat<br/>
          - Add bot message when !rate diplaying which song was rated<br/>
          - Seek song time on Private Station<br/>
          - Show next Song<br/>
          - Emotes<br/>
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