import React from 'react';
import ChatRoom from './Chat/ChatRoom';
import AudioPlayerComponent from './AudioPlayer/AudioPlayerComponent';

function StationComponent({user,station}) {

  return (
    <>
      <AudioPlayerComponent station={station} user={user} />
      <ChatRoom user={user} />
    </>
  );
}

export default StationComponent;