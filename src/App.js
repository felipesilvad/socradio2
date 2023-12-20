import React from 'react';
import './styles/App.scss';
import Header from './Components/Header';
import {auth} from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import StationComponent from './Components/Station';
import {Routes, Route} from 'react-router-dom'
import ManageUsers from './Components/Adm/ManageUsers';

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <Header user={user} />
      <Routes>
        <Route path='/' element={<StationComponent user={user} station={"Main"} />} exact/>
        <Route path='/Chill' element={<StationComponent user={user} station={"Chill"} />} exact/>
        <Route path='/adm/users' element={<ManageUsers user={user} />} exact/>
      </Routes>
      
    </div>
  );
}

export default App;