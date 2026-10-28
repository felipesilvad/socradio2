import React, {useState,useEffect} from 'react';
import {auth, db} from '../../supabase';
import {Image,Modal,Button,Form,Alert,Row,Col} from 'react-bootstrap';
import LoadingScreen from '../LoadingScreen';

function SignIn() {
  // Getting All Users
  const [users, setUsers] = useState([])
  useEffect (() => {
    const fetchUsers = async () => {
      try {
        const usersData = await db.getUsers();
        setUsers(usersData.map(u => u.email));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [])

  
  // Profile Pic & Color
  const colors = ["#2a9d8f","#e9c46a","#f4a261","#e76f51","#219ebc","#ffb703","#fb8500","#8ecae6","#bdb2ff","#f07167","#c77dff"]

  const [profilePics, setProfilePics] = useState([])
  const [selectedPic, setSelectedPic] = useState('Q82gC4OPteYZCJPP3ur2')

  useEffect (() => {
    // Static profile pics for now - could be moved to a database table
    const staticProfilePics = [
      { id: 'Q82gC4OPteYZCJPP3ur2', url: 'some-url-1' },
      { id: 'another-pic-id', url: 'some-url-2' }
    ];
    setProfilePics(staticProfilePics);
  }, [])

  const selectImage = (id, url) => {
    setSelectedPic(id)
  }
  
  const [signUp, setSignUp] = useState(false)
  // SignInForm
  const [email, setEmail] = useState()
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const [error, setError] = useState()

  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const signIn = (email,password) => {
    return auth.signInWithPassword({email, password})
  };

  // Load
  const [loading, setLoading] = useState(false);

  const loginWithEmailHandler = (email, password) => {
    setLoading(true)
    auth.signInWithPassword({ email, password })
      .then((result) => {
        const user = result.user;
        console.log("user:",user)
        setLoading(false)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        setError(errorMessage.replace('AuthApiError: ', ''))
        setLoading(false)
      });
  }

  const signInWithGoogle = () => {
    // Google OAuth would need to be set up in Supabase
    // For now, showing placeholder
    console.log('Google sign in needs to be configured in Supabase');
  }

  const SignUp = () => {
    try{
      if (email) {
        if (!users.includes(email)) {
          if (username) {
            if (password) {
              setLoading(true)
              auth.signUp({
                email: email,
                password: password,
                options: {
                  data: {
                    username: username,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    profilePic: selectedPic,
                    unlockedPP: [],
                    unlockedTitles: [],
                    roles: []
                  }
                }
              })
              .then((result) => {
                // User is created with metadata
                setLoading(false)
              }).catch((error) => {
                setLoading(false)
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(errorMessage.replace('AuthApiError: ', ''))
              })
            } else {setError('Password is required')}
          } else {setError('Username is required')}
        } else {setError('Email already used')}
      } else {setError('Email is required')}
    } catch (e) {
      setError(e.message)
    }
  }
  return (
    <>
      <Button className="sign-in-btn my-3" onClick={handleShow}>Sign in</Button>

      <Modal show={show} onHide={handleClose}>
        {loading&&(
          <LoadingScreen />
        )}
        <Modal.Header closeButton>
          <Modal.Title>{signUp?('Sign Up'):('Sign In')}</Modal.Title>
        </Modal.Header>
          {error&&(<Alert variant="danger">{error}</Alert>)}
          {signUp?(<>
            <Row>
              <Col lg={5}>
                <Modal.Body>
                  <Form.Group id="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control autocomplete="off" onChange={(e) => setEmail(e.target.value)} type="email" required />
                  </Form.Group>
                  <Form.Group id="username">
                    <Form.Label>Username</Form.Label>
                    <Form.Control autocomplete="off" onChange={(e) => setUsername(e.target.value)} type="username" required />
                  </Form.Group>
                  <Form.Group id="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control autocomplete="off" onChange={(e) => setPassword(e.target.value)} type="password"  required />
                  </Form.Group>
                </Modal.Body>
              </Col>
              <Col lg={7}>
                <Form.Label>Select Profile Pic</Form.Label>
                <div>
                  {!!profilePics && (profilePics.map(pic => (
                    <>
                      <Image src={pic.url} key={pic.id}
                      className={(selectedPic === pic.id) ? ('pic-select pic-select-active') : ('pic-select')}
                      onClick={() => selectImage(pic.id, pic.url)} />
                    </>
                  )))}
                </div>
              </Col>
            </Row>
            
            <Modal.Footer>
              <h6 className='sign-txt' onClick={() => setSignUp(false)}>
                Already have an account? Sign In
              </h6>
              <Button className='sign-in-btn' onClick={() => SignUp()}>
                Sign Up
              </Button>
            </Modal.Footer>
          </>):(<>
            <Modal.Body>
              <Form.Group id="email">
                <Form.Label>Email</Form.Label>
                <Form.Control autocomplete="off" onChange={(e) => setEmail(e.target.value)} type="email" required />
              </Form.Group>

              <Form.Group id="password">
                <Form.Label>Password</Form.Label>
                <Form.Control autocomplete="off" onChange={(e) => setPassword(e.target.value)} type="password"  required />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <h6 className='sign-txt' onClick={() => setSignUp(true)}>
                Don't have an account? Sign Up
              </h6>
              <Button className='sign-in-btn' onClick={() => loginWithEmailHandler(email,password)}>
                Sign In
              </Button>
            </Modal.Footer>
          </>)}
          
      </Modal>
    </>
  )
}
export default SignIn;
