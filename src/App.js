import React, {useState, useEffect} from 'react';
import './styles/App.scss';
import Header from './Components/Header';
import {auth} from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import StationComponent from './Components/Station';
import DonatorStation from './Components/DonatorStation';
import {Routes, Route} from 'react-router-dom'
import {onSnapshot, doc} from 'firebase/firestore';
import {firestore} from './firebase';
import AdmMain from './Components/Adm/AdmMain';
import ManageUsers from './Components/Adm/ManageUsers';
import ManageSongs from './Components/Adm/ManageSongs';
import ManagePlaylists from './Components/Adm/ManagePlaylists';
import ManageEventCalendar from './Components/Adm/ManageEventCalendar';
import ErrorRestrictedDonator from './Components/ErrorRestrictedDonator';
import Footer from './Components/Footer'
function App() {
  const [user] = useAuthState(auth);

  const [userData, setUserData] = useState()
  useEffect(() => {
    if (user) {
      onSnapshot(doc(firestore, "/users/", user.uid), (doc) => {
        setUserData(doc.data());
      });
    }
  }, [user]);

  return (
    <div className="App">
      <Header user={user} />
      <Footer />
      <Routes>
        <Route path='/' element={<StationComponent user={user} station={"Main"} />} exact/>
        <Route path='/chill' element={<StationComponent user={user} station={"Chill"} />} exact/>
        <Route path='/event' element={<StationComponent user={user} station={"Event"} />} exact/>
        {(userData&&(userData.roles.includes('Donator'))?(
          <Route path='/private' element={<DonatorStation user={user} station={"Private"} />} exact/>
        ) : (
          <Route path='/private' element={<ErrorRestrictedDonator />} exact/>
        ))}
        <Route path='/event-calendar' element={<ManageEventCalendar user={user} />} exact/>
        {(userData&&(userData.roles.includes('Admin'))&&(
          <>
            <Route path='/adm' element={<AdmMain />} exact/>
            <Route path='/adm/users' element={<ManageUsers />} exact/>
            <Route path='/adm/songs' element={<ManageSongs />} exact/>
            <Route path='/adm/playlists' element={<ManagePlaylists />} exact/>
          </>
        ))}
      </Routes>
    </div>
  );
}

export default App;