import React, {useRef, useState, useEffect} from 'react';
import { doc, collection, onSnapshot } from "firebase/firestore";
import {firestore} from '../../firebase';

function AudioPlayerRatings({songID}) {
  const [ratings, setRatings] = useState();


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
        Rating: {getAvgRating()}
      </>
    )
  } else {
    return (
      <> 
        No Ratings
      </>
    )
  }
}


export default AudioPlayerRatings;