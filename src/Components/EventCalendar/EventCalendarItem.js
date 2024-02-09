import React, { useState, useEffect } from 'react';
import { query, collection, onSnapshot, doc} from 'firebase/firestore';
import {firestore} from '../../firebase';
import {Table, Image} from 'react-bootstrap';

function EventCalendarItem({event, startTime, endTime, isPreviusDayEvent}) {
  const [playlist, setPlaylist] = useState()
  useEffect(() => {
    onSnapshot(doc(firestore, "/playlist/", event.playlist), (doc) => {
      setPlaylist(doc.data());
    });
  }, [event]);

  const getEventHeight = () => {
    if (endTime) {
      const subHours = endTime.toDate().getHours() - startTime
      return (subHours * 100)/24
    } else {
      const subHours = 24 - startTime
      return (subHours * 100)/24
    }
  }

  if (playlist) {
    return (
      <div className='calender-event__item' 
      style={{
        backgroundImage: `url(${playlist.img})`,
        height: `${getEventHeight()}%`
      }}>
        <div className='calender-event__txt mtsrt'>
          {startTime}:00
          <div>{playlist.title}</div>
        </div>
      </div>
    )
  }
}

export default EventCalendarItem;