import React from 'react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {Image} from 'react-bootstrap';
import AudioPlayerRatings from './AudioPlayerRatings';

function AudioPlayerComponent({playlist, currentSongIndex, player, onEndedSong, user}) {
  
  if (Number.isInteger(currentSongIndex)) {
    return (
      <>
        {/* <Radio audio={currentSong.audio} /> */}
        <div className="audio-player-display" style={{
          backgroundImage: `url(${playlist[currentSongIndex].data.cover})`
        }}>
        </div>
        <div className='bg-overlay'>
          <Image className="cover-img" src={playlist[currentSongIndex].data.cover} />
          <div className='song-txt'>
            <div className='ml-2 mt-2' >
              <h1>{playlist[currentSongIndex].data.title}</h1>
              <h2>{playlist[currentSongIndex].data.artist}</h2>
              <h4>{playlist[currentSongIndex].data.album}</h4>
            </div>
            <AudioPlayer
              autoPlay={true}
              src={playlist[currentSongIndex].data.audio}
              // onPlay={e => console.log("onPlay")}
              ref={player}
              onEnded={() => onEndedSong()}
              showDownloadProgress={false}
              showJumpControls={false}
              hasDefaultKeyBindings={false}
              autoPlayAfterSrcChange={true}
              customControlsSection={[RHAP_UI.VOLUME_CONTROLS]}
              layout={'horizontal'}
            />

            <AudioPlayerRatings songID={playlist[currentSongIndex].id} user={user} />

          </div>
        </div>
      </>
    )
  }
}


export default AudioPlayerComponent;