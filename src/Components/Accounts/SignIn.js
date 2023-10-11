import React, {useState,useEffect} from 'react';
import {auth,firestore} from '../../firebase';
import firebase from 'firebase/compat/app';
import {query,collection,onSnapshot} from "firebase/firestore";
import { Modal,Button,Form,Alert} from 'react-bootstrap';
import { createUserWithEmailAndPassword } from "firebase/auth";

function SignIn() {

  // Getting All Users
  const [users, setUsers] = useState('')
  useEffect (() => {
    onSnapshot(query(collection(firestore, `/users`)), (snapshot) => {
      setUsers(snapshot.docs.map(doc => (doc.data().email)))
    });
  }, [])

  // SignInForm
  const [email, setEmail] = useState()
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const [error, setError] = useState()

  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const usersRef = firestore.collection('users');

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(async (result) => {
      if (!users.includes(result.user.email)) {
        usersRef.doc(result.user.uid).set({
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid: result.user.uid,
          email: result.user.email,
          username: result.user.displayName,
        })
      }
    })
  }

  const SignUp = () => {
    try{
      createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        if (!users.includes(result.user.email)) {
          usersRef.doc(result.user.uid).set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid: result.user.uid,
            email: result.user.email,
            username: username,
          })
        } else {
          setError('Email already used')
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode,errorMessage)
      })
    }catch (e) {
      setError(e.message)
      console.log(e.message)
    }
  }
  
  return (
    <div>
      <button className="sign-in" onClick={handleShow}>Sign in</button>

      <Modal dark show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sign In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group id="email">
            <Form.Label>Email</Form.Label>
            <Form.Control onChange={(e) => setEmail(e.target.value)} type="email" required />
          </Form.Group>
          <Form.Group id="username">
            <Form.Label>Username</Form.Label>
            <Form.Control onChange={(e) => setUsername(e.target.value)} type="username" required />
          </Form.Group>
          <Form.Group id="password">
            <Form.Label>Password</Form.Label>
            <Form.Control onChange={(e) => setPassword(e.target.value)} type="password"  required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => SignUp()}>
            Sign UP
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
export default SignIn;