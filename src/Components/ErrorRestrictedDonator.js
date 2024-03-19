import React from 'react';
import {Image} from 'react-bootstrap';

function ErrorRestrictedDonator() {

  return (
    <div className='message-display d-flex justify-content-center align-self-center'>
      <div className='ardela text-center d-flex justify-content-center align-self-center h-100'>
        <div>
          <h3>The Private Station is available for donators only.</h3>
          <div>
            <a href='https://ko-fi.com/K3K56YN5G' target='_blank'><img height='50' src='https://storage.ko-fi.com/cdn/kofi2.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorRestrictedDonator;