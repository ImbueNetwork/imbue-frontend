import React from 'react';

export type ProgressBarProps = {
  titleArray: Array<string>;
  currentValue: number;
  isPrimary?: boolean;
};

export const ProgressBar = ({
  titleArray,
  currentValue,
  isPrimary = false,
}: ProgressBarProps): JSX.Element => {
  if (isPrimary)
    return (
      <div className='progressbar-container'>
        {titleArray?.map((title, index) => (
          <div key={index} style={{ zIndex: 1 }}>
            <div
              className={`progress-step-circle-primary ${
                currentValue >= index ? 'active' : 'disabled'
              }`}
            ></div>
            <p
              className={`progress-step-text ${
                index > 0 && index < titleArray.length - 1
                  ? 'center'
                  : index === titleArray.length - 1
                  ? 'right'
                  : ''
              }`}
            >
              {title}
            </p>
          </div>
        ))}
        <div className='progress-bar-back'></div>
        <div
          className='progress-bar-progress--primary'
          style={{
            width: `calc((100% - .5rem) * ${currentValue} / ${
              titleArray.length - 1
            })`,
          }}
        ></div>
      </div>
    );

  return (
    <div className='progressbar-container'>
      {titleArray?.map((title, index) => (
        <div key={index} style={{ zIndex: 1 }}>
          <div
            className={`progress-step-circle ${
              currentValue >= index ? 'active' : 'disabled'
            }`}
          ></div>
          <p
            className={`progress-step-text ${
              index > 0 && index < titleArray.length - 1
                ? 'center'
                : index === titleArray.length - 1
                ? 'right'
                : ''
            }`}
          >
            {title}
          </p>
        </div>
      ))}
      <div className='progress-bar-back'></div>
      <div
        className='progress-bar-progress absolute'
        style={{
          width: `calc((100% - .5rem) * ${currentValue} / ${
            titleArray.length - 1
          })`,
        }}
      ></div>
    </div>
  );
};
