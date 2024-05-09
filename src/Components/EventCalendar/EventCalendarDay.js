import React from 'react';
import EventCalendarItem from './EventCalendarItem';

function EventCalendarDay({day, events}) {

  const isSameDay = function(date, otherDate) {
    return date.toDateString() === otherDate.toDate().toDateString();
  };

  const getDayEvents = (date) => {
    const day_events = events.filter(event => isSameDay(date, event.startTime))
    if (day_events.length > 0) {
      return day_events
    }
  }
  
  const dayEvents = getDayEvents(day)

  const getEventEndTime = (index) => {
    if (dayEvents[index+1]) {
      return dayEvents[index+1].startTime
    } else {
      return false
    }
  }


  if (day) {
    return (
      <td className='event-calendar__td'>
        {dayEvents&&(dayEvents[0].startTime.toDate().getHours() !== 0&&(
          (events.indexOf(dayEvents[0])-1)>0&&(
            <EventCalendarItem event={events[events.indexOf(dayEvents[0])-1]}
            startTime={0} endTime={dayEvents[0].startTime}
            isPreviusDayEvent={true} />
          )
        ))}
        {dayEvents&&(dayEvents.map((event, index) => (
          <EventCalendarItem event={event} startTime={event.startTime.toDate().getHours()} endTime={getEventEndTime(index)}/>
        )))}
      </td>
    )
  }
}

export default EventCalendarDay;