import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/App.scss';
import {auth} from './firebase';
import ChatRoom from './Components/ChatRoom';
import SignIn from './Components/Accounts/SignIn';
import SignOut from './Components/Accounts/SignOut';
import {Row,Col} from 'react-bootstrap';
import AudioPlayerComponent from './Components/AudioPlayer/AudioPlayerComponent';

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <AudioPlayerComponent />
      <ChatRoom />
      <div className='header'>
        {user ? <SignOut /> : <SignIn />}
      </div>
    </div>
  );
}

export default App;