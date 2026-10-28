import React, { useState, useEffect } from 'react';
import { db } from '../../supabase';

function EventCalendarItem({event, startTime, endTime, isPreviusDayEvent}) {
  const [playlist, setPlaylist] = useState()
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await db.getPlaylists();
        const playlist = data.find(p => p.id === event.playlist);
        setPlaylist(playlist);
      } catch (error) {
        console.error('Error fetching playlist:', error);
      }
    };

    fetchPlaylist();
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
      <div key={event.id} className='calender-event__item' 
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