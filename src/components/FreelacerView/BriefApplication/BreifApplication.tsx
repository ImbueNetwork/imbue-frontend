import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Divider } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import router from 'next/router';
import { useState } from 'react';

import { displayState, OffchainProjectState, Project } from '@/model';

interface BreifApplicationProps {
  applications: any;
}

const timeAgo = new TimeAgo('en-US');

const BreifApplication: React.FC<BreifApplicationProps> = ({
  applications,
}) => {
  const [loadValue, setValue] = useState(10);
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
          index < Math.min(applications.length, loadValue) && (
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
                <div className='my-7'>
                  <p className='text-sm line-clamp-2 md:line-clamp-3 lg:line-clamp-4'>
                    {item.description}
                  </p>
                </div>
                <div className='flex pb-9 justify-between'>
                  <div className='flex space-x-5'>
                    <p className='text-sm flex cursor-pointer items-center text-imbue-purple-dark'>
                      <ThumbUpOffAltIcon fontSize='small' />
                      <span className='ml-1'>Yes</span>
                    </p>
                    <p className='text-sm flex cursor-pointer items-center text-imbue-purple-dark'>
                      <ThumbDownOffAltIcon fontSize='small' />
                      <span className='ml-1'>No</span>
                    </p>
                  </div>
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
      {loadValue < applications.length && (
        <div className='flex justify-center my-7 items-center '>
          <div className='w-full flex justify-center py-6'>
            <button
              onClick={() => {
                setValue((value) => value + 10);
              }}
              className='primary-btn in-dark w-button lg:w-1/3'
              style={{ textAlign: 'center' }}
            >
              load more
            </button>
          </div>
        </div>
      )}
      {loadValue > applications.length && (
        <div className='flex justify-center my-7 items-center '>
          <div className='w-full flex justify-center py-6'>
            <button
              onClick={() => {
                setValue(10);
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
  );
};

export default BreifApplication;
