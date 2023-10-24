import { Divider } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import router from 'next/router';
import { useState } from 'react';

import { displayState, OffchainProjectState, Project } from '@/model';

interface BreifApplicationProps {
  applications: any;
}
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

const BreifApplication: React.FC<BreifApplicationProps> = ({
  applications,
}) => {
  //// limit of loading application
  const loadBrefApplicationValue = 10;
  const [loadValue, setValue] = useState(loadBrefApplicationValue);
  const redirectToApplication = (application: Project) => {
    router.push(
      `/briefs/${application.brief_id}/applications/${application.id}/`
    );
  };

  const redirectToDiscoverBriefs = () => {
    router.push(`/briefs`);
  };

  if (applications?.length === 0)
    return (
      <div className='w-full flex justify-center py-6'>
        <button
          onClick={() => {
            redirectToDiscoverBriefs();
          }}
          className='primary-btn in-dark w-button lg:w-1/3'
          style={{ textAlign: 'center' }}
        >
          Discover Briefs
        </button>
      </div>
    );

  return (
    <div>
      {applications?.map(
        (item: any, index: number) =>
          index <
            Math.min(
              applications.length,
              Math.max(loadValue, loadBrefApplicationValue)
            ) && (
            <>
              <div
                key={item.id}
                onClick={() => redirectToApplication(item)}
                className=' hover:bg-imbue-light-purple cursor-pointer px-9 text-imbue-purple'
              >
                <div className='flex pt-7 items-center justify-between'>
                  <p className='text-imbue-purple-dark text-sm sm:text-lg'>
                    {item.name}
                  </p>
                  <p className='text-xs sm:text-sm'>
                    {timeAgo?.format(new Date(item?.created || 0))}
                  </p>
                </div>
                <div className='my-7 break-all'>
                  <p className='text-sm line-clamp-2 md:line-clamp-3 lg:line-clamp-4'>
                    {item.description}
                  </p>
                </div>
                <div className='flex pb-9 flex-row-reverse justify-between'>
                  <div
                    className={`px-4 py-1 lg:py-2 w-fit rounded-full text-xs lg:text-base text-center ${
                      OffchainProjectState[item?.status_id || 0]
                    }-button `}
                  >
                    {displayState(item?.status_id || 0)}
                  </div>
                </div>
              </div>
              {index !== applications.length - 1 && <Divider />}
            </>
          )
      )}
      <div className='flex'>
        {loadValue < applications.length && (
          <div className='flex w-full justify-center my-7 items-center '>
            <div className='w-full flex justify-center py-6'>
              <button
                onClick={() => {
                  setValue((value) => value + loadBrefApplicationValue);
                }}
                className='primary-btn in-dark w-button lg:w-1/3'
                style={{ textAlign: 'center' }}
              >
                load more
              </button>
            </div>
          </div>
        )}
        {loadValue > loadBrefApplicationValue &&
          applications.length > loadBrefApplicationValue && (
            <div className='flex w-full justify-center my-7 items-center '>
              <div className='w-full flex justify-center py-6'>
                <button
                  onClick={() => {
                    setValue((value) => value - loadBrefApplicationValue);
                  }}
                  className='primary-btn in-dark w-button lg:w-1/3'
                  style={{ textAlign: 'center' }}
                >
                  show less
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default BreifApplication;
