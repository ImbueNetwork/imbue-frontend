/* eslint-disable react-hooks/exhaustive-deps */
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import BioInsights from '@/components/Briefs/BioInsights';
import BioPanel from '@/components/Briefs/BioPanel';
import ClientsHistory from '@/components/Briefs/ClientHistory';
import SimilarProjects from '@/components/Briefs/SimilarBriefs';
import ErrorScreen from '@/components/ErrorScreen';
import { LoginPopupContext, LoginPopupContextType } from '@/components/Layout';
import SuccessScreen from '@/components/SuccessScreen';

import { Brief, Freelancer, User } from '@/model';
import {
  getBrief,
  getUserBriefs,
} from '@/redux/services/briefService';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

import { fetchUser } from '../../utils';

TimeAgo.addLocale(en);

export type BriefProps = {
  brief: Brief;
};

const BriefDetails = (): JSX.Element => {
  const router = useRouter();
  const [success, setSuccess] = useState<boolean>(false);
  const [successTitle, setSuccessTitle] = useState<string>('');
  const [brief, setBrief] = useState<Brief>({
    id: '',
    headline: '',
    industries: [],
    description: '',
    skills: [],
    scope_id: 0,
    scope_level: '',
    duration: '',
    duration_id: 0,
    budget: 0,
    created: new Date(),
    created_by: '',
    experience_level: '',
    experience_id: 0,
    number_of_briefs_submitted: 0,
    user_id: 0,
    verified_only: false,
    owner_name: '',
    owner_photo: '',
  });

  // const [browsingUser, setBrowsingUser] = useState<User | null>(null);
  const { user: browsingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [freelancer, setFreelancer] = useState<Freelancer>();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [allClientBriefs, setAllClientBriefs] = useState<any>();

  // const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
  const { setShowLoginPopup } = useContext(
    LoginPopupContext
  ) as LoginPopupContextType;
  const isOwnerOfBrief = browsingUser && browsingUser.id == brief.user_id;
  const [error, setError] = useState<any>();

  const projectCategories = brief?.industries?.map?.((item) => item?.name);

  const { query } = router;

  const id: number = Number(query?.id) || 0;

  const fetchData = async () => {
    if (!id) return

    try {
      const briefData: Brief | Error | undefined = await getBrief(id);
      if (briefData?.id) {
        const targetUserRes = await fetchUser(briefData.user_id);
        setTargetUser(targetUserRes);
        setBrief(briefData);
        const freelancer = await getFreelancerProfile(
          browsingUser?.username
        );

        const allClientBriefsRes = await getUserBriefs(briefData.user_id);
        setAllClientBriefs(allClientBriefsRes)

        setFreelancer(freelancer);
      } else {
        setError({ message: 'No Brief Found' });
        router.push('/error');
      }
    } catch (error) {
      setError({ message: error });
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const redirectToApply = () => {
    if (browsingUser?.id) router.push(`/briefs/${brief.id}/apply`);
    else
      setShowLoginPopup({
        open: true,
        redirectURL: `/briefs/${brief.id}/apply`,
      });
  };

  const handleMessageBoxClick = async () => {
    if (browsingUser.id) {
      setShowMessageBox(true);
    } else {
      // redirect("login", `/dapp/briefs/${brief.id}/`);
      setShowLoginPopup({ open: true, redirectURL: `/briefs/${brief.id}` });
    }
  };

  return (
    <div className='brief-details-container px-[15px] lg:px-0'>
      <div className='brief-info max-width-750px:!flex-col'>
        {/* TODO: Implement */}
        <BioPanel
          browsingUser={browsingUser}
          brief={brief}
          targetUser={targetUser}
          isOwnerOfBrief={isOwnerOfBrief}
          projectCategories={projectCategories}
          showLoginPopUp={setShowLoginPopup}
          loadingMain={loading}
        />
        <BioInsights
          redirectToApply={redirectToApply}
          brief={brief}
          setSuccess={setSuccess}
          setSuccessTitle={setSuccessTitle}
          setError={setError}
          isOwnerOfBrief={isOwnerOfBrief}
          handleMessageBoxClick={handleMessageBoxClick}
          showMessageBox={showMessageBox}
          setShowMessageBox={setShowMessageBox}
          targetUser={targetUser}
          browsingUser={browsingUser}
          canSubmitProposal={brief.verified_only ? freelancer?.verified : true}
          allClientBriefs={allClientBriefs}
          loadingMain={loading}
        />
      </div>
      <ClientsHistory briefId={id} client={targetUser} allClientBriefs={allClientBriefs} />
      <SimilarProjects exclude_id={id} />
      <ErrorScreen {...{ error, setError }}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => router.push('/briefs')}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Seach Brief
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </ErrorScreen>

      <SuccessScreen title={successTitle} open={success} setOpen={setSuccess}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => {
              setSuccess(false);
            }}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Done
          </button>
        </div>
      </SuccessScreen>

      {/* <LoginPopup
        visible={showLoginPopup}
        setVisible={setShowLoginPopup}
        redirectUrl={`/briefs/${id}`}
      /> */}
    </div>
  );
};

// export { getServerSideProps };

export default BriefDetails;
