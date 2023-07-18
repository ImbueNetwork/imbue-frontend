import {
  Alert,
  Dialog,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { blake2AsHex } from '@polkadot/util-crypto';
import WalletIcon from '@svgs/wallet.svg';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FaRegCopy } from 'react-icons/fa';
import { FiPlusCircle } from 'react-icons/fi';

import { getCurrentUser } from '@/utils';
import { initImbueAPIInfo } from '@/utils/polkadot';

import AccountChoice from '@/components/AccountChoice';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import Approvers from '@/components/Grant/Approvers';

import * as config from '@/config';
import { timeData } from '@/config/briefs-data';
import { Currency, OffchainProjectState } from '@/model';
import ChainService from '@/redux/services/chainService';
// import ChainService from '@/redux/services/chainService';

interface MilestoneItem {
  name: string;
  amount: number | undefined;
  description: string;
}

const GrantApplication = (): JSX.Element => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [escrowAddress, setEscrowAddress] = useState<string>('');
  const [approvers, setApprovers] = useState<string[]>([]);
  // const [newApprover, setNewApprover] = useState<string>();
  const [currencyId, setCurrencyId] = useState<number>(0);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { name: '', amount: undefined, description: '' },
  ]);
  const [durationId, setDurationId] = useState(0);
  const [success, setSuccess] = useState(false);
  const [projectId, setProjectId] = useState<number>();
  const [copied, setCopied] = useState<boolean>(false);

  const copyAddress = () => {
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };


  // const { user } = useSelector((state: RootState) => state.userState);
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);

  const durationOptions = timeData.sort((a, b) =>
    a.value > b.value ? 1 : a.value < b.value ? -1 : 0
  );

  const currencies = Object.keys(Currency).filter(
    (key: any) => !isNaN(Number(Currency[key]))
  );

  // const onAddApprover = () => {
  //   if (!newApprover) return;
  //   setApprovers([...approvers, newApprover]);
  //   setNewApprover('');
  // };

  const imbueFeePercentage = 5;
  const totalCostWithoutFee = milestones.reduce(
    (acc, { amount }) => acc + (amount ?? 0),
    0
  );
  const imbueFee = (totalCostWithoutFee * imbueFeePercentage) / 100;
  const totalCost = imbueFee + totalCostWithoutFee;

  const onAddMilestone = () => {
    setMilestones([
      ...milestones,
      { name: '', amount: undefined, description: '' },
    ]);
  };

  const onRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;

    const newMilestones = [...milestones];
    newMilestones.splice(index, 1);
    setMilestones(newMilestones);
  };

  // const removeApprover = (index: number) => {
  //   if (approvers.length === 0) return;
  //   const newApprovers = [...approvers];
  //   newApprovers.splice(index, 1);
  //   setApprovers(newApprovers);
  // };

  const validateFormData = () => {
    for (let i = 0; i < milestones.length; i++) {
      const { amount, name } = milestones[i];

      if (
        amount === undefined ||
        amount === null ||
        amount === 0 ||
        name === undefined ||
        name === null ||
        name.length === 0
      ) {
        return false;
      }
    }

    if (approvers.length === 0) return false;

    return true;
  };

  const formDataValid = validateFormData();

  const handleSelectAccount = async (account: WalletAccount) => {
    try {
      setLoading(true);
      await submitGrant(account);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
      setShowPolkadotAccounts(false);
    }
  };

  async function handleSubmit() {
    setShowPolkadotAccounts(true);
  }

  const submitGrant = async (account: WalletAccount) => {
    if (!account) return;
    setLoading(true);

    try {
      const user = await getCurrentUser();
      const grant = {
        title,
        description,
        duration_id: durationId, // TODO:
        required_funds: totalCost,
        currency_id: currencyId,
        user_id: user.id,
        owner: account.address,
        total_cost_without_fee: totalCostWithoutFee,
        imbue_fee: imbueFee,
        chain_project_id: projectId,
        milestones: milestones.map((milestone) => ({
          ...milestone,
          percentage_to_unlock: Math.floor(
            100 * ((milestone.amount ?? 0) / totalCostWithoutFee)
          ),
        })),
        approvers,
      };

      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user)

      const grantMilestones = grant.milestones.map((m) => ({
        percentageToUnlock: m.percentage_to_unlock,
      }));

      const grant_id = blake2AsHex(JSON.stringify(grant));

      if (!account) return
      const result = await chainService.submitInitialGrant(account, grantMilestones, approvers, currencyId, totalCost, "kusama", grant_id);

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (result.status || result.txError) {
          if (result.status) {
            setEscrowAddress(result?.eventData[5])
            setSuccess(true);
          } else if (result.txError) {
            setError({ message: result.errorMessage });
          }
          break;
        }
        await new Promise((f) => setTimeout(f, 1000));
      }

      const resp = await fetch(`${config.apiBase}grants`, {
        headers: config.postAPIHeaders,
        method: 'post',
        body: JSON.stringify({
          ...grant,
          status_id: OffchainProjectState.Accepted,
          chain_project_id: result?.eventData[2],
          escrow_address: result?.eventData[5]
        }),
      });

      if (resp.status === 200 || resp.status === 201) {
        const { grant_id } = (await resp.json()) as any;
        setProjectId(grant_id);
        setSuccess(true);
      } else {
        setError({ message: 'Failed to submit a grant' });
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const [approversPreview, setApproverPreview] = useState<any[]>([]);

  const removeApprover = (index: number) => {
    if (approvers.length === 0) return;
    const newApprovers = [...approversPreview];
    newApprovers.splice(index, 1);
    setApprovers(newApprovers.map((v: any) => v?.web3_address));
    setApproverPreview(newApprovers);
  };

  return (
    <div className='flex flex-col gap-10 leading-[1.5] hq-layout !mx-3 lg:!mx-auto'>
      <div className='rounded-[20px] border border-solid border-white bg-background'>
        <p className='px-6 lg:px-12 py-5 text-[20px] text-imbue-purple-dark border-b border-imbue-light-purple'>
          Grant description
        </p>
        <div className='px-6 lg:px-12 py-5 lg:py-8 text-base leading-[1.2]'>
          <div className='flex flex-col-reverse lg:flex-row justify-between gap-10 lg:gap-0'>
            <div className='flex flex-col gap-8 w-full lg:w-3/5'>
              <div className='flex flex-col gap-4 text-imbue-purple-dark'>
                <div>Title</div>
                <input
                  value={title}
                  placeholder='Input title'
                  onChange={(e) => setTitle(e.target.value)}
                  className='bg-transparent border border-imbue-purple rounded-md p-3 placeholder:text-imbue-light-purple text-imbue-purple outline-primary'
                />
              </div>
              <div className='flex flex-col gap-4 text-imbue-purple-dark'>
                <div>Description</div>
                <textarea
                  maxLength={500}
                  value={description}
                  placeholder='Input description'
                  onChange={(e) => setDescription(e.target.value)}
                  className='bg-transparent border border-imbue-purple rounded-md placeholder:text-imbue-light-purple text-imbue-purple outline-primary min-h-[160px] p-3'
                />
                <div className='text-imbue-purple text-sm'>{`${
                  description?.length || 0
                }/300`}</div>
              </div>
            </div>
            <div className='flex flex-col gap-[50px] lg:mt-10 lg:w-60'>
              <div className='flex flex-col text-content'>
                <div className='flex flex-row items-start gap-6'>
                  <Image
                    src={require('@/assets/svgs/tag.svg')}
                    height={24}
                    width={24}
                    alt={'dollarSign'}
                    className='mt-1'
                  />
                  <div className='flex flex-col'>
                    <h3 className='text-xl leading-[1.5] font-normal m-0 p-0'>
                      Ecosystem
                    </h3>
                    <div className='mt-2 text-content-primary'>
                      Kusama Treasury (KSM)
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex flex-col'>
                <div className='flex flex-row items-start gap-6'>
                  <Image
                    src={require('@/assets/svgs/calendar-icon.svg')}
                    height={24}
                    width={24}
                    alt={'calenderIcon'}
                    className='mt-1'
                  />
                  <div className='flex flex-col'>
                    <h3 className='text-xl font-normal text-content'>
                      {durationOptions[durationId]?.label}
                    </h3>
                    <div className='text-content-primary mt-2'>Timeline</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-[20px] bg-background'>
        <div className='flex justify-between text-[20px] text-content px-6 lg:px-12 py-5 border-b border-imbue-light-purple'>
          <p>Approvers</p>
          <div>{`Total grant: ${totalCost} ${currencies[currencyId]}`}</div>
        </div>
        <div className='flex flex-col lg:flex-row justify-between px-6 lg:px-12 py-8 text-base leading-[1.2] border-b border-b-imbue-light-purple items-start'>
          <div className='flex flex-col gap-8 w-full lg:w-1/2'>
            <div className='flex flex-col gap-4 w-full'>
              {/* <input
                value={newApprover || ''}
                placeholder='Input address of an approver'
                onChange={(e) => setNewApprover(e.target.value)}
                className='bg-[#1a1a18] border border-solid border-white rounded-[5px] p-3 flex-grow h-fit'
              /> */}
              <div className='flex flex-col gap-4 ml-2'>
                {approversPreview.map((approver, index) => (
                  <div
                    key={index}
                    className='flex flex-row justify-between items-center w-full lg:w-2/3 gap-10'
                  >
                    <div className='flex w-full'>
                      <Image
                        className='w-10 h-10'
                        width={40}
                        height={40}
                        src={approver?.profile_photo}
                        alt=''
                      />
                      <div className='flex flex-col ml-4 gap-1 justify-center  text-content-primary'>
                        <span>{approver?.display_name}</span>
                        <span className='text-xs break-all text-content-primary'>
                          {approver?.web3_address}
                        </span>
                      </div>
                    </div>
                    <span
                      className='text-content-primary font-bold hover:border-red-500 hover:text-red-500 cursor-pointer'
                      onClick={() => removeApprover(index)}
                    >
                      x
                    </span>
                  </div>
                ))}
              </div>
              <div className='flex flex-col'>
                <Approvers approvers={approvers} setApprovers={setApprovers} />
                {/* <div
                  className='flex flex-row items-center gap-2 clickable-text cursor-pointer active:scale-105 origin-top-left ml-2 my-10'
                  onClick={onAddApprover}
                >
                  <FiPlusCircle color='var(--theme-primary)' />
                  <p className='w-full'>Add approver</p>

                </div> */}
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-4 mt-8 lg:mt-0'>
            <div>
              <p className='text-lg text-content m-0 p-0'>
                How long will this project take?
              </p>
              <select
                name='duration'
                value={durationId}
                onChange={(e) => setDurationId(Number(e.target.value))}
                className='bg-transparent round border border-imbue-purple rounded-[5px] text-base px-5 py-3 mt-4 w-full text-content-primary outline-content-primary'
                placeholder='Select a duration'
                required
              >
                {durationOptions.map(({ label, value }, index) => (
                  <option
                    value={value}
                    key={index}
                    className='duration-option bg-overlay py-2'
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className='text-lg text-content m-0 p-0'>Currency</p>
              <div>
                <select
                  name='currencyId'
                  value={currencyId}
                  onChange={(e) => setCurrencyId(Number(e.target.value))}
                  placeholder='Select a currency'
                  className='bg-transparent round border border-imbue-purple rounded-[5px] text-base px-5 py-3 mt-4 w-full text-content-primary outline-content-primary'
                  required
                >
                  {currencies.map((currency: any) => (
                    <option
                      value={Currency[currency]}
                      key={Currency[currency]}
                      className='hover:!bg-overlay'
                    >
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col px-6 lg:px-7 py-5'>
          <div className='text-[20px] text-content lg:ml-5 mb-8'>
            Milestones
          </div>
          <div className='flex flex-col gap-4'>
            {milestones.map(
              ({ name, amount, description: milestoneDescription }, index) => {
                const percent = Number(
                  ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
                );
                return (
                  <div key={index} className='flex flex-col gap-0'>
                    <div className='flex flex-row relative'>
                      <span
                        onClick={() => onRemoveMilestone(index)}
                        className='absolute top-[-1rem] right-2 text-sm lg:text-xl text-imbue-purple font-bold hover:border-red-500 hover:text-red-500 cursor-pointer'
                      >
                        x
                      </span>
                      <div className='text-base mr-4 lg:mr-9 text-content mt-0.5'>
                        {index + 1}.
                      </div>

                      <div className='flex flex-row justify-between w-full text-content'>
                        <div className='w-3/5'>
                          <h3 className=' text-base lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                            Title
                          </h3>

                          <input
                            type='text'
                            data-testid={`milestone-title-${index}`}
                            className='input-budget  text-base leading-5 rounded-[5px] py-3 px-5 text-imbue-purple text-[1rem] text-left  pl-5 mb-8'
                            value={name || ''}
                            onChange={(e) =>
                              setMilestones([
                                ...milestones.slice(0, index),
                                {
                                  ...milestones[index],
                                  name: e.target.value,
                                },
                                ...milestones.slice(index + 1),
                              ])
                            }
                          />

                          <p className='mb-2 lg:mb-5 text-base lg:text-lg'>
                            Description
                          </p>
                          <textarea
                            className='input-description text-base'
                            value={milestoneDescription}
                            onChange={(e) =>
                              setMilestones([
                                ...milestones.slice(0, index),
                                {
                                  ...milestones[index],
                                  description: e.target.value,
                                },
                                ...milestones.slice(index + 1),
                              ])
                            }
                          />
                        </div>

                        <div className='flex flex-col w-4/12 mt-[-0.2rem]'>
                          <h3 className=' text-base lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                            Amount
                          </h3>
                          <TextField
                            color='secondary'
                            id='outlined-start-adornment'
                            InputProps={{
                              startAdornment: (
                                <InputAdornment
                                  sx={{ color: 'var(--theme-purple)' }}
                                  position='start'
                                >
                                  {currencies[currencyId]}
                                </InputAdornment>
                              ),
                            }}
                            className='amountInput'
                            type='number'
                            value={amount || ''}
                            onChange={(e) =>
                              setMilestones([
                                ...milestones.slice(0, index),
                                {
                                  ...milestones[index],
                                  amount: Number(e.target.value),
                                },
                                ...milestones.slice(index + 1),
                              ])
                            }
                          />

                          {totalCostWithoutFee !== 0 && (
                            <div className='flex flex-col items-end mt-3 gap-2 w-full'>
                              <div className='mt-2 text-base text-content-primary'>
                                {percent}%
                              </div>
                              <div className='progress-bar'>
                                <div
                                  className='progress'
                                  style={{
                                    width: `${percent}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {index !== milestones.length - 1 && (
                      <hr className='mx-4 my-4 text-content' />
                    )}
                  </div>
                );
              }
            )}
          </div>
          <div
            className='clickable-text btn-add-milestone mx-5 mt-8 lg:mx-14 !mb-0 text-base lg:text-xl font-bold'
            onClick={onAddMilestone}
          >
            <FiPlusCircle color='var(--theme-primary)' />
            Add milestone
          </div>

          <div className='lg:mx-4 px-10 mt-10 bg-overlay py-8 rounded-xl mb-4'>
            <div className='flex flex-row items-center mb-5'>
              <div className='flex flex-col flex-grow'>
                <p className='text-lg lg:text-xl text-content m-0 p-0'>
                  Requested budget
                </p>
              </div>
              <div className='text-content-primary'>
                {`${Number(totalCostWithoutFee.toFixed(2)).toLocaleString()} ${
                  currencies[currencyId]
                }`}
              </div>
            </div>

            <hr className='my-6 text-content' />

            <div className='flex flex-row items-center mb-5'>
              <div className='flex flex-col flex-grow'>
                <p className='text-lg lg:text-xl text-content m-0 p-0'>
                  Imbue Service Fee 5% - Learn more about Imbue’s fees
                </p>
              </div>
              <div className='text-content-primary'>
                {`${Number(imbueFee.toFixed(2)).toLocaleString()} ${
                  currencies[currencyId]
                }`}
              </div>
            </div>

            <hr className='my-6 text-content' />

            <div className='flex flex-row items-center mb-5'>
              <div className='flex flex-col flex-grow'>
                <p className='text-lg lg:text-xl text-content m-0 p-0'>Total</p>
              </div>
              <div className='text-content-primary'>
                ${Number(totalCost.toFixed(2)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='buttons-container'>
        <button
          disabled={!formDataValid}
          className='primary-btn in-dark w-button'
          onClick={() => handleSubmit()}
        >
          Submit
        </button>
      </div>
      {loading && <FullScreenLoader />}
      <Dialog
        open={success}
        onClose={() => router.push(`/projects/${projectId}`)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        className='p-14 errorDialogue'
      >
        <div className='my-auto flex flex-col gap-3 items-center p-8'>
          <div className='f-modal-alert'>
            <div className='p-10 border-[5px] border-solid border-primary rounded-full  relative'>
              <Image src={WalletIcon} alt='wallet icon' className='w-24 h-24' />
            </div>
          </div>
          <div className='my-2 lg:my-10'>
            <p className='text-center text-lg lg:text-3xl font-bold'>
              Grant Created Successfully
            </p>
          </div>

          <CopyToClipboard text={escrowAddress}>
            <div className='flex flex-row gap-4 items-center rounded-[10px] border border-solid border-light-grey py-8 px-6 text-xl text-content'>
              <IconButton onClick={() => copyAddress()}>
                <FaRegCopy className='text-content' />
              </IconButton>
              <span>{escrowAddress}</span>
            </div>
          </CopyToClipboard>
          <div className='mt-6 mb-12 text-content text-lg text-center'>
            Please use this given address to create a proposal in your Kusama
            treasury. After the voting is passed your project will be created
          </div>
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className='primary-btn in-dark w-button'
          >
            Continue
          </button>
        </div>
        <Alert
          className={`absolute right-4 top-4 z-10 transform duration-300 transition-all ${
            copied ? 'flex' : 'hidden'
          }`}
          severity='success'
        >
          Grant Wallet Address Copied to clipboard
        </Alert>
      </Dialog>

      <AccountChoice
        accountSelected={(account: WalletAccount) =>
          handleSelectAccount(account)
        }
        visible={showPolkadotAccounts}
        setVisible={setShowPolkadotAccounts}
      />
      <ErrorScreen {...{ error, setError }}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => setError(null)}
            className='underline text-xs lg:text-base font-bold'
          >
            Try Again
          </button>
        </div>
      </ErrorScreen>
    </div>
  );
};

export default GrantApplication;