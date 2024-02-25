import React, {useState, useEffect} from 'react';
import './styles/App.scss';
import Header from './Components/Header';
import {auth} from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import StationComponent from './Components/Station';
import DonatorStation from './Components/DonatorStation';
import {Routes, Route} from 'react-router-dom'
import ManageUsers from './Components/Adm/ManageUsers';
import ManageSongs from './Components/Adm/ManageSongs';
import ManageEventCalendar from './Components/Adm/ManageEventCalendar';

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <Header user={user} />
      <Routes>
        <Route path='/' element={<StationComponent user={user} station={"Main"} />} exact/>
        <Route path='/chill' element={<StationComponent user={user} station={"Chill"} />} exact/>
        <Route path='/event' element={<StationComponent user={user} station={"Event"} />} exact/>
        <Route path='/private' element={<DonatorStation user={user} station={"Private"} />} exact/>
        <Route path='/event-calendar' element={<ManageEventCalendar user={user} />} exact/>
        <Route path='/adm/users' element={<ManageUsers />} exact/>
        <Route path='/adm/songs' element={<ManageSongs />} exact/>
      </Routes>
      
    </div>
  );
}

export default App;