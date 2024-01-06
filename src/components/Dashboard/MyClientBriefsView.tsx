/* eslint-disable no-console */
//import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Freelancer, Project } from '@/model';
import {
  getUserBriefs,
} from '@/redux/services/briefService';
import { getUsersOngoingGrants } from '@/redux/services/projectServices';
import { RootState } from '@/redux/store/store';

// import OngoingProject from './FreelacerView/OngoingProject/OngoingProject';
// import { ApplicationContainer } from '../Briefs/ApplicationContainer';
// import ApplicationSkeleton from '../Briefs/ApplicationSkeleton';
// import { BriefLists } from '../Briefs/BriefsList';
import ClientView from '../ClientView/ClientView';

type ClientViewProps = {
  briefId: string | string[] | undefined;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  redirectToBriefApplications?: (_applicationId: string) => void;
};

const MyClientBriefsView = (props: ClientViewProps) => {
  const { briefId, handleMessageBoxClick } = props;

  const { user, loading } = useSelector((state: RootState) => state.userState);
  const router = useRouter();

  const [briefs, _setBriefs] = useState<any>();
  const [ongoingGrants, setOngoingGrants] = useState<Project[]>([]);

  useEffect(() => {
    const setUserBriefs = async () => {
      if (!user.id) return router.push('/auth/sign-in')

      _setBriefs(await getUserBriefs(user?.id));

      if (user?.web3_address)
        setOngoingGrants(await getUsersOngoingGrants(user?.web3_address));
    };
    !loading && setUserBriefs();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user?.web3_address, loading]);

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
        ongoingGrants={ongoingGrants}
        // redirectToBriefApplications={redirectToBriefApplications}
        // briefApplications={briefApplications}
        // loadingApplications={loadingApplications}
      />
    </div>
  );
};

export default MyClientBriefsView;
