import React from "react";

const VolumeRange = ({volume, changeVolume}) => {

  const style = { "--my-css-var": 10 };

  return (
    <input
      type="range"
      className="volume-input"
      value={volume*100}
      // step={step}
      onChange={(e) => changeVolume(e.target.value)}
    />
  );
};

export default VolumeRange;