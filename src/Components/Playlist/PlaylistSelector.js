import React, {useState, useRef, useEffect} from 'react';
import {Row,Col} from 'react-bootstrap';
import LvFilter from './LvFilter';
import Form from 'react-bootstrap/Form';
import { FaCaretDown } from "react-icons/fa";

function PlaylistSelector({playlistList, setPlaylistSongFromDB, changeRangeFilter, setCurrentPlaylist, currentPlaylist}) {
  const [show, setShow] = useState(false);

  function useOutsideAlerter(ref) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShow(false)
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  const changePlaylist = (x) => {
    setPlaylistSongFromDB({label: x.title, value: x.id})
    setCurrentPlaylist(x)
    setShow(false)
  }

  const [searchQ, setSerachQ] = useState(false);

  function filterByValue(array, string) {
    if (searchQ) {
      return array.filter(o => o.title.toLowerCase().replace('é','e').includes(string.toLowerCase()));
    } else {
      return array
    }
  }

  return (
    <Row className='mt-1'>
      <Col md={7}>
        <div ref={wrapperRef}>
          <div className={`playlist-select mtsrt m-1 ${show&&('playlist-select-active')}`} style={currentPlaylist&&({backgroundImage: `url(${currentPlaylist.img})`})}
          onClick={() => setShow(true)}>
            {(show) ? (
              <Form.Control onChange={(e) => setSerachQ(e.target.value)}
              className='search-playlist' type="text" placeholder="Search" />
            ) : (
              <div className='playlist-select__overlay'>
                <div className='playlist-select__overlay-txt'>
                  {currentPlaylist?(
                    currentPlaylist.title
                  ):(
                    "Select Playlist"
                  )}
                </div>
                <FaCaretDown />
              </div>
            )}
          </div>
          {show&&(
            <div className='playlist-selector text-center'>
              {filterByValue(playlistList, searchQ).length>0?(
                filterByValue(playlistList, searchQ).map(x => (
                  <div className='station-link playlist-selector__item mtsrt ' style={{backgroundImage: `url(${x.img})`}} 
                  onClick={() => changePlaylist(x)}>
                    <div className='playlist-selector__overlay hover-underline-animation'>
                      {x.title}
                    </div>
                  </div>
                ))
              ) : (
                <div className='station-link playlist-selector__item mtsrt cursor-default'>
                  <div className='playlist-selector__overlay'>
                    No Results
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Col>
      <Col>
        <LvFilter changeRangeFilter={changeRangeFilter} />
      </Col>
    </Row>
  )
}

export default PlaylistSelector;