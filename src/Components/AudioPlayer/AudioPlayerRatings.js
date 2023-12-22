import React, {useRef, useState, useEffect} from 'react';
import { doc, collection, onSnapshot } from "firebase/firestore";
import {firestore} from '../../firebase';
import ReactStars from "react-rating-stars-component";

function AudioPlayerRatings({songID, updateRating}) {
  const [ratings, setRatings] = useState();

  useEffect(() => {
    onSnapshot(collection(firestore, "/ratings/", songID, "/ratings/"), (snapshot) => {
      if (snapshot.docs) {
        setRatings(snapshot.docs.map(doc => ({...doc.data()})))
      }
    });
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