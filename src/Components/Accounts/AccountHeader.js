import React, {useState,useEffect} from 'react';
import {db, auth} from '../../supabase';
import {Dropdown,Modal,Button,Image} from 'react-bootstrap';
import SignOut from './SignOut';
import ChatMessagePP from '../Chat/ChatMessagePP';
import ChangePP from './ChangePP';
import { BiSolidGift } from "react-icons/bi";

function AccountHeader({user}) {

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

    // Subscribe to user data changes
    const userSubscription = auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserData();
      }
    });

    return () => {
      if (userSubscription?.subscription) {
        userSubscription.subscription.unsubscribe();
      }
    };
  }, [user]);

  const [profilePics, setProfilePics] = useState([])
  const [profilePicsUnlocked, setProfilePicsUnlocked] = useState([])

  const now = new Date().getTime()

  useEffect (() => {
    // Static profile pics for now - could be moved to a database table
    const staticProfilePics = [
      { id: 'pic1', url: 'some-url-1', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31') },
      { id: 'pic2', url: 'some-url-2', startDate: new Date('2024-06-01'), endDate: new Date('2024-12-31') }
    ];
    setProfilePics(staticProfilePics);
  }, [])

  useEffect (() => {
    if (profilePics.length > 0 && userData && userData.unlockedProfilePics) {
      const profilePicsUnlocked = profilePics.filter((item) => (
        now >= (new Date(item.startDate).getTime()) && now <= (new Date(item.endDate).getTime())
      )).filter((item) => (
        !userData.unlockedProfilePics.includes(item.id)
      ));
  
      setProfilePicsUnlocked(profilePicsUnlocked)
    }
  }, [profilePics, userData, now])


  // Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const ClaimUnlocks = async () => {
    try {
      const NewArray = [...(userData.unlockedProfilePics || [])];
      profilePicsUnlocked.forEach(pp => {
        if (!NewArray.includes(pp.id)) {
          NewArray.push(pp.id);
        }
      });

      await db.updateUser(user.id, {
        unlockedProfilePics: NewArray
      });

      // Refresh user data
      const updatedUserData = await db.getUser(user.id);
      setUserData(updatedUserData);

      console.log('Claimed unlocks:', NewArray);
      handleClose();
    } catch (error) {
      console.error('Error claiming unlocks:', error);
    }
  }

  return (
    <Dropdown>
      {profilePicsUnlocked&&((profilePicsUnlocked.length > 0) ? (
        <>
         <BiSolidGift className='present-icon' onClick={() => handleShow()} />
        </>
      ) : (
        <>
          <BiSolidGift className='present-icon present-icon-none' />
        </>
      ))}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Unlocks</Modal.Title>
        </Modal.Header>
          <div>
            {!!profilePicsUnlocked && (profilePicsUnlocked.map(pic => (
              <>
                <Image src={pic.url} key={pic.id}
                className="pic-select"
                />
              </>
            )))}
          </div>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => ClaimUnlocks()}>
              Claim
            </Button>
          </Modal.Footer>
      </Modal>


      <Dropdown.Toggle className='profile-dropdown m-2' id="dropdown-basic">
        {userData&&(<ChatMessagePP id={userData.profilePic} header={true} />)}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {/* <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item> */}
        <ChangePP userID={user.uid}/>
        <SignOut />
      </Dropdown.Menu>
    </Dropdown>
  )
}
export default AccountHeader;

