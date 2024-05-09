import React from 'react';
import { lineWobble } from 'ldrs'

function MessageLoad() {

  lineWobble.register()

  return (
    <div className='loading-screen'>
      <l-line-wobble
        size="80"
        stroke="5"
        bg-opacity="0.1"
        speed="1.75" 
        color="#D81B60" 
      ></l-line-wobble>
    </div>
  )
}
export default MessageLoad;
