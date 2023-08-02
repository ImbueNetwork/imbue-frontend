/* eslint-disable no-console */
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Freelancer, Project } from '@/model';
import { getBriefApplications, getUserBriefs } from '@/redux/services/briefService';
import { getUsersOngoingGrants } from '@/redux/services/projectServices';

import OngoingProject from './FreelacerView/OngoingProject/OngoinProject';
import { ApplicationContainer } from '../Briefs/ApplicationContainer';
import ApplicationSkeleton from '../Briefs/ApplicationSkeleton';
import { BriefLists } from '../Briefs/BriefsList';

type ClientViewProps = {
  briefId: string | string[] | undefined;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  redirectToBriefApplications: (_applicationId: string) => void;
  user: any;
};

const MyClientBriefsView = (props: ClientViewProps) => {
  const {
    user,
    briefId,
    handleMessageBoxClick,
    redirectToBriefApplications,
  } = props;

  const [briefs, _setBriefs] = useState<any>();
  const [briefApplications, setBriefApplications] = useState<Project[]>([]);
  const [ongoingGrants, setOngoingGrants] = useState<Project[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const setUserBriefs = async () => {
      if (user?.id) _setBriefs(await getUserBriefs(user?.id));
      setOngoingGrants(await getUsersOngoingGrants(user?.web3_address));
    }
    setUserBriefs();
  }, [user?.id, user?.web3_address])

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
  }, [briefId, user?.id]);

  const goBack = () => {
    router.query.briefId = [];
    router.replace(router, undefined, { shallow: true });
  };

  return (
    <div>
      {briefId ? (
        <div className='bg-white relative rounded-[0.75rem] '>
          <div
            className='absolute top-2 left-2 cursor-pointer'
            onClick={goBack}
          >
            <ArrowBackIcon htmlColor='#3B27C1' />
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
          <h2 className='text-imbue-purple-dark text-base lg:text-xl mb-3'>Open Briefs</h2>
          <BriefLists
            briefs={briefs?.briefsUnderReview}
            showNewBriefButton={true}
          />

          {
            briefs?.acceptedBriefs?.length && (
              <>
                <p className='text-imbue-purple-dark text-base lg:text-xl mb-3 mt-4 lg:mt-10'>
                  Projects
                </p>
                <BriefLists
                  briefs={briefs?.acceptedBriefs}
                  areAcceptedBriefs={true}
                />
              </>
            )
          }

          {
            ongoingGrants?.length && (
              <>
                <p className='text-imbue-purple-dark text-base lg:text-xl mb-3 mt-4 lg:mt-10'>
                  Ongoing Grants
                </p>
                <div className='bg-background rounded-xl overflow-hidden'>
                  <OngoingProject
                    projects={ongoingGrants}
                  />
                </div>
              </>
            )
          }

        </div>
      )}
    </div>
  );
};

export default MyClientBriefsView;
