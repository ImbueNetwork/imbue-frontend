/* eslint-disable react-hooks/exhaustive-deps */
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Badge, Menu, MenuItem, useMediaQuery } from '@mui/material';
import { SignerResult } from '@polkadot/api/types';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { initImbueAPIInfo } from '@/utils/polkadot';

import { Brief, Freelancer, OffchainProjectState, Project } from '@/model';
import ChainService from '@/redux/services/chainService';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';

import AccountChoice from '../AccountChoice';
import ErrorScreen from '../ErrorScreen';
import { HirePopup } from '../HirePopup';

interface MilestoneItem {
  name: string;
  amount: number | undefined;
}

type BriefOwnerHeaderProps = {
  brief: Brief;
  freelancer: Freelancer;
  application: Project | any;
  handleMessageBoxClick: (_userId: number, _freelancer: any) => void;
  updateApplicationState: (
    _application: any,
    _projectStatus: OffchainProjectState
  ) => void;
  milestones: MilestoneItem[];
  totalCostWithoutFee: number;
  imbueFee: number;
  totalCost: number;
  setLoading: (_loading: boolean) => void;
  openAccountChoice: boolean;
  setOpenAccountChoice: (_loading: boolean) => void;
  user: any;
};

const BriefOwnerHeader = (props: BriefOwnerHeaderProps) => {
  const {
    brief,
    freelancer,
    application,
    handleMessageBoxClick,
    updateApplicationState,
    milestones,
    totalCostWithoutFee,
    imbueFee,
    totalCost,
    setLoading,
    openAccountChoice,
    setOpenAccountChoice,
    user,
  } = props;

  const [balance, setBalance] = useState<string>();
  const [loadingWallet, setLoadingWallet] = useState<any>();
  const [error, setError] = useState<any>();

  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const router = useRouter();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleOptionsClose = () => {
    setAnchorEl(null);
  };

  const getBalance = async (walletAddress: string, currency_id: number) => {
    try {
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);

      if (!walletAddress) return;
      const balance: any = await chainService.getBalance(
        walletAddress,
        currency_id
      );
      return balance;
    } catch (error) {
      setError({ message: `An error occured while fetching balance.` });
    }
  };

  const accountSelected = async (account: WalletAccount): Promise<any> => {
    try {
      setLoadingWallet((prev: any) => ({ ...prev, connecting: true }));
      const result = await getAccountAndSign(account);
      const resp = await authorise(
        result?.signature as SignerResult,
        result?.challenge as string,
        account
      );
      if (resp.status === 200 || resp.status === 201) {
        const bl = await getBalance(account.address, application.currency_id);
        setBalance(bl);
      } else {
        setError({ message: 'Could not connect wallet. Please Try again' });
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoadingWallet((prev: any) => ({ ...prev, connecting: false }));
    }
  };

  useEffect(() => {
    const showBalance = async () => {
      try {
        setLoadingWallet((prev: any) => ({ ...prev, balance: true }));
        const balance = await getBalance(
          user?.web3_address,
          application?.currency_id ?? 0
        );
        setBalance(balance);
      } catch (error) {
        setError(error);
      } finally {
        setLoadingWallet((prev: any) => ({ ...prev, balance: false }));
      }
    };
    user?.web3_address && showBalance();
  }, [user?.web3_address, application?.currency_id]);

  const mobileView = useMediaQuery('(max-width:480px)');

  return (
    <div className='flex items-center w-full md:justify-between lg:px-10 flex-wrap gap-4'>
      <div className='flex gap-5 items-center'>
        <Image
          className='w-16 h-16 rounded-full object-cover cursor-pointer'
          src={require('@/assets/images/profile-image.png')}
          priority
          alt='profileImage'
        />
        <div>
          <Badge
            badgeContent={'Hired'}
            color='primary'
            invisible={
              !(application?.status_id === OffchainProjectState.Accepted)
            }
          >
            <p className='text-2xl font-bold capitalize'>
              {freelancer?.display_name}
            </p>
          </Badge>
          <p className='text-sm mt-2'>
            {loadingWallet?.balance && 'Loading Wallet...'}
            {loadingWallet?.connecting && 'Connecting Wallet...'}
            {!loadingWallet?.balance &&
              !loadingWallet?.connecting &&
              (balance === undefined
                ? 'No wallet found'
                : `Balance: ${balance}`)}
          </p>
        </div>
      </div>
      {
        <p className='text-base text-primary max-w-[50%] break-words'>
          @
          {mobileView && freelancer?.username?.length > 16
            ? `${freelancer?.username?.substr(0, 16)}...`
            : freelancer?.username}
        </p>
      }

      <div className='relative flex gap-3'>
        <button
          className='Pending Review-btn in-dark text-xs lg:text-base rounded-full py-3 px-6 lg:px-6 lg:py-[14px]'
          onClick={() =>
            application.user_id &&
            handleMessageBoxClick(application?.user_id, freelancer?.username)
          }
        >
          Message
        </button>

        {balance !== undefined ? (
          <button
            id='demo-customized-button'
            aria-controls={open ? 'demo-customized-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={open ? 'true' : undefined}
            onClick={handleOptionsClick}
            className='primary-btn in-dark w-button !text-xs lg:!text-base'
            disabled={loadingWallet?.balance || loadingWallet?.connecting}
          >
            {loadingWallet?.balance || loadingWallet?.connecting ? (
              'Please Wait...'
            ) : (
              <>
                Options
                <KeyboardArrowDownIcon fontSize='small' className='ml-2' />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setOpenAccountChoice(true)}
            className='primary-btn in-dark w-button !text-xs lg:!text-base'
          >
            Connect Wallet
          </button>
        )}
        <Menu
          id='basic-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={handleOptionsClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem
            onClick={() => {
              handleOptionsClose();
              router.push(`/freelancers/${freelancer?.username}/`);
            }}
          >
            Freelancer Profile
          </MenuItem>
          {application?.status_id == OffchainProjectState.PendingReview && (
            <div>
              <MenuItem
                onClick={() => {
                  handleOptionsClose();
                  setOpenPopup(true);
                }}
              >
                Hire
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleOptionsClose();
                  updateApplicationState(
                    application,
                    OffchainProjectState.ChangesRequested
                  );
                }}
              >
                Request Changes
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleOptionsClose();
                  updateApplicationState(
                    application,
                    OffchainProjectState.Rejected
                  );
                }}
              >
                Reject
              </MenuItem>
            </div>
          )}
        </Menu>
      </div>

      <HirePopup
        {...{
          openPopup,
          setOpenPopup,
          brief,
          freelancer,
          application,
          milestones,
          totalCostWithoutFee,
          imbueFee,
          totalCost,
          setLoading,
        }}
      />

      <AccountChoice
        accountSelected={(account: WalletAccount) => accountSelected(account)}
        visible={openAccountChoice}
        setVisible={setOpenAccountChoice}
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
    </div>
  );
};

export default BriefOwnerHeader;
