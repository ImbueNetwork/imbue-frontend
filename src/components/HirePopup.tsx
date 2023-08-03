/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMediaQuery } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import { blake2AsHex } from '@polkadot/util-crypto';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Currency, OffchainProjectState } from '@/model';
import { changeBriefApplicationStatus } from '@/redux/services/briefService';
import ChainService from '@/redux/services/chainService';
import { RootState } from '@/redux/store/store';

import AccountChoice from './AccountChoice';
import ErrorScreen from './ErrorScreen';
import SuccessScreen from './SuccessScreen';
import styles from '../styles/modules/hire-modal.module.css';
import { initImbueAPIInfo } from '../utils/polkadot';

export const HirePopup = ({
  openPopup: openHirePopup,
  setOpenPopup: setOpenHirePopup,
  brief,
  freelancer,
  application,
  milestones,
  totalCostWithoutFee,
  imbueFee,
  totalCost,
  setLoading,
}: any) => {
  const [popupStage, setstage] = useState<number>(0);
  const mobileView = useMediaQuery('(max-width:480px)');

  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  // const [projectId, setProjectId] = useState<string>();
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.userState);

  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: mobileView ? '98vw' : '65vw',
    bgcolor: 'var(--theme-background)',
    color: 'var(--theme-content)',
    pt: mobileView ? '10px' : '28px',
    pb: mobileView ? '10px' : '28px',
    boxShadow: 24,
    borderRadius: '20px',
    zIndex: 1,
  };

  const selectedAccount = async (account: WalletAccount) => {
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    const chainService = new ChainService(imbueApi, user);
    const briefOwners: string[] = user?.web3_address
      ? [user?.web3_address]
      : [''];
    const freelancerAddress: string = freelancer.web3_address;
    const budget = BigInt(totalCost * 1e12);
    const initialContribution = BigInt(totalCost * 1e12);
    application.status_id = OffchainProjectState.Accepted;
    delete application.modified;
    const briefHash = blake2AsHex(JSON.stringify(application));
    const currencyId = application.currency_id;

    const milestones = application.milestones.map((m: any) => ({
      percentageToUnlock: parseInt(m.percentage_to_unlock),
    }));
    const result = await chainService?.hireFreelancer(
      account,
      briefOwners,
      freelancerAddress,
      budget,
      initialContribution,
      briefHash,
      currencyId,
      milestones
    );

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (result.status || result.txError) {
        if (result.status) {
          const briefId = brief.id;
          await changeBriefApplicationStatus(
            briefId!,
            application.id,
            OffchainProjectState.Accepted
          );
          setSuccess(true);
        } else if (result.txError) {
          let errorMessage = result.errorMessage;
          if (result.errorMessage?.includes('1010:')) {
            errorMessage = `${result.errorMessage}.\nYou must have minimum balance of 500 $IMBUE`;
          }
          setError({ message: errorMessage });
          application.status_id = OffchainProjectState.PendingReview;
        }
        break;
      }
      await new Promise((f) => setTimeout(f, 1000));
    }
    setLoading(false);
    setstage(0);
    setOpenHirePopup(false);
  };

  const FirstContent = () => {
    return (
      <div className='relative modal-container'>
        <div className='flex w-full justify-start items-center px-5 gap-5 pt-8 md:px-10 lg:gap-11 lg:px-16 lg:pb-2'>
          <Image
            className='w-12 h-12 md:w-16 md:h-16 rounded-full object-cover'
            src={
              freelancer?.profile_image ||
              require('@/assets/images/profile-image.png')
            }
            alt='profileImage'
            width={70}
            height={70}
          />
          <span className='text-xl text-secondary-dark-hover'>
            {freelancer?.display_name}
          </span>
        </div>
        <p className='absolute top-0 text-center w-full text-lg lg:text-xl text-imbue-purple-dark'>
          Hire This Freelancer
        </p>
        <hr className='separator' />

        <div className='milestone-list px-5 lg:px-16 mb-5 max-h-96 overflow-y-scroll'>
          {milestones.map((m: any, index: any) => {
            // FIXME:
            return (
              <div className={styles.milestoneRow} key={index}>
                <p className='mr-3 lg:mr-9 text-lg'>{index + 1}.</p>
                <div className='flex justify-between w-full'>
                  <div>
                    <p className='text-lg mb-1 text-content'>Description</p>
                    <p className='text-base'>{m.name}</p>
                  </div>
                  <div className='budget-wrapper text-end'>
                    <p className='text-lg mb-1 text-content'>Amount</p>
                    <p>{m.amount}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <hr className='separator' />

        <div className='bg-overlay lg:mx-10 py-1 rounded-xl mb-5'>
          <div className={`${styles.budgetInfo} mx-5 lg:mt-3`}>
            <div className={styles.budgetDescription}>
              <p className='mb-2 text-lg'>Total price of the project</p>
              <div className='text-imbue-purple text-sm'>
                (This includes all milestones, and is the amount client will
                see)
              </div>
            </div>
            <div className='budget-value'>
              ${Number?.(totalCostWithoutFee?.toFixed?.(2))?.toLocaleString()}
            </div>
          </div>
          <div className={`${styles.budgetInfo} mx-5`}>
            <div className={styles.budgetDescription}>
              <p className='text-lg'>Imbue Service Fee 5%</p>
            </div>
            <div className='budget-value'>
              ${Number?.(imbueFee?.toFixed?.(2))?.toLocaleString?.()}
            </div>
          </div>
          <div className={`${styles.budgetInfo} mx-5 !mb-3`}>
            <div className={styles.budgetDescription}>
              <p className='text-lg'>Total</p>
            </div>
            <div className='budget-value'>
              ${Number?.(totalCost?.toFixed?.(2))?.toLocaleString?.()}
            </div>
          </div>
        </div>

        <button
          onClick={() => setstage(1)}
          className='primary-btn in-dark w-button mx-5 lg:mx-16'
        >
          Approve
        </button>
      </div>
    );
  };

  const SecondContent = () => {
    return (
      <div className='flex flex-col justify-center items-center modal-container px-5 lg:px-0 lg:w-2/3 mx-auto my-auto text-content'>
        <p className='text-center w-full text-lg lg:text-xl my-4 text-content-primary'>
          Deposit Fuds
        </p>
        <p className='text-center w-full text-lg lg:text-xl my-4'>
          Deposit the funds required for the project, these funds will be taken
          from your account once the freelancer starts the project.
        </p>
        <p className='text-center w-full text-lg lg:text-xl my-4'>
          The funds are then paid to the freelancer in stages only when you
          approve the completion of each milestone
        </p>
        <p className='mb-10'>
          <span className='text-lg lg:text-xl text-imbue-lemon mr-1'>
            {Number(totalCost.toFixed(2)).toLocaleString()}
          </span>
          ${Currency[application.currency_id]}
        </p>
        <button
          onClick={() => {
            setstage(2);
          }}
          className='primary-btn in-dark w-button lg:w-1/3 lg:mx-16'
          style={{ textAlign: 'center' }}
        >
          Deposit Funds
        </button>
      </div>
    );
  };

  if (popupStage === 2 && openHirePopup)
    return (
      <AccountChoice
        title='Choose Your Wallet'
        accountSelected={(account) => selectedAccount(account)}
        visible={true}
        setVisible={setOpenHirePopup}
      />
    );

  return (
    <>
      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        open={openHirePopup}
        onClose={() => {
          setOpenHirePopup(false);
        }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        sx={{ zIndex: 4 }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openHirePopup}>
          <Box sx={modalStyle}>
            {!popupStage && openHirePopup && <FirstContent />}
            {popupStage === 1 && <SecondContent />}
          </Box>
        </Fade>
      </Modal>

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
        title={`You have successfully hired ${freelancer?.display_name}!`}
        open={success}
        setOpen={setSuccess}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Continue
          </button>
        </div>
      </SuccessScreen>
    </>
  );
};
