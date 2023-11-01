import React, {useRef, useState, useEffect} from 'react';
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import {firestore} from '../../firebase';
import ReactStars from "react-rating-stars-component";

function AudioPlayerRatings({songID, user}) {
  const [ratings, setRatings] = useState(0);
  const ratingsRef = firestore.collection('ratings');
  // const query = ratingsRef.orderBy('createdAt').limit(25);


  useEffect(() => {
    onSnapshot(doc(firestore, "/ratings/", songID), (doc) => {
      setRatings(doc.data());
    });
  }, [ratings])

  const ratingChanged =(newRating) => {
    ratingsRef.doc(songID).set({
      ratings: {"uid": user.uid, "rating": newRating},
    })
    console.log(newRating);
  };


  if (ratings) {
    return (
      <>
        <ReactStars
          count={5}
          onChange={ratingChanged}
          size={24}
          activeColor="#ffd700"
        />
      </>
    )
  } else {
    return (
      <>
        <ReactStars
          count={5}
          onChange={ratingChanged}
          size={24}
          activeColor="#ffd700"
        />
      </>
    )
  }
}


export default AudioPlayerRatings;