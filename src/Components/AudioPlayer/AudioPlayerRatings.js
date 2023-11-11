import React, {useRef, useState, useEffect} from 'react';
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import {firestore} from '../../firebase';
import ReactStars from "react-rating-stars-component";

function AudioPlayerRatings({songID, user}) {
  const [ratings, setRatings] = useState(0);


  useEffect(() => {
    onSnapshot(doc(firestore, "/ratings/", songID), (doc) => {
      var arr = Object.values(doc.data());
      var sum = (prev, cur) => ({rating: prev.rating + cur.rating});
      var avg = arr.reduce(sum).rating / arr.length;
      setRatings(avg);
    });
  }, [songID])

  console.log("rating",ratings)

  if (ratings) {
    return (
      <>
        <ReactStars
          count={5}
          size={24}
          activeColor="#ffd700"
          edit={false}
        />
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