import React, {useState} from 'react';
import {Row,Col} from 'react-bootstrap';
import LvFilter from './LvFilter';

function PlaylistSelector({playlistList, setPlaylistSongFromDB, changeRangeFilter, setCurrentPlaylist, currentPlaylist}) {
  const [show, setShow] = useState(false);

  const changePlaylist = (x) => {
    setPlaylistSongFromDB({label: x.title, value: x.id})
    setCurrentPlaylist(x)
    setShow(false)
  }

  return (
    <Row>
      <Col md={6}>
        <div className={`playlist-select mtsrt m-1 ${show&&('playlist-select-active')}`} style={currentPlaylist&&({backgroundImage: `url(${currentPlaylist.img})`})} onClick={() => setShow(!show)}>
          <div className='playlist-select__overlay'>
            Select Playlist
          </div>
        </div>
        {show&&(
          <div className='playlist-selector text-center'>
            {playlistList.map(x => (
              <div className='station-link playlist-selector__item mtsrt ' style={{backgroundImage: `url(${x.img})`}} 
              onClick={() => changePlaylist(x)}>
                <div className='playlist-selector__overlay hover-underline-animation'>
                  {x.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </Col>
      <Col>
        <LvFilter changeRangeFilter={changeRangeFilter} />
      </Col>
    </Row>
  )
}

export default PlaylistSelector;