/* eslint-disable no-constant-condition */
import { useMediaQuery } from '@mui/material';
import { blake2AsHex } from '@polkadot/util-crypto';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { Brief } from '@/lib/models';
import { initImbueAPIInfo } from '@/utils/polkadot';

import { Freelancer, Project, User } from '@/model';
import ChainService from '@/redux/services/chainService';

import AccountChoice from '../AccountChoice';
import ErrorScreen from '../ErrorScreen';
import SuccessScreen from '../SuccessScreen';

type ApplicationOwnerProps = {
  briefOwner: any;
  brief: Brief;
  handleMessageBoxClick: (_user_id: number, _freelancer: any) => Promise<void>;
  freelancer: Freelancer;
  application: Project | any;
  setLoading: (_loading: boolean) => void;
  updateProject: (_chainProjectId?: number) => Promise<void>;
  user: User | any;
};

const ApplicationOwnerHeader = (props: ApplicationOwnerProps) => {
  const {
    briefOwner,
    brief,
    handleMessageBoxClick,
    freelancer,
    application,
    setLoading,
    updateProject,
    user,
  } = props;

  const [openPopup, setOpenPopup] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [projectId, setProjectId] = useState<string>();

  const router = useRouter();
  const { applicationId }: any = router.query;

  const applicationStatusId = [
    'Draft',
    'Pending Review',
    'Changes Requested',
    'Rejected',
    'Accepted',
  ];
  const mobileView = useMediaQuery('(max-width:480px)');

  const startWork = async (account: WalletAccount) => {
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    const chainService = new ChainService(imbueApi, user);
    delete application.modified;
    const briefHash = blake2AsHex(JSON.stringify(application));
    const result = await chainService?.commenceWork(account, briefHash);

    while (true) {
      if (result.status || result.txError) {
        if (result.status) {
          const projectId = parseInt(result.eventData[2]);
          while (true) {
            const projectIsOnChain = await chainService.getProjectOnChain(
              projectId
            );
            if (projectIsOnChain) {
              await updateProject(projectId);
              setProjectId(applicationId);
              setSuccess(true);
              break;
            }
            await new Promise((f) => setTimeout(f, 1000));
          }
        } else if (result.txError) {
          setError({ message: result.errorMessage });
        }
        break;
      }
      await new Promise((f) => setTimeout(f, 1000));
    }
    setLoading(false);
  };

  return (
    <div className='flex items-center w-full lg:justify-between lg:px-10 flex-wrap'>
      <div className='flex gap-5 items-center'>
        <Image
          className='w-16 h-16 rounded-full object-cover cursor-pointer'
          src={require('@/assets/images/profile-image.png')}
          priority
          alt='profileImage'
        />
        <p className='text-[1.25rem] font-normal capitalize text-imbue-purple'>
          {briefOwner?.display_name}
        </p>
      </div>
      {
        <p className='text-[1rem] text-imbue-purple max-w-[55%] text-center break-words'>
          @
          {mobileView && briefOwner?.username?.length > 16
            ? `${briefOwner?.username.substr(0, 16)}...`
            : briefOwner?.username}
        </p>
      }

      <div className='ml-auto lg:ml-0'>
        <button
          className='primary-btn in-dark w-button !text-xs lg:!text-base'
          onClick={() =>
            brief && handleMessageBoxClick(brief?.user_id, freelancer?.username)
          }
        >
          Message
        </button>
        {application?.status_id === 4 ? (
          <button
            className='Accepted-btn h-[2.7rem] text-black in-dark text-xs lg:text-base rounded-full px-3 ml-3 lg:ml-0 lg:px-6'
            onClick={() => brief?.project_id && setOpenPopup(true)}
          >
            Start Work
          </button>
        ) : (
          <button
            className={`${
              applicationStatusId[application?.status_id]
            }-btn in-dark text-xs lg:text-base rounded-full py-3 px-3 lg:px-6 lg:py-[14px]`}
          >
            {applicationStatusId[application?.status_id]}
          </button>
        )}
      </div>
      <AccountChoice
        accountSelected={(account) => startWork(account)}
        visible={openPopup}
        setVisible={setOpenPopup}
        initiatorAddress={application?.initiator}
        filterByInitiator
      />
      <ErrorScreen {...{ error, setError }}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => setError(null)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Try Again
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </ErrorScreen>

      <SuccessScreen
        title={`You have successfully hired ${freelancer?.display_name} as a freelacer for your brief`}
        open={success}
        setOpen={setSuccess}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            See Project
          </button>
          <button
            onClick={() => setSuccess(false)}
            className='underline text-xs lg:text-base font-bold'
          >
            Continue
          </button>
        </div>
      </SuccessScreen>
    </div>
  );
};

export default ApplicationOwnerHeader;
