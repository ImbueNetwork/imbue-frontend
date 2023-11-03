/* eslint-disable no-constant-condition */
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { blake2AsHex } from '@polkadot/util-crypto';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Brief } from '@/lib/models';
import { showErrorMessage } from '@/utils/errorMessages';
import { getBalance } from '@/utils/helper';
import { initImbueAPIInfo } from '@/utils/polkadot';

import {
  applicationStatusId,
  Currency,
  OffchainProjectState,
  Project,
  User,
} from '@/model';
import ChainService from '@/redux/services/chainService';

import AccountChoice from '../AccountChoice';
import BackButton from '../BackButton';
import ErrorScreen from '../ErrorScreen';
import CountrySelector from '../Profile/CountrySelector';
import SuccessScreen from '../SuccessScreen';

type ApplicationOwnerProps = {
  briefOwner: any;
  brief: Brief;
  handleMessageBoxClick: (_user_id: number) => Promise<void>;
  application: Project | any;
  setLoading: (_loading: boolean) => void;
  updateProject: (
    _chainProjectId?: number,
    _escrow_address?: string
  ) => Promise<void>;
  user: User | any;
};

const ApplicationOwnerHeader = (props: ApplicationOwnerProps) => {
  const {
    briefOwner,
    brief,
    handleMessageBoxClick,
    application,
    setLoading,
    updateProject,
    user,
  } = props;

  const [openPopup, setOpenPopup] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [loadingWallet, setLoadingWallet] = useState<string>('');
  const [balance, setBalance] = useState<string>();

  const router = useRouter();

  useEffect(() => {
    const showBalance = async () => {
      try {
        setLoadingWallet('loading');
        const balance = await getBalance(
          user?.web3_address,
          application?.currency_id ?? Currency.IMBU,
          user,
          application.id
        );
        setBalance(balance.toLocaleString());
      } catch (error) {
        setError({ message: error });
      } finally {
        setLoadingWallet('');
      }
    };
    user?.web3_address && showBalance();
  }, [user?.web3_address, application?.currency_id, user]);

  const startWork = async (account: WalletAccount) => {
    setLoading(true);

    try {
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);
      delete application.modified;
      const briefHash = blake2AsHex(JSON.stringify(application));
      const result = await chainService?.commenceWork(account, briefHash);

      while (true) {
        if (result.status || result.txError) {
          if (result.status) {
            const projectId = parseInt(result.eventData[2]);
            const escrow_address = result.eventData[5];
            // setProjectId(applicationId);
            await updateProject(projectId, escrow_address);
            setSuccess(true);
          } else if (result.txError) {
            let errorMessage = showErrorMessage(result.errorMessage);

            if (result?.errorMessage?.includes('1010:')) {
              errorMessage = showErrorMessage(1010);
            }

            setError({ message: errorMessage });
          }
          break;
        }
        await new Promise((f) => setTimeout(f, 1000));
      }
    } catch (error) {
      setError({ message: `Something went wrong ${error}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center w-full lg:justify-between lg:px-10 flex-wrap relative'>
      <BackButton className='absolute left-0 top-5' />
      <div className='flex items-start'>
        <div className='flex flex-col gap-2'>
          <Image
            onClick={() => router.push(`/profile/${briefOwner?.username}`)}
            className='w-16 h-16 rounded-full object-cover cursor-pointer'
            src={
              briefOwner?.profile_photo ??
              require('@/assets/images/profile-image.png')
            }
            height={200}
            width={200}
            priority
            alt='profileImage'
          />
          <p className='text-sm text-content-primary break-all mt-5 lg:mt-2'>
            @
            {briefOwner?.username?.length > 16
              ? `${briefOwner?.username.substr(0, 16)}...`
              : briefOwner?.username}
          </p>
          <div className='flex flex-col gap-2'>
            <p className='text-[1.25rem] font-normal capitalize text-imbue-purple'>
              {briefOwner?.display_name} 
            </p>
            <CountrySelector user={briefOwner} />
          </div>
        </div>
      </div>
      <div>
        <div className='ml-auto lg:ml-0 flex items-center justify-end gap-2 mt-3 lg:mt-0'>
          <button
            className='primary-btn in-dark w-button !text-xs lg:!text-base'
            onClick={() => brief && handleMessageBoxClick(briefOwner.id)}
          >
            Message
          </button>
          {application?.status_id === OffchainProjectState.Accepted ? (
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
              }-btn in-dark text-xs lg:text-base rounded-full py-[7px] px-3 lg:px-6 lg:py-[10px]`}
            >
              {applicationStatusId[application?.status_id]}
            </button>
          )}
        </div>
        <div>
          <p className='text-sm lg:text-base mt-5 mb-3 text-imbue-purple text-right'>
            {loadingWallet === 'loading' && 'Loading Wallet...'}
            {loadingWallet === 'connecting' && 'Connecting Wallet...'}
            {!loadingWallet &&
              (balance === undefined
                ? 'No wallet found'
                : `Your Balance: ${balance} $${Currency[Currency.IMBU]}`)}
          </p>
          {Number(balance) < 500 && (
            <div className='flex rounded-2xl gap-2 bg-imbue-coral px-2 py-1'>
              <ErrorOutlineOutlinedIcon />
              <p>the imbu balance is less than 500 $IMBU</p>
            </div>
          )}
        </div>
      </div>
      <AccountChoice
        accountSelected={(account) => startWork(account)}
        visible={openPopup}
        setVisible={setOpenPopup}
        initiatorAddress={user?.web3_address}
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
        title={`The brief funds have been successfully deposited into escrow. You can now begin your work!`}
        open={success}
        setOpen={setSuccess}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Go To Dashboard
          </button>
        </div>
      </SuccessScreen>
    </div>
  );
};

export default ApplicationOwnerHeader;
