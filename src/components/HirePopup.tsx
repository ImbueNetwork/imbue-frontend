/* eslint-disable @typescript-eslint/no-non-null-assertion */
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { useMediaQuery } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import { blake2AsHex } from '@polkadot/util-crypto';
import { WalletAccount } from '@talismn/connect-wallets';
import { ethers } from 'ethers'
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { sendNotification } from '@/utils';
import { ERC_20_ABI, getBalance, getEVMContract } from '@/utils/helper';

import { Currency, OffchainProjectState } from '@/model';
import { changeBriefApplicationStatus } from '@/redux/services/briefService';
import ChainService from '@/redux/services/chainService';
import { getOffchainEscrowAddress, getOffchainEscrowBalance, mintTokens } from '@/redux/services/projectServices';
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
  amountDue,
  setLoading,
}: any) => {
  const [popupStage, setstage] = useState<number>(0);
  const mobileView = useMediaQuery('(max-width:480px)');

  const [success, setSuccess] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<boolean>(false);
  const [depositCompleted, setDepositCompleted] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const [escrowAddress, setEscrowAddress] = useState<string>('');
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  const router = useRouter();
  const [freelancerImbueBalance, setFreelancerImbueBalance] = useState<number | string>(
    0
  );

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


  const updateEscrowInfo = async () => {
    const escrowAddress = await getOffchainEscrowAddress(application.id);
    setEscrowAddress(escrowAddress);
    const allBalances = await getOffchainEscrowBalance(application.id);
    const currency = Currency[application.currency_id].toString().toLowerCase();
    const escrowBalance = Number(allBalances[currency]) ?? 0;
    setEscrowBalance(escrowBalance);
  };

  useEffect(() => {
    const checkBalance = async () => {
      setFreelancerImbueBalance('Checking Imbue Balance');
      const balance = await getBalance(
        freelancer.web3_address,
        Currency.IMBU,
        user
      );

      setFreelancerImbueBalance(balance);
    };

    updateEscrowInfo();
    openHirePopup && checkBalance();
  }, [freelancer.web3_address, application?.currency_id, user, openHirePopup]);

  const selectedAccount = async (account: WalletAccount) => {
    setLoading(true);
    mintTokens(application.id, account.address);
    const imbueApi = await initImbueAPIInfo();
    const chainService = new ChainService(imbueApi, user);
    const briefOwners: string[] = user?.web3_address
      ? [user?.web3_address]
      : [''];
    const freelancerAddress: string = freelancer.web3_address;
    const budget = BigInt(totalCostWithoutFee * 1e12);
    const initialContribution = budget;
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
          await sendNotification(
            [application.user_id],
            'application.accepted.testing',
            'Congratulations your application has been accepted',
            `has accepted you as their freelancer best of luck`,
            brief.id,
            application.id
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
        <div className='flex w-full justify-start lg:items-center px-5 gap-5 pt-8 md:px-10 lg:px-16 lg:pb-2'>
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
          <div className='flex flex-col gap-1'>
            <span className='text-xl text-secondary-dark-hover'>
              {freelancer?.display_name}
            </span>
            {freelancerImbueBalance !== 'Checking Imbue Balance' ? (
              <>
                {Number(freelancerImbueBalance) < 500 ? (
                  <div className='lg:flex gap-1 lg:items-center rounded-2xl bg-imbue-coral px-3 py-1 text-sm text-white'>
                    <ErrorOutlineOutlinedIcon className='h-4 w-4 inline' />
                    <p className='inline'>
                      Freelancer does not currently have the necessary deposit
                      balance (500 $IMBU) to start the work
                    </p>
                  </div>
                ) : (
                  <div className='lg:flex gap-1 lg:items-center rounded-2xl bg-primary px-3 py-1 text-sm text-black'>
                    <CheckCircleOutlineIcon className='h-4 w-4 inline' />
                    <p className='inline'>
                      Freelancer currently has the necessary deposit balance (500
                      $IMBU) to start the work
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className='text-sm text-content-primary'>
                Checking Freelancer Wallet Balance
              </p>
            )}
          </div>
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
                    <p className='text-lg mb-1 text-content break-words'>{m.name.substring(0, 70) + " ..."}</p>
                    <p className='text-base'>{m.description.substring(0, 90) + "..."}</p>
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
              {Number?.(totalCostWithoutFee?.toFixed?.(2))?.toLocaleString()} ${Currency[application.currencyId]}
            </div>
          </div>
          <div className={`${styles.budgetInfo} mx-5`}>
            <div className={styles.budgetDescription}>
              <p className='text-lg'>Imbue Service Fee 5%</p>
            </div>
            <div className='budget-value'>
              {Number?.(imbueFee?.toFixed?.(2))?.toLocaleString?.()} ${Currency[application.currencyId]}
            </div>
          </div>
          <div className={`${styles.budgetInfo} mx-5 !mb-3`}>
            <div className={styles.budgetDescription}>
              <p className='text-lg'>Amount Received</p>
            </div>
            <div className='budget-value'>
              {Number?.(amountDue?.toFixed?.(2))?.toLocaleString?.()} ${Currency[application.currencyId]}
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
    const depositIntoEscrow = async () => {
      const transferAmount = totalCostWithoutFee - escrowBalance;
      switch (application.currency_id) {
        case Currency.ETH: {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const ethBalanceInWei = await provider.getBalance(signer.address);
          const ethBalance = Number(ethers.formatEther(ethBalanceInWei));

          if (ethBalance < transferAmount) {
            setError({ message: `Insufficient $${Currency[application.currency_id]} balance in ${signer.address}` });
            break;
          }
          else {
            const transferAmountInWei = ethers.parseEther((transferAmount).toPrecision(5).toString());
            const depositTx = await signer.sendTransaction({ to: escrowAddress, value: transferAmountInWei });
            setDepositSuccess(true);
            await provider.waitForTransaction(depositTx.hash, 1, 150000);
            setDepositCompleted(true);
            await updateEscrowInfo();
            break;
          }
        }
        case Currency.USDT: {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = await getEVMContract(application.currency_id);
          if (!contract) {
            setError({ message: "Contract address not found" });
            break;
          }
          const token = new ethers.Contract(contract.address, ERC_20_ABI, signer);
          const usdtBalance = Number(ethers.formatUnits(await token.balanceOf(signer.address), await token.decimals()));
          if (usdtBalance < transferAmount) {
            setError({ message: `Insufficient $${Currency[application.currency_id]} balance in ${signer.address}` });
          } else {
            const transferAmountInWei = ethers.parseUnits((transferAmount).toPrecision(5).toString(), contract.decimals);
            const depositTx = await token
              .transfer(escrowAddress, transferAmountInWei);
            setDepositSuccess(true);
            await provider.waitForTransaction(depositTx.hash, 1, 150000);
            setDepositCompleted(true);
            await updateEscrowInfo();
            break;
          }
        }
      }

    }

    if (application.currency_id < 100) {
      return (
        <div className='flex flex-col justify-center items-center modal-container px-5 lg:px-0 lg:w-2/3 mx-auto my-auto text-content'>
          <p className='text-center w-full text-lg lg:text-xl my-4 text-content-primary'>
            Deposit Funds
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
              {Number(totalCostWithoutFee.toFixed(2)).toLocaleString()}
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
    } else {
      // Imbue Multichain
      return (
        <div className='flex flex-col justify-center items-center modal-container px-5 lg:px-0 lg:w-2/3 mx-auto my-auto text-content'>
          <p className='text-center w-full text-lg lg:text-xl my-4 text-content-primary'>
            Deposit Funds
          </p>
          <p className='text-center w-full text-lg lg:text-xl my-4'>
            To Hire {freelancer.display_name}, please deposit the funds required for the project.
          </p>
          <p className='text-center w-full text-lg lg:text-xl my-4'>
            The funds are then paid to the freelancer in stages only when you
            approve the completion of each milestone
          </p>
          <p className='mb-10'>
            <span className='text-lg lg:text-xl text-imbue-lemon mr-1'>
              {Number(totalCostWithoutFee.toFixed(2)).toLocaleString()}
            </span>
            ${Currency[application.currency_id]}
          </p>
          <p className='mb-10'>
            <span>Escrow Address:</span>
            <span className='text-lg lg:text-xl text-imbue-lemon mr-1'>
              {escrowAddress}
            </span>
          </p>
          <p className='mb-10'>
            <span>Escrow Balance: </span>
            <span className='text-lg lg:text-xl text-imbue-lemon mr-1'>
              {escrowBalance}
            </span>
            ${Currency[application.currency_id]}
          </p>
          {escrowBalance < (totalCostWithoutFee) ? (
            <button
              onClick={() => depositIntoEscrow()}
              className='primary-btn in-dark w-button lg:w-1/3 lg:mx-16 disabled'
              style={{ textAlign: 'center' }}
            >
              Deposit Funds
            </button>
          ) : (
            <button
              onClick={
                () => {
                  setstage(2);
                }
              }
              className='primary-btn in-dark w-button lg:w-1/3 lg:mx-16 disabled'
              style={{ textAlign: 'center' }}
            >
              Hire
            </button>
          )
          }
        </div >
      );
    }

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
        sx={{ zIndex: 4, marginTop: '30px' }}
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


      <SuccessScreen
        title={`Your transfer has been sent.

        Please do not navigate away from this page until your transfer completes`}
        open={depositSuccess}
        setOpen={setDepositSuccess}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            disabled={!depositCompleted}
            onClick={() => { setDepositSuccess(false); setstage(0) }}
            className='primary-btn in-dark w-button w-full !m-0'
          >


            {depositCompleted ? "Continue" : "Waiting for deposit confirmation......."}
          </button>
        </div>
      </SuccessScreen>
    </>
  );
};
