import React from 'react';
import { waveform } from 'ldrs'

function LoadingScreen() {
  waveform.register()

  return (
    <div className='loading-screen'>
      <l-waveform
        size="66"
        stroke="3.5"
        speed="1" 
        color="white" 
      ></l-waveform>
    </div>
  )
}
export default LoadingScreen;
