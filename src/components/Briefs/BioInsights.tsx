import CancelIcon from '@mui/icons-material/Cancel';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Alert, Skeleton, Tooltip } from '@mui/material';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { FaRegShareSquare } from 'react-icons/fa';

import { checkEnvironment } from '@/utils';

import ChatPopup from '@/components/ChatPopup';

import { copyIcon } from '@/assets/svgs';
import { Brief, Project, User } from '@/model';
import {
  checkIfBriefSaved,
  deleteSavedBrief,
  getBriefApplications,
  saveBriefData,
} from '@/redux/services/briefService';

import { LoginPopupContext, LoginPopupContextType } from '../Layout';
import CountrySelector from '../Profile/CountrySelector';

type BioInsightsProps = {
  redirectToApply: () => void;
  brief: Brief;
  isOwnerOfBrief: boolean | null;
  handleMessageBoxClick: () => void;
  showMessageBox: boolean;
  setShowMessageBox: (_: boolean) => void;
  targetUser: User | null;
  browsingUser: User | null;
  canSubmitProposal: boolean | undefined;
  allClientBriefs: any;
  setSuccess: (_value: boolean) => void;
  setSuccessTitle: (_value: string) => void;
  setError: (_value: any) => void;
  loadingMain: boolean;
};

const BioInsights = ({
  redirectToApply,
  brief,
  browsingUser,
  isOwnerOfBrief,
  handleMessageBoxClick,
  showMessageBox,
  setShowMessageBox,
  targetUser,
  canSubmitProposal,
  allClientBriefs = [],
  setSuccess,
  setError,
  setSuccessTitle,
  loadingMain
}: BioInsightsProps) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSavedBrief, setIsSavedBrief] = useState<boolean>(false);
  // const [clientBriefs, setClientBrief] = useState<Brief[]>([]);
  const [briefApplications, setBriefApplications] = useState<Project[]>([]);
  const lastApplication: Project =
    briefApplications[briefApplications?.length - 1];

  const pendingApplciations: Project[] =
    !briefApplications?.length
      ? []
      : briefApplications?.filter(
        (application) => application?.status_id === 1
      );

  let hint = '';
  if (!canSubmitProposal)
    hint = 'Only verified freelancers can apply to briefs';
  else if (isOwnerOfBrief)
    hint = 'You are not allowed to submit proposal to your own brief';

  const { setShowLoginPopup } = useContext(
    LoginPopupContext
  ) as LoginPopupContextType;

  const acceptedBriefs = allClientBriefs?.acceptedBriefs || []
  const briefsUnderReview = allClientBriefs?.briefsUnderReview || []
  const clientBriefs = [...acceptedBriefs, ...briefsUnderReview]

  const briefWithApplications = allClientBriefs?.briefsUnderReview?.length ? allClientBriefs.briefsUnderReview.filter((brief: Brief) => brief.number_of_applications) : 0
  const hiredCount = allClientBriefs?.acceptedBriefs?.length || 0

  const hireRate = Math.round((hiredCount / (briefWithApplications.length + hiredCount)) * 100)

  useEffect(() => {
    const fetchSavedBriefs = async () => {
      if (!brief?.id) return

      try {
        if (browsingUser?.id) {
          const briefIsSaved = await checkIfBriefSaved(
            brief?.id,
            browsingUser?.id
          );
          setIsSavedBrief(briefIsSaved.isSaved);
        }
        setBriefApplications(await getBriefApplications(brief?.id));
      } catch (error) {
        setError({ message: "Failed to get application data. Please try again. " + error })
      } finally {
        setLoading(false)
      }
    }

    fetchSavedBriefs()
  }, [brief?.id, browsingUser?.id, setError])

  // useEffect(() => {
  //   const setUp = async () => {
  //     if (!allClientBriefs.length) return;

  //     const allBriefs = [...allClientBriefs.acceptedBriefs, ...allClientBriefs.briefsUnderReview];
  //     setClientBrief(allBriefs);
  //   };

  //   setUp();
  // }, [allClientBriefs]);

  const copyToClipboard = () => {
    const textToCopy = checkEnvironment().concat(`${router.asPath}`);

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
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
    if (!browsingUser?.id) return setError({ message: "No user information found." });

    await deleteSavedBrief(brief.id, browsingUser?.id);
    setIsSavedBrief(false);
    setSuccess(true);
    setSuccessTitle('Brief Unsaved Successfully');
  };

  if (loading || loadingMain) return (
    <div className='brief-insights py-6 px-6 lg:py-10 lg:px-10 mt-[2rem] lg:mt-0 w-full md:w-[35%] relative'>
      <Skeleton variant="text" className='text-xl w-52' />
      <div className='flex gap-2 w-full my-3'>
        <Skeleton variant="text" className='text-xl w-28 h-10 rounded-full' />
        <Skeleton variant="text" className='text-xl w-40 h-10 rounded-full' />
      </div>

      <Skeleton variant="text" className='text-base w-52 mb-3' />
      <Skeleton variant="text" className='text-base w-52 mb-3' />
      <Skeleton variant="text" className='text-base w-52 mb-3' />

      <Skeleton variant="text" className='text-base w-52 mt-6' />
      <Skeleton variant="rounded" className='mt-4 w-full' height={180} />

      <Skeleton variant="text" className='text-base w-52 mt-5' />
      <Skeleton variant="text" className='text-base w-52 mt-2' />
      <Skeleton variant="rounded" className='mt-4 w-full' height={30} />
    </div>
  )

  return (
    <div
      className='brief-insights py-6 px-6 lg:py-10 lg:px-10 mt-[2rem] lg:mt-0 w-full md:w-[35%] relative'
    >
      <div>
        <h3 className='text-imbue-purple-dark !font-normal'>
          Activities on this job
        </h3>

        {!brief?.project_id && (
          <div className='flex gap-3 lg:items-center mt-4 flex-wrap'>
            <button
              onClick={() => (isSavedBrief ? unsaveBrief?.() : saveBrief?.())}
              className={` ${isSavedBrief
                ? 'bg-imbue-coral text-white border-imbue-coral'
                : 'bg-transparent text-content border border-content'
                } rounded-3xl h-[2.48rem] text-base font-normal px-5 max-width-1100px:w-full max-width-500px:w-auto `}
            >
              {isSavedBrief ? 'Unsave' : 'Save'}
            </button>

            <Tooltip
              title={hint}
              arrow
              placement='bottom'
              leaveTouchDelay={5}
              followCursor
            >
              <button
                className={`primary-btn 
              in-dark
              !text-[1rem]
              !font-normal
              flex
              items-center
              gap-2
              !m-0
              !px-4
              ${(!canSubmitProposal || isOwnerOfBrief) &&
                  '!bg-gray-300 !text-gray-400 !cursor-not-allowed'
                  }
              `}
                onClick={() =>
                  canSubmitProposal && !isOwnerOfBrief && redirectToApply()
                }
              >
                Submit a Proposal <FaRegShareSquare />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      <div className='subsection !mb-[0.75rem]'>
        {brief.verified_only && (
          <p className='text-imbue-purple flex items-center mb-4'>
            <VerifiedIcon className='mr-2' fontSize='small' htmlColor='#38e894' />
            Only verified freelancer can apply
          </p>
        )}
        <div className='brief-insights-stat'>
          <div className='flex items-center text-imbue-purple-dark '>
            Applications:
            <Tooltip
              title='An approximate number of applications for this brief'
              followCursor
              leaveTouchDelay={10}
              className='cursor-pointer'
            >
              <span className='bg-indigo-700 ml-2 h-5 w-5 py-1 px-1.5 cursor-pointer text-xs !text-white rounded-full flex justify-center items-center'>
                ?
              </span>
            </Tooltip>
            <span className='primary-text font-normal ml-2 !text-imbue-lemon'>
              {briefApplications?.length > 0 ? "Less than " : ""}
              {briefApplications?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className='subsection !mt-0 !mb-[0.75rem]'>
        <div className='brief-insights-stat'>
          <div className='flex items-center text-imbue-purple-dark'>
            Last applied by freelancers:
            <span className='primary-text font-bold ml-2 !text-imbue-lemon'>
              {lastApplication?.created
                ? moment(lastApplication?.created, 'YYYYMMDD').fromNow()
                : 'Never'}
            </span>
          </div>
        </div>
      </div>

      <div className='subsection !mt-0'>
        <div className='brief-insights-stat'>
          <div className='text-imbue-purple-dark'>
            Currently Interviewing:
            <span className='primary-text font-bold ml-2 !text-imbue-lemon'>
              {pendingApplciations?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Fixme: not implemented in figma design */}
      {/* <div className="subsection">
                <div className="brief-insights-stat">
                    <IoMdWallet className="brief-insight-icon" />
                    <h3>
                        Total Spent <span className="primary-text">$250,000</span>
                    </h3>
                </div>
            </div> */}

      <h3 className='mt-[3rem] text-imbue-purple-dark !font-normal'>
        About Client
      </h3>

      <div className=' bg-imbue-light-purple-three p-[1rem] rounded-[0.5rem] mt-3'>
        <div className='mb-5'>
          <div className='brief-insights-stat flex gap-2 justify-start items-center max-width-1800px:flex-wrap '>
            {targetUser?.web3_address ? (
              <>
                <VerifiedIcon fontSize='small' color='secondary' />
                <span className='font-normal text-imbue-purple-dark text-[1rem] mr-3'>
                  Payment method verified
                </span>
              </>
            ) : (
              <>
                <CancelIcon fontSize='small' color='error' />
                <span className='font-normal text-imbue-purple-dark text-[1rem] mr-3'>
                  Payment method not verified
                </span>
              </>
            )}

            {/* <div>
                  {[4, 4, 4, 4].map((star, index) => (
                    <StarIcon
                      key={`${index}-star-icon`}
                      className={`${index <= 4 && 'primary-icon'}`}
                    />
                  ))}
                </div> */}
          </div>
        </div>

        <div className='mb-5'>
          <div className='brief-insights-stat flex flex-col'>
            <div className='flex gap-2 items-center text-imbue-purple-dark !font-normal'>
              <MarkEmailUnreadOutlinedIcon fontSize='small' />
              <div className='text-lg'>
                <span className='mr-2 '>{clientBriefs.length}</span>
                {`Project${clientBriefs?.length > 1 ? 's' : ''} Posted`}
              </div>
            </div>
            <p className='mt-2 text-imbue-purple text-[1rem]'>
              {hireRate > 0 && <span className='mr-1'>{hireRate}% hire rate,</span>}
              {allClientBriefs?.briefsUnderReview?.length || 0} open job
            </p>
          </div>
        </div>

        {targetUser?.country && (
          <div className='subsection pb-0 !my-0'>
            <div className='brief-insights-stat flex flex-col'>
              <CountrySelector
                user={targetUser}
                setUser={() => null}
                isEditMode={false}
              />
            </div>
          </div>
        )}
        <p className='text-imbue-purple !text-sm'>
          Member since {moment(targetUser?.created).format('MMM DD, YYYY')}
        </p>
        {/* {
          targetUser?.country && (
            <div className='subsection pb-0 !my-0'>
              <div className='brief-insights-stat flex flex-col'>
                <div className='flex items-center'>
                  <Image
                    className='h-4 w-6 object-cover'
                    height={16}
                    width={24}
                    src='https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg'
                    alt='Flag'
                  />
                  <h3 className='ml-2 text-imbue-purple-dark !font-normal'>
                    United States
                  </h3>
                </div>
                <p className='mt-2 text-imbue-purple text-[1rem]'>
                  Member since Feb 19, 2023
                </p>
              </div>
            </div>
          )
        } */}
      </div>

      <div className='mt-auto'>
        <hr className='separator' />
        <div className='flex flex-col gap-4 mt-5'>
          {!isOwnerOfBrief && (
            <div className='w-full flex gap-3 items-center justify-between'>
              <span className='text-xl text-imbue-purple-dark !font-normal'>
                Meet the hiring team
              </span>
              <button
                onClick={() => handleMessageBoxClick()}
                className='primary-btn in-dark w-button'
                style={{ marginTop: 0 }}
              >
                Message
              </button>
            </div>
          )}
          <h3 className='text-imbue-purple-dark !font-normal'>Job Link</h3>
          <div className='flex items-center gap-2'>
            <div className=' min-h-[2.625rem] rounded-[6.18rem] flex py-2 items-center px-[2rem] bg-imbue-light-purple my-2 w-full'>
              <span className='text-imbue-purple text-[1rem] w-full'>
                {checkEnvironment().concat(`${router.asPath}`)}
              </span>
            </div>

            <Image
              src={copyIcon}
              alt='copyIcon'
              className='cursor-pointer'
              onClick={copyToClipboard}
            />
          </div>
        </div>
        {browsingUser && showMessageBox && (
          <ChatPopup
            showMessageBox={showMessageBox}
            setShowMessageBox={setShowMessageBox}
            targetUser={targetUser}
            browsingUser={browsingUser}
            showFreelancerProfile={false}
          />
        )}
      </div>

      <Alert
        className={`fixed top-28 z-10 transform duration-300 transition-all ${copied ? 'right-5' : '-right-full'
          }`}
        severity='success'
      >
        {`Brief link copied to clipboard`}
      </Alert>
    </div>
  );
};

export default BioInsights;
