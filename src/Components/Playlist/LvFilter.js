import React from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const LvFilter = ({changeRangeFilter}) => {

  return (
    <>
      <div className='d-flex justify-content-between align-self-center'>
        <b className='filter_chill'>Chill</b>
        <b className='filter_chill filter_hype'>Hype</b>
      </div>
      <RangeSlider min={2} max={4} step={1} defaultValue={[1,5]} onInput={(e) => changeRangeFilter(e)} />
    </>
  );
};

export default LvFilter;