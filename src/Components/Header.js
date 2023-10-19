import React, {useRef, useEffect} from 'react';
import SignIn from './Accounts/SignIn';
import SignOut from './Accounts/SignOut';
import { useAuthState } from 'react-firebase-hooks/auth';
import {auth} from '../firebase';

function Header(){

  const [user] = useAuthState(auth);
  return (
    <div className='header'>
      {user ? <SignOut /> : <SignIn />}
    </div>
  )

}

export default Header;