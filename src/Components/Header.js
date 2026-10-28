import React, {useEffect, useState} from 'react';
import SignIn from './Accounts/SignIn';
import Navbar from 'react-bootstrap/Navbar';
import {Container, OverlayTrigger, Tooltip} from 'react-bootstrap';
import AccountHeader from './Accounts/AccountHeader';
import { TbCalendarTime } from "react-icons/tb";
import { Link } from 'react-router-dom';
import { FiGift } from "react-icons/fi";
import HeaderStations from "./HeaderStations"
import { FaCaretDown } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';
const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

const db = supabase;

function Header({user}){
  const [upcomingPlaylists, setUpcomingPlaylists] = useState([])
  const [currentPlaylist, setCurrentPlaylist] = useState([])
  const [eventImg, setEventImg] = useState()
  const [eventTitle, setEventTitle] = useState()

  const [userData, setUserData] = useState()
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await db.getUser(user.id);
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect (() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await db
          .from('eventCalendar')
          .select('*')
          .order('startTime', { ascending: true });
        if (error) {
          console.error('Error fetching events:', error);
        } else {
          setUpcomingPlaylists(data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [upcomingPlaylists])
  useEffect (() => {
    const currDate = new Date();
    if (upcomingPlaylists.length>0) {
      const nextPlaylist = upcomingPlaylists.filter(x => x.startTime.toDate() >= currDate)[0]
      setCurrentPlaylist(upcomingPlaylists[upcomingPlaylists.indexOf(nextPlaylist)-1])
    }
  }, [upcomingPlaylists])
  useEffect (() => {
    if (currentPlaylist) {
      if (currentPlaylist.playlist) {
        const fetchPlaylist = async () => {
          try {
            const { data, error } = await db
              .from('playlist')
              .select('*')
              .eq('id', currentPlaylist.playlist);
            if (error) {
              console.error('Error fetching playlist:', error);
            } else {
              const playlist = data[0];
              if (playlist) {
                setEventImg(playlist.img);
                setEventTitle(playlist.title);
              }
            }
          } catch (error) {
            console.error('Error fetching playlist:', error);
          }
        };

        fetchPlaylist();
      }
    }
  }, [currentPlaylist]);

  const tooltip = (text) => {
    return (
      <Tooltip id="tooltip">
        {text}
      </Tooltip>
    )
  }

  const [showNav, setShowNav] = useState(false)

  return (
    <div className='header'>
      <div className='d-flex justify-content-between w-100'>

        <Navbar expand="lg" variant="dark" className="d-none d-lg-block">
          <Container className='mt-2'>
            <div className='mtsrt'>STATIONS</div>
            <HeaderStations userData={userData} eventImg={eventImg} eventTitle={eventTitle} />
          </Container>
        </Navbar>

        <div className='nav-bar-mobile d-lg-none d-xl-none'>

          <div className='mtsrt nav-bar-mobile__btn' 
          onClick={() => setShowNav(!showNav)}>
            STATIONS <FaCaretDown />
          </div>

          {showNav&&(
            <div className='nav-bar-show'>
              <HeaderStations userData={userData} eventImg={eventImg} eventTitle={eventTitle} />
            </div>
          )}
        </div>
      
        <div className='d-flex justify-conent-end align-self-center'>

          {/* <Clock className='d-none d-lg-block d-flex justify-conent-end align-self-center mx-2'
           format={'HH:mm:ss'} ticking={true} /> */}
          
          <OverlayTrigger placement="bottom" 
          overlay={tooltip("No Unlockables available")}>
            <div className='d-flex justify-conent-end align-self-center mx-2'>
              <FiGift  className='header-icon-unavaible' />
            </div>
          </OverlayTrigger>

          <OverlayTrigger placement="bottom" 
          overlay={tooltip("Event Station Calendar")}>
            <Link to={"/event-calendar"} className='d-flex justify-conent-end align-self-center mx-2'>
              <TbCalendarTime className='header-icon' />
            </Link>
          </OverlayTrigger>

          {user ? <AccountHeader user={user}  /> : <SignIn />}
        </div>
      </div>
    </div>
  )

}

export default Header;