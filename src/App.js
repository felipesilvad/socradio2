import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/App.scss';
import {auth} from './firebase';
import ChatRoom from './Components/ChatRoom';
import SignIn from './Components/SignIn';
import SignOut from './Components/SignOut';
import { Container,Row,Col } from 'react-bootstrap';

function App() {

  const [user] = useAuthState(auth);

  return (
    <Container className="App">
      <Row>
        <Col md={8}>
          Music Player
        </Col>
        <Col md={4}>
          <header>
            {user ? <SignOut /> : <SignIn />}
          </header>

          <section>
            <ChatRoom />
          </section>
        </Col>
      </Row>
    </Container>
  );
}

export default App;