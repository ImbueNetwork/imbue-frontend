import React from 'react';

export type ProgressBarProps = {
  titleArray: Array<string>;
  currentValue: number;
  isPrimary?: boolean;
};

export const MilestoneProgressBar = ({
  titleArray,
  currentValue,
}: ProgressBarProps): JSX.Element => {
  return (
    <div className='progressbar-container'>
      {titleArray?.map((title, index) => (
        <div key={index} style={{ zIndex: 1 }}>
          {index === currentValue && (
            <div
              className={` mt-1.5 absolute  progress-step-circle-primary--milestone ${
                currentValue >= index ? 'active' : 'disabled'
              }`}
            ></div>
          )}
          <div className='bg-imbue-coral -mt-6 rounded-md relative  w-4 h-5  flex justify-center items-center text-white'>
            <span className='relative text-xs z-10'>{title}</span>
            <div className='w-2 h-2 -rotate-45 bg-imbue-coral absolute -bottom-0.5  '></div>
          </div>
        </div>
      ))}
      <div className='progress-bar-back--milestone'></div>
      <div
        className='progress-bar-progress--milestone'
        style={{
          width: `calc((100% - .5rem) * ${currentValue} / ${
            titleArray.length - 1
          })`,
        }}
      ></div>
    </div>
  );
};
