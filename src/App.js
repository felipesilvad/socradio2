import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/App.scss';
import {auth} from './firebase';
import ChatRoom from './Components/ChatRoom';
import SignIn from './Components/SignIn';
import SignOut from './Components/SignOut';
import {Row,Col} from 'react-bootstrap';
import AudioPlayerComponent from './Components/AudioPlayerComponent';

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <Row>
        <Col md={9}>
          <AudioPlayerComponent />
        </Col>
        <Col md={3}>
          <header>
            {user ? <SignOut /> : <SignIn />}
          </header>

          <section>
            <ChatRoom />
          </section>
        </Col>
      </Row>
    </div>
  );
}

export default App;