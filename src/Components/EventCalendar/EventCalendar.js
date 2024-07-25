import React, {useState} from 'react';
import {Table, OverlayTrigger, Tooltip} from 'react-bootstrap';
import EventCalendarDay from './EventCalendarDay';
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

function EventCalendar({events}) {
  var curr = new Date(); // get current date
  var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week

  const [nextWeek, setNextWeek] = useState(0)

  var sunday = new Date(curr.setDate(first + nextWeek));
  var monday = new Date(curr.setDate(first + nextWeek + 1));
  var tuesday = new Date(curr.setDate(first + nextWeek + 2));
  var wednesday = new Date(curr.setDate(first + nextWeek + 3));
  var thursday = new Date(curr.setDate(first + nextWeek + 4));
  var fryday = new Date(curr.setDate(first + nextWeek + 5));
  var saturday = new Date(curr.setDate(first + nextWeek + 6));

  const weekTooltip = (txt) => {
    return (
      <Tooltip id="tooltip">
        {txt}
      </Tooltip>
    )
  }

  const tooltip = (text) => {
    return (
      <Tooltip id="tooltip">
        {text}
      </Tooltip>
    )
  }

  if (sunday&&monday&&tuesday&&wednesday&&thursday&&fryday&&saturday) {
    return (
      <div className='d-flex'>

        {(nextWeek!==0)&&(
          <OverlayTrigger placement="right" overlay={tooltip("Previous Week")}>
            <div className='week-arrow-l' onClick={() => setNextWeek(0)}>
              <IoIosArrowBack className='week-arrow-icon' />
            </div>
          </OverlayTrigger>
        )}
        <Table striped bordered hover variant="dark" className='calender-event__table'>
          <thead>
            <tr>
              <th>{sunday.toString().slice(0,10)}</th>
              <th>{monday.toString().slice(0,10)}</th>
              <th>{tuesday.toString().slice(0,10)}</th>
              <th>{wednesday.toString().slice(0,10)}</th>
              <th>{thursday.toString().slice(0,10)}</th>
              <th>{fryday.toString().slice(0,10)}</th>
              <th>{saturday.toString().slice(0,10)}</th>
            </tr>
          </thead>
          <tbody className='h-100'>
              <tr>
                <EventCalendarDay day={sunday} events={events} />
                <EventCalendarDay day={monday} events={events} />
                <EventCalendarDay day={tuesday} events={events} />
                <EventCalendarDay day={wednesday} events={events} />
                <EventCalendarDay day={thursday} events={events} />
                <EventCalendarDay day={fryday} events={events} />
                <EventCalendarDay day={saturday} events={events} />
              </tr>
          </tbody>
        </Table>
        {!nextWeek&&(
          <OverlayTrigger placement="left"  overlay={tooltip("Next Week")}>
              <div className='week-arrow-r' onClick={() => setNextWeek(7)}>
                <IoIosArrowForward className='week-arrow-icon' />
              </div>
          </OverlayTrigger>
        )}
      </div>
    )
  }
}

export default EventCalendar;