import React, {useState, useEffect} from 'react';
import './styles/App.scss';
import Header from './Components/Header';
import {auth} from './supabase';
import StationComponent from './Components/Station';
import DonatorStation from './Components/DonatorStation';
import GlobalStation from './Components/Station/GlobalStation';
import {Routes, Route} from 'react-router-dom'
import {db, subscriptions} from './supabase';
import AdmMain from './Components/Adm/AdmMain';
import ManageUsers from './Components/Adm/ManageUsers';
import ManageSongs from './Components/Adm/ManageSongs';
import ManagePlaylists from './Components/Adm/ManagePlaylists';
import ManageEventCalendar from './Components/Adm/ManageEventCalendar';
import ErrorRestrictedDonator from './Components/ErrorRestrictedDonator';
import LoadingScreen from './Components/LoadingScreen';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState()
  const [loading, setLoading] = useState(true)

  const delay = ms => new Promise(res => setTimeout(res, ms));
  const manualLoad = async () => {
    await delay(5000);
    setLoading(false)
  };

  useEffect(() => {
    // Get initial user session
    auth.currentUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChanged((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Get initial user data
      db.getUser(user.uid).then(data => {
        setUserData(data);
        setLoading(false);
      }).catch(error => {
        console.error('Error fetching user data:', error);
        setLoading(false);
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
    } else {
      manualLoad();
    }
  }, [user]);

  return (
    <div className="App">
      <Header user={user} />

      {loading&&(
        <LoadingScreen />
      )}
      
      <Routes>
        {/* Default redirect to global station */}
        <Route path='/' element={<GlobalStation user={user} />} exact/>
        
        {/* Global Synchronized Stations */}
        <Route path='/global' element={<GlobalStation user={user} />} exact/>
        <Route path='/global/main' element={<GlobalStation user={user} />} exact/>
        <Route path='/global/chill' element={<GlobalStation user={user} />} exact/>
        <Route path='/global/rock' element={<GlobalStation user={user} />} exact/>
        
        {/* Legacy Station Routes (for comparison/testing) */}
        <Route path='/legacy' element={<StationComponent user={user} station={"Main"} />} exact/>
        <Route path='/chill' element={<StationComponent user={user} station={"Chill"} />} exact/>
        <Route path='/event' element={<StationComponent user={user} station={"Event"} />} exact/>
        {(userData&&(userData.user_roles && userData.user_roles.some(r => r.role === 'Donator'))?(
          <Route path='/private' element={<DonatorStation user={user} station={"Private"} />} exact/>
        ) : (
          <Route path='/private' element={<ErrorRestrictedDonator />} exact/>
        ))}
        <Route path='/event-calendar' element={<ManageEventCalendar user={user} />} exact/>
        {(userData&&(userData.user_roles && userData.user_roles.some(r => r.role === 'Admin'))&&(
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