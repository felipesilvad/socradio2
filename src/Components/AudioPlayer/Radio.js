import React, {useRef, useEffect} from 'react';

  function Radio({audio}){
    // assuming the "data" variable from the api exists and re-renders the component
  // const {startTime, length} = data
  // const startDate = new Date(startTime)
  // const seconds = Math.abs(startDate.getTime() - Date.now().getTime()) / 1000;

  const audioRef = useRef(audio)

  // effect runs after audio element gets mounted
  useEffect(()=>{
    if(!audioRef.current) return

    audioRef.current.addEventListener("ended", (event) => {
      // refetch current song logic
    });
  }, [audioRef.current])

  return (
    <audio ref={audioRef} />
  )
}

export default Radio;