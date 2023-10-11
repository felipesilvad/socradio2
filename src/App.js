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
        {/* <Col md={3}>
          <header>
            {user ? <SignOut /> : <SignIn />}
          </header>

          <section>
            
          </section>
        </Col> */}
    </div>
  );
}

export default App;