import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/App.scss';
import {auth} from './firebase';
import ChatRoom from './Components/Chat/ChatRoom';
import Header from './Components/Header';
import {Row,Col} from 'react-bootstrap';
import AudioPlayerComponent from './Components/AudioPlayer/AudioPlayerComponent';

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <AudioPlayerComponent />
      <ChatRoom />
      <Header />
    </div>
  );
}

export default App;