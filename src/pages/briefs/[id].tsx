/* eslint-disable react-hooks/exhaustive-deps */
import ArrowIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import BioInsights from '@/components/Briefs/BioInsights';
import BioPanel from '@/components/Briefs/BioPanel';
import ClientsHistory from '@/components/Briefs/ClientHistory';
import ErrorScreen from '@/components/ErrorScreen';
import { LoginPopupContext, LoginPopupContextType } from '@/components/Layout';
import SuccessScreen from '@/components/SuccessScreen';

import { Brief, Freelancer, User } from '@/model';
import {
  checkIfBriefSaved,
  deleteSavedBrief,
  getAllBriefs,
  getBrief,
  getUserBriefs,
  saveBriefData,
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
  const [isSavedBrief, setIsSavedBrief] = useState<boolean>(false);
  const [freelancer, setFreelancer] = useState<Freelancer>();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [similarBriefs, setSimilarBriefs] = useState<Brief[]>([]);
  const [allClientBriefs, setAllClientBriefs] = useState<any>();

  // const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
  const { setShowLoginPopup } = useContext(
    LoginPopupContext
  ) as LoginPopupContextType;
  const isOwnerOfBrief = browsingUser && browsingUser.id == brief.user_id;
  const [error, setError] = useState<any>();

  const projectCategories = brief?.industries?.map?.((item) => item?.name);

  const { query } = router;

  const id: any = query?.id || 0;

  const fetchData = async () => {
    if (id) {
      try {
        const briefData: Brief | Error | undefined = await getBrief(id);
        if (briefData?.id) {
          const targetUserRes = await fetchUser(briefData.user_id);
          setTargetUser(targetUserRes);
          setBrief(briefData);
          const _freelancer = await getFreelancerProfile(
            browsingUser?.username
          );
          const briefIsSaved = await checkIfBriefSaved(
            briefData?.id,
            browsingUser?.id
          );

          const allClientBriefsRes = await getUserBriefs(briefData.user_id);
          setAllClientBriefs(allClientBriefsRes)

          const briefs_all: any = await getAllBriefs(4, 1);
          setSimilarBriefs(briefs_all?.currentData);

          setIsSavedBrief(briefIsSaved.isSaved);
          setFreelancer(_freelancer);
        } else {
          setError({ message: 'No Brief Found' });
          router.push('/error');
        }
      } catch (error) {
        setError({ message: error });
      }
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

  const saveBrief = async () => {
    if (!browsingUser?.id)
      return setShowLoginPopup({
        open: true,
        redirectURL: `/briefs/${brief.id}`,
      });

    const resp = await saveBriefData({
      ...brief,
      currentUserId: browsingUser?.id,
    });
    if (resp?.brief_id) {
      setSuccessTitle('Brief Saved Successfully');
      setIsSavedBrief(true);
      setSuccess(true);
    } else {
      setError({ message: 'Brief already Saved' });
    }
  };

  const unsaveBrief = async () => {
    await deleteSavedBrief(id, browsingUser?.id);
    setIsSavedBrief(false);
    setSuccess(true);
    setSuccessTitle('Brief Unsaved Successfully');
  };


  type SimilarBriefsType = {
    similarBriefs: Brief[];
}


  const SimilarProjects = ({ similarBriefs }: SimilarBriefsType) => {
    const [showSimilarBrief, setShowSimilarBrief] = useState<boolean>(false);

    return (
      <div
        className={`transparent-conatainer !bg-imbue-light-purple-three relative ${showSimilarBrief ? '!pb-[3rem]' : ''
          } `}
      >
        <div className='flex justify-between w-full lg:px-[4rem] px-[1rem]'>
          <h3 className='text-imbue-purple-dark'>Similar projects on Imbue</h3>
          <div
            className={`transition transform ease-in-out duration-600 ${showSimilarBrief && 'rotate-180'
              } cursor-pointer`}
          >
            <ArrowIcon
              onClick={() => setShowSimilarBrief(!showSimilarBrief)}
              className='scale-150'
              sx={{
                color: '#03116A',
              }}
            />
          </div>
        </div>

        <div className={`${!showSimilarBrief && 'hidden'} my-6`}>
          <hr className='h-[1.5px] bg-[rgba(3, 17, 106, 0.12)] w-full mb-[0.5rem]' />
          {/* TODO: Need an object for the list of similar projects */}
          {/* FIXME: replace dummy array with similar projects data*/}
          {similarBriefs.map((brief, index) => (
            <div
              key={`${index}-sim-brief`}
              className='similar-brief lg:px-[4rem] px-[1rem]'
            >
              <div className='similar-brief-details !items-start !flex-col gap-4'>
                <h3 className='text-base whitespace-nowrap w-fit text-imbue-purple-dark'>
                  {brief?.headline}
                </h3>
                <span className='max-width-750px:!text-base max-width-750px:overflow-hidden max-width-750px:text-ellipsis max-width-750px:ml-3 max-width-750px:line-clamp-2 !text-imbue-purple'>
                  {brief?.description?.length > 300
                    ? brief?.description.substring(0, 300) + '...'
                    : brief?.description}
                </span>
              </div>
              <button
                onClick={() => router.push(`/briefs/${brief?.id}`)}
                className='primary-btn in-dark w-button max-width-750px:!px-[9px] max-width-750px:mr-0'
              >
                View Brief
              </button>
            </div>
          ))}
        </div>
        {showSimilarBrief && (
          <span
            onClick={() => router.push(`/briefs`)}
            className='primary-text font-bold absolute bottom-7 lg:right-[4.5rem] right-6 cursor-pointer !text-imbue-coral hover:underline'
          >
            View all
          </span>
        )}
      </div>
    );
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
        />
        <BioInsights
          redirectToApply={redirectToApply}
          brief={brief}
          saveBrief={saveBrief}
          unsaveBrief={unsaveBrief}
          isSavedBrief={isSavedBrief}
          isOwnerOfBrief={isOwnerOfBrief}
          handleMessageBoxClick={handleMessageBoxClick}
          showMessageBox={showMessageBox}
          setShowMessageBox={setShowMessageBox}
          targetUser={targetUser}
          browsingUser={browsingUser}
          canSubmitProposal={brief.verified_only ? freelancer?.verified : true}
          allClientBriefs = {allClientBriefs}
        />
      </div>
      <ClientsHistory briefId={id} client={targetUser} allClientBriefs={allClientBriefs} />
      <SimilarProjects similarBriefs={similarBriefs} />
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
