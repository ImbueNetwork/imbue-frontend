/* eslint-disable no-console */
//import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Freelancer, Project } from '@/model';
import {
  getBriefApplications,
  getUserBriefs,
} from '@/redux/services/briefService';
import { getUsersOngoingGrants } from '@/redux/services/projectServices';

// import OngoingProject from './FreelacerView/OngoingProject/OngoingProject';
// import { ApplicationContainer } from '../Briefs/ApplicationContainer';
// import ApplicationSkeleton from '../Briefs/ApplicationSkeleton';
// import { BriefLists } from '../Briefs/BriefsList';
import ClientView from '../ClientView/ClientView';

type ClientViewProps = {
  briefId: string | string[] | undefined;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  redirectToBriefApplications: (_applicationId: string) => void;
  user: any;
};

const MyClientBriefsView = (props: ClientViewProps) => {
  const { user, briefId, handleMessageBoxClick, redirectToBriefApplications } =
    props;

  const [briefs, _setBriefs] = useState<any>();
  const [briefApplications, setBriefApplications] = useState<Project[]>([]);
  const [ongoingGrants, setOngoingGrants] = useState<Project[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const setUserBriefs = async () => {
      if (user?.id) _setBriefs(await getUserBriefs(user?.id));
      setOngoingGrants(await getUsersOngoingGrants(user?.web3_address));
    };
    setUserBriefs();
  }, [user?.id, user?.web3_address]);

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
      <ClientView
        GoBack={goBack}
        briefId={briefId}
        briefs={briefs}
        handleMessageBoxClick={handleMessageBoxClick}
        redirectToBriefApplications={redirectToBriefApplications}
        briefApplications={briefApplications}
        ongoingGrants={ongoingGrants}
        loadingApplications={loadingApplications}
      />
    </div>
  );
};

export default MyClientBriefsView;
