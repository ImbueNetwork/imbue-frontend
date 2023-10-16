import React from 'react';

import { Milestone } from '@/model';

export type ProgressBarProps = {
  titleArray: Array<Milestone>;
  currentValue: number | undefined;
  isPrimary?: boolean;
};

export const MilestoneProgressBar = ({
  titleArray,
  currentValue = 0,
}: ProgressBarProps): JSX.Element => {
  return (
    <div className='relative'>
      <div className='progressbar-container'>
        {titleArray?.map((milestone, index) => (
          <div key={index}>
            {/* {milestone?.milestone_index === currentValue && (
            <div
              className={`mx-[6px] mt-1.5 absolute  progress-step-circle-primary--milestone ${currentValue >= index ? 'active' : 'disabled'
                }`}
            ></div>
          )} */}
            <div className='bg-imbue-coral -mt-6 rounded-md relative  w-4 h-5  flex justify-center items-center text-white'>
              <span className='relative text-xs z-[9]'>{milestone?.milestone_index + 1}</span>
              <div className='w-2 h-2 -rotate-45 bg-imbue-coral absolute -bottom-0.5  '></div>
            </div>
          </div>
        ))}
        {/* <div className='progress-bar-back--milestone'></div> */}
        {/* <div
        className='progress-bar-progress--milestone'
        style={{
          width: `calc((100%) * ${2} / ${titleArray?.length > 1 ? titleArray?.length - 1 : 1
            })`,
        }}
      ></div> */}

      </div>
      <div>
        {
          currentValue >= 0
            ? (
              <div
                className='progress-bar-progress--milestone max-w-full relative'
                style={{
                  width: `calc(${currentValue ? "6px" : "14px"} + (100%) * ${currentValue} / ${titleArray?.length > 1 ? titleArray?.length - 1 : 1
                    })`,
                }}
              >
                {/* the red circle */}
                <div
                  className={`ml-[3px] absolute right-[3px] progress-step-circle-primary--milestone active`}
                ></div>
              </div>)
            : ""
        }
        <div className='progress-bar-back--milestone'></div>
      </div>
    </div>
  );
};
