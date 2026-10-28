import React, {useState, useEffect} from 'react';

function ChatMessagePP({id,header}) {
  const [profilePic, setProfilePic] = useState()

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        // Static profile pics for now - could be moved to a database table
        const staticProfilePics = [
          { id: 'Q82gC4OPteYZCJPP3ur2', url: 'some-url-1' },
          { id: 'another-pic-id', url: 'some-url-2' }
        ];
        const profilePic = staticProfilePics.find(pic => pic.id === id);
        setProfilePic(profilePic);
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePic();
  }, [id]);

  if (profilePic) {
    return (
      <img className={`profile-img ${header&&("profile-img-header")}`} src={profilePic.url} alt="" />
    )
  }
}


export default ChatMessagePP;