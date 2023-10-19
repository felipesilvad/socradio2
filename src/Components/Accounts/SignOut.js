import React from 'react';
import {auth} from '../../firebase';
import {Button} from 'react-bootstrap';

function SignOut() {
  return auth.currentUser && (
    <Button className="sign-out" onClick={() => auth.signOut()}>Sign Out</Button>
  )
}

export default SignOut;