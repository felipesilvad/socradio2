import React, {useRef, useState, useEffect} from 'react';
import { db, subscriptions } from '../../supabase';
import ReactStars from "react-rating-stars-component";

function AudioPlayerRatings({songID, updateRating}) {
  const [ratings, setRatings] = useState();

  useEffect(() => {
    if (!songID) return;

    // Fetch initial ratings
    const fetchRatings = async () => {
      try {
        const ratingsData = await db.getSongRatings(songID);
        setRatings(ratingsData);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();

    // Subscribe to rating changes
    const ratingSubscription = subscriptions.subscribeToRatings(songID, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        fetchRatings();
      }
    });

    return () => {
      ratingSubscription.unsubscribe();
    };
  }, [songID, updateRating])

  const getAvgRating = () => {
    const average = ratings.reduce((total, next) => total + next.ratings, 0) / ratings.length;
    return average
  }

  if (ratings) {
    if (ratings.length) {
      return (
        <>
          <ReactStars
            count={5}
            edit={false}
            size={24}
            value={getAvgRating()}
            isHalf={true}
            emptyIcon={<i className="far fa-star"></i>}
            halfIcon={<i className="fa fa-star-half-alt"></i>}
            fullIcon={<i className="fa fa-star"></i>}
            activeColor="#ffd700"
          />
        </>
      )
    } else { return (
      <>
        <ReactStars
          count={5}
          edit={false}
          size={24}
          value={0}
          isHalf={true}
          emptyIcon={<i className="far fa-star"></i>}
          halfIcon={<i className="fa fa-star-half-alt"></i>}
          fullIcon={<i className="fa fa-star"></i>}
          activeColor="#ffd700"
        />
      </>
    )}
  }
}


export default AudioPlayerRatings;