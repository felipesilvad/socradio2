import React from 'react';
import './styles/App.scss';
import ChatRoom from './Components/Chat/ChatRoom';
import Header from './Components/Header';
import {Row,Col} from 'react-bootstrap';
import AudioPlayerComponent from './Components/AudioPlayer/AudioPlayerComponent';

function App() {


  return (
    <div className="App">
      <AudioPlayerComponent />
      <ChatRoom />
      <Header />
    </div>
  );
}

export default App;