import React from 'react';
import './styles/App.scss';
import ChatRoom from './Components/Chat/ChatRoom';
import Header from './Components/Header';
import {Row,Col} from 'react-bootstrap';
import AudioPlayerComponent from './Components/AudioPlayer/AudioPlayerComponent';
import {auth} from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <AudioPlayerComponent station={"Main"} user={user} />
      <ChatRoom user={user} />
      <Header user={user} />
    </div>
  );
}

export default App;