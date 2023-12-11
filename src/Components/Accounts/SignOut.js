import React from 'react';
import {auth} from '../../firebase';
import {Dropdown} from 'react-bootstrap';

function SignOut() {
  return auth.currentUser && (
    <Dropdown.Item className="sign-out" onClick={() => auth.signOut()}>Sign Out</Dropdown.Item>
  )
}

export default SignOut;