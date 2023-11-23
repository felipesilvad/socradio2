import React, {useRef, useState, useEffect} from 'react';
import { doc, collection, onSnapshot } from "firebase/firestore";
import {firestore} from '../../firebase';
import ReactStars from "react-rating-stars-component";

function AudioPlayerRatings({songID, user}) {
  const [ratings, setRatings] = useState(0);


  useEffect(() => {
    onSnapshot(collection(firestore, "/ratings/", songID, "/ratings/"), (snapshot) => {
      if (snapshot.docs) {
        setRatings(snapshot.docs.map(doc => ({...doc.data()})))
      }
    });
  }, [songID])

  const getAvgRating = () => {
    const average = ratings.reduce((total, next) => total + next.ratings, 0) / ratings.length;
    return average
  }

  if (ratings) {
    return (
      <>
        <ReactStars
          count={5}
          value={getAvgRating()}
          size={24}
          activeColor="#ffd700"
          edit={false}
          isHalf={true}
        />
        {console.log(getAvgRating())}
      </>
    )
  } else {
    return (
      <>
        <ReactStars
          count={5}
          value={0}
          size={24}
          activeColor="#ffd700"
          edit={false}
        />
      </>
    )
  }
}


export default AudioPlayerRatings;