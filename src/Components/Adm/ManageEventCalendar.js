import React, { useState, useEffect } from 'react';
import { db, subscriptions } from '../../supabase';
import {Row, Col, Button, Form} from 'react-bootstrap';
import Select from 'react-select'
import EventCalendar from '../EventCalendar/EventCalendar';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function ManageEventCalendar({user}) {
  const [playlists, setPlaylists] = useState([])
  const [events, setEvents] = useState([])

  useEffect (() => {
    const fetchData = async () => {
      try {
        // Fetch playlists
        const playlistData = await db.getPlaylists();
        setPlaylists(playlistData.map(p => ({value: p.id, label: p.title})));
        
        // Fetch events
        const eventsData = await db.getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [])

  const [userData, setUserData] = useState()
  useEffect(() => {
    if (user) {
      // Get initial user data
      db.getUser(user.uid).then(data => {
        setUserData(data);
      }).catch(error => {
        console.error('Error fetching user data:', error);
      });

      // Subscribe to user data changes
      const userSubscription = subscriptions.subscribeToUser(user.uid, (payload) => {
        if (payload.eventType === 'UPDATE') {
          db.getUser(user.uid).then(data => {
            setUserData(data);
          }).catch(error => {
            console.error('Error fetching updated user data:', error);
          });
        }
      });

      // Subscribe to user roles changes
      const rolesSubscription = subscriptions.subscribeToUserRoles(user.uid, () => {
        db.getUser(user.uid).then(data => {
          setUserData(data);
        }).catch(error => {
          console.error('Error fetching updated user roles:', error);
        });
      });

      return () => {
        userSubscription.unsubscribe();
        rolesSubscription.unsubscribe();
      };
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
    db.addEvent(selectedPlaylist, selectedDate)
      .then(() => {
        console.log('eventAdded');
        // Refresh events
        db.getEvents().then(eventsData => {
          setEvents(eventsData);
        });
      })
      .catch(error => {
        console.error('Error adding event:', error);
      });
  }
    
  const [color1, setColor1] = useState()
  const [color2, setColor2] = useState()

  const changeColor = async () => {
    if (color1&&color2) {
      try {
        await db.updateSongColor(color1, color2);
        console.log("colors updated");
      } catch (error) {
        console.error('Error updating colors:', error);
      }
    } else {
      console.log("select colors dude")
    }
  }

  return (
    <div className='playlist-display'>
      <h3 className='ardela text-center mt-2'>Event Calendar</h3>
      {(userData&&(userData.user_roles && userData.user_roles.some(r => r.role === 'Admin'))&&(
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