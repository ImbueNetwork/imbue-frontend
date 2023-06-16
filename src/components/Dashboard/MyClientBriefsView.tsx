import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Freelancer, Project } from '@/model';
import { getBriefApplications } from '@/redux/services/briefService';

import { ApplicationContainer } from '../Briefs/ApplicationContainer';
import { BriefLists } from '../Briefs/BriefsList';

type ClientViewProps = {
  briefId: string | string[] | undefined;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  redirectToBriefApplications: (_applicationId: string) => void;
  briefs: any;
};

const MyClientBriefsView = (props: ClientViewProps) => {
  const {
    briefs,
    briefId,
    handleMessageBoxClick,
    redirectToBriefApplications,
  } = props;

  const [briefApplications, setBriefApplications] = useState<Project[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const getApplications = async (id: string | number) => {
      try {
        setLoadingApplications(true);
        setBriefApplications(await getBriefApplications(id));
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingApplications(false);
      }
    };
    briefId && getApplications(briefId.toString());
  }, [briefId]);

  const goBack = () => {
    router.query.briefId = [];
    router.replace(router, undefined, { shallow: true });
  };

  return (
    <div>
      {briefId ? (
        <div className='bg-theme-grey-dark border border-solid border-light-white relative rounded-[0.75rem] '>
          <div
            className='absolute top-2 left-2 cursor-pointer'
            onClick={goBack}
          >
            <ArrowBackIcon />
          </div>
          {loadingApplications ? (
            <ApplicationSkeleton />
          ) : (
            <>
              {briefApplications?.map((application: any, index: any) => {
                return (
                  <ApplicationContainer
                    application={application}
                    handleMessageBoxClick={handleMessageBoxClick}
                    redirectToApplication={redirectToBriefApplications}
                    key={index}
                  />
                );
              })}
            </>
          )}
        </div>
      ) : (
        <div>
          <h2 className='text-base lg:text-xl font-bold mb-3'>Open Briefs</h2>
          <BriefLists
            briefs={briefs?.briefsUnderReview}
            showNewBriefButton={true}
          />

          <h2 className='text-base lg:text-xl font-bold mb-3 mt-4 lg:mt-10'>
            Projects
          </h2>
          <BriefLists
            briefs={briefs?.acceptedBriefs}
            areAcceptedBriefs={true}
          />
        </div>
      )}
    </div>
  );
};

export function ApplicationSkeleton() {
  return (
    <div className='bg-theme-grey-dark border border-light-white overflow-hidden rounded-xl'>
      {[1, 2].map((v, i) => (
        <div
          key={i}
          className='w-full px-5 py-3 lg:px-10 lg:py-8 border-b last:border-b-0 border-b-light-white'
        >
          <div className='flex justify-between items-center'>
            <div className='flex w-full items-center gap-4'>
              <Skeleton
                className='w-16 h-16'
                variant='circular'
                sx={{ fontSize: '1rem' }}
              />
              <Skeleton
                className='w-1/6 h-7'
                variant='text'
                sx={{ fontSize: '1rem' }}
              />
            </div>
            <Skeleton
              className='w-1/6 h-7'
              variant='text'
              sx={{ fontSize: '1rem' }}
            />
          </div>
          <div className='flex justify-between'>
            <Skeleton
              className='w-5/6'
              variant='text'
              sx={{ fontSize: '1rem' }}
            />
            <Skeleton
              className='w-1/12'
              variant='text'
              sx={{ fontSize: '1rem' }}
            />
          </div>
          <Skeleton
            className='w-3/5'
            variant='text'
            sx={{ fontSize: '1rem' }}
          />
          <Skeleton
            className='w-1/12'
            variant='text'
            sx={{ fontSize: '1rem' }}
          />
        </div>
      ))}
    </div>
  );
}

export default MyClientBriefsView;
