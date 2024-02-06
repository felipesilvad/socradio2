import React, { useState, useEffect } from 'react';
import { query, collection, onSnapshot, doc} from 'firebase/firestore';
import {firestore} from '../../firebase';
import {Table, Image} from 'react-bootstrap';
import EventCalendarDay from './EventCalendarDay';

function EventCalendar({events}) {
  var curr = new Date; // get current date
  var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week

  var sunday = new Date(curr.setDate(first));
  var monday = new Date(curr.setDate(first + 1));
  var tuesday = new Date(curr.setDate(first + 2));
  var wednesday = new Date(curr.setDate(first + 3));
  var thursday = new Date(curr.setDate(first + 4));
  var fryday = new Date(curr.setDate(first + 5));
  var saturday = new Date(curr.setDate(first + 6));


  if (sunday&&monday&&tuesday&&wednesday&&thursday&&fryday&&saturday) {
    return (
      <Table striped bordered hover variant="dark" className='calender-event__table'>
        <thead>
          <tr>
            <th>{sunday.toUTCString()}</th>
            <th>{monday.toUTCString()}</th>
            <th>{tuesday.toUTCString()}</th>
            <th>{wednesday.toUTCString()}</th>
            <th>{thursday.toUTCString()}</th>
            <th>{fryday.toUTCString()}</th>
            <th>{saturday.toUTCString()}</th>
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
    )
  }
}

export default EventCalendar;