import React, { useState, useEffect } from 'react';
import { query, collection, onSnapshot, doc, orderBy, where, getDocs} from 'firebase/firestore';
import {firestore} from '../../firebase';
import {Row, Col, Button, Form} from 'react-bootstrap';
import Select from 'react-select'
import EventCalendar from '../EventCalendar/EventCalendar';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function ManageEventCalendar({user}) {
  const [playlists, setPlaylists] = useState([])
  const [events, setEvents] = useState([])

  useEffect (() => {
    onSnapshot(query(collection(firestore, `/playlist`)), (snapshot) => {
      setPlaylists(snapshot.docs.map(doc => ({value: doc.id, label: doc.data().title})))
    });
    onSnapshot(query(collection(firestore, `/eventCalendar`), orderBy('startTime')), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
    });
  }, [])

  const [userData, setUserData] = useState()
  useEffect(() => {
    if (user) {
      onSnapshot(doc(firestore, "/users/", user.uid), (doc) => {
        setUserData(doc.data());
      });
    }
  }, [user]);


  const customStyles = {
    option: provided => ({
      ...provided,
      color: 'black'
    }),
    control: provided => ({
      ...provided,
      color: 'black'
    }),
    singleValue: provided => ({
      ...provided,
      color: 'black'
    })
  }

  var curr = new Date;
  let handleColor = (time) => {
    return time.getHours() > 12 ? "text-success" : "text-error";
  };

  const [selectedPlaylist, setSelectedPlaylist] = useState([])
  const [selectedDate, setSelectedDate] = useState(curr)

  const addEvent = () => {
    firestore.collection('eventCalendar').add({
      playlist: selectedPlaylist,
      startTime: selectedDate,
    })
    console.log('eventAdded')
  }
    
  const [color1, setColor1] = useState()
  const [color2, setColor2] = useState()

  const changeColor = async () => {
    if (color1&&color2) {
      const citiesRef = collection(firestore, "songs");
      const q = query(citiesRef, where("color", "==", color1));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        firestore.collection('songs').doc(doc.id).set({
          color: color2,
        }, {merge: true})
      });
      console.log("colors updated")
    } else {
      console.log("select colors dude")
    }
  }

  return (
    <div className='playlist-display'>
      <h3 className='ardela text-center mt-2'>Event Calendar</h3>
      {userData&&(userData.roles.includes('Admin')&&(
        <Row>
          <Col>
            <label>Add Event</label>
            <div className='d-flex justify-content-center'>
              <Select
                closeMenuOnSelect={false}
                options={playlists}
                styles={customStyles}
                onChange={(e) => setSelectedPlaylist(e.value)}
              />
              <DatePicker
                showTimeSelect
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                timeClassName={handleColor}
              />
              <Button onClick={() => addEvent()}>Add</Button>
            </div>
          </Col>
          <Col>
            <label>Change Color</label>
            <div className='d-flex'>
              <Form.Control placeholder="From" onChange={(e) => setColor1(e.target.value)} />
              <Form.Control placeholder="To" onChange={(e) => setColor2(e.target.value)} />
              <Button onClick={() => changeColor()}>Change</Button>
            </div>
          </Col>
          
        </Row>
      ))}
      <EventCalendar events={events} />
    </div>
  )
  ;
}

export default ManageEventCalendar;