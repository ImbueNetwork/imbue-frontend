import { Alert, Dialog, IconButton, Tooltip } from '@mui/material';
import { blake2AsHex } from '@polkadot/util-crypto';
import WalletIcon from '@svgs/wallet.svg';
import { WalletAccount } from '@talismn/connect-wallets';
import WalletConnectProvider from '@walletconnect/web3-provider'
// import ChainService from '@/redux/services/chainService';
import Filter from 'bad-words';
import { ethers } from 'ethers'
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FaRegCopy } from 'react-icons/fa';
import { FiPlusCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import Web3Modal from 'web3modal'

import { sendNotification } from '@/utils';
import { showErrorMessage } from '@/utils/errorMessages';
import {
  handleApplicationInput,
  validateApplicationInput,
} from '@/utils/helper';
import { initImbueAPIInfo } from '@/utils/polkadot';
import { getServerSideProps } from '@/utils/serverSideProps';

import AccountChoice from '@/components/AccountChoice';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import Approvers from '@/components/Grant/Approvers';

import * as config from '@/config';
import { timeData } from '@/config/briefs-data';
import { Currency, OffchainProjectState } from '@/model';
import ChainService from '@/redux/services/chainService';
import { getProjectEscrowAddress } from '@/redux/services/projectServices';
import { RootState } from '@/redux/store/store';

interface MilestoneItem {
  name: string;
  amount: number | undefined;
  description: string;
}

interface InputErrorType {
  title?: string;
  description?: string;
  approvers?: string;
  milestones: Array<{ name?: string; amount?: string; description?: string }>;
}

const GrantApplication = (): JSX.Element => {
  const router = useRouter();
  const filter = new Filter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();
  const [inputErrors, setInputErrors] = useState<InputErrorType>({
    title: '',
    description: '',
    approvers: '',
    milestones: [],
  });
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentAddress, setPaymentAddress] = useState<string>('');
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
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<string[]>([]);

  const copyAddress = () => {
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const { user, loading: userLoading } = useSelector(
    (state: RootState) => state.userState
  );
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);

  useEffect(() => {
    !user.id && !userLoading && router.push('/');
  }, [user.id, userLoading, router]);

  const durationOptions = timeData.sort((a, b) =>
    a.value > b.value ? 1 : a.value < b.value ? -1 : 0
  );

  const currencies = Object.keys(Currency).filter(
    (key: any) => !isNaN(Number(Currency[key]))
  );

  const imbueFeePercentage = 5;
  const totalCostWithoutFee = milestones.reduce(
    (acc, { amount }) => acc + (amount ?? 0),
    0
  );
  const imbueFee = (totalCostWithoutFee * imbueFeePercentage) / 100;
  const amountDue = totalCostWithoutFee - imbueFee;

  const onAddMilestone = () => {
    setMilestones([
      ...milestones,
      { name: '', amount: undefined, description: '' },
    ]);
  };


  const getWeb3Modal = async () => {
    const web3Modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
        },
      },
    })
    return web3Modal
  }

  const connect = async () => {
    try {
      const web3Modal = await getWeb3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const accounts = (await provider.listAccounts()).map(jsonProvider => jsonProvider.address);
      setAccounts(accounts)
    } catch (err) {
      console.log('error:', err)
    }
  }
  
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

  const milestonesRef = useRef<any>([]);

  // const formDataValid = validateFormData();

  const handleSelectAccount = async (account: WalletAccount) => {
    try {
      setLoading(true);
      await submitGrant(account);
    } catch (error) {
      setError({ message: error });
    } finally {
      setLoading(false);
      setShowPolkadotAccounts(false);
    }
  };

  async function handleSubmit() {
    setShowPolkadotAccounts(true);
  }

  const totalPercent = milestones.reduce((sum, { amount }) => {
    const percent = Number(
      ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
    );
    return sum + percent;
  }, 0);

  const submitGrant = async (account: WalletAccount) => {
    if (!account) return;
    if (approvers.includes(account.address))
      return setError({
        message: "You can't use approver address for grantor payment address",
      });
    if (totalPercent < 100)
      return setError({
        message: 'Total Percentage of milestones must be equal to 100%',
      });
    if (totalCostWithoutFee > 1e8)
      return setError({
        message: 'Total cost must be Less than 100,000,000',
      });

    setLoading(true);

    try {
      // const user = await getCurrentUser();
      if (filter.isProfane(title)) {
        setError({ message: 'please remove bad words from the title' });
        return;
      }
      const grant = {
        title: filter.clean(title),
        description: filter.clean(description),
        duration_id: durationId, // TODO:
        required_funds: amountDue,
        currency_id: currencyId,
        user_id: user.id,
        owner: account.address,
        total_cost_without_fee: totalCostWithoutFee,
        imbue_fee: imbueFee,
        chain_project_id: projectId,
        payment_address: currencyId >= 100 ? paymentAddress : null,
        milestones: milestones.map((milestone) => ({
          ...milestone,
          name: filter.clean(milestone.name),
          description: filter.clean(milestone.description),
          percentage_to_unlock: Math.floor(
            100 * ((milestone.amount ?? 0) / totalCostWithoutFee)
          ),
        })),
        approvers,
      };

      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);

      const grantMilestones = grant.milestones.map((m) => ({
        percentageToUnlock: m.percentage_to_unlock,
      }));

      const grant_id = blake2AsHex(JSON.stringify(grant));

      const result = await chainService.submitInitialGrant(
        account,
        grantMilestones,
        approvers,
        currencyId,
        totalCostWithoutFee,
        'kusama',
        grant_id
      );

      if (result.txError) {
        setError({
          message: `Failed to submit a grant ${result.errorMessage}`,
        });
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (result.status || result.txError) {
          if (result.status) {

            const resp = await fetch(`${config.apiBase}grants`, {
              headers: config.postAPIHeaders,
              method: 'post',
              body: JSON.stringify({
                ...grant,
                status_id: OffchainProjectState.Accepted,
                milestones: milestones
                  .filter((m) => m.amount !== undefined)
                  .map((m) => {
                    return {
                      name: m.name,
                      amount: m.amount,
                      description: m.description,
                      percentage_to_unlock: (
                        ((m.amount ?? 0) / totalCostWithoutFee) *
                        100
                      ).toFixed(0),
                    };
                  }),
                chain_project_id: result?.eventData[2],
                escrow_address: result?.eventData[5],
              }),
            });

            if (resp.status === 200 || resp.status === 201) {
              const { grant_id: grantId } = (await resp.json()) as any;
              setProjectId(grantId);


              if (currencyId < 100) {
                setEscrowAddress(result?.eventData[5]);
              } else {
                const offchainProjectAddress = await getProjectEscrowAddress(grantId);
                setEscrowAddress(offchainProjectAddress);
              }

              setSuccess(true);
              await sendNotification(
                grant.approvers,
                'AddApprovers.testing',
                'You were invited as an Approver',
                `Please review and provide your feedback.`,
                grantId
              );
            } else {
              const errorBody = await resp.json();
              setError({ message: `Failed to submit a grant. (${errorBody})` });
            }
            break;
          } else if (result.txError) {
            setError({ message: showErrorMessage(result.errorMessage) });
            break;
          }
          break;
        }
        await new Promise((f) => setTimeout(f, 1000));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setError({ message: 'Could not submit grant. Please Try again' });
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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    milestoneIndex: number | undefined = undefined
  ) => {

    const { titleRes, descriptionRes, milestonesRes, paymentAddressRes, errors } =
      handleApplicationInput(
        event,
        milestoneIndex,
        inputErrors,
        milestones,
        title,
        description,
        paymentAddress
      );
    setTitle(titleRes);
    setDescription(descriptionRes);
    setPaymentAddress(paymentAddressRes);
    setMilestones(milestonesRes);
    setInputErrors(errors);
  };

  useEffect(() => {
    setInputErrors((prev) => ({
      ...prev,
      approvers:
        approvers?.length < 4
          ? ''
          : 'Please select atleast 4 valid grant approvers',
    }));
  }, [approvers.length]);

  useEffect(() => {
    const { isValid, errors } = validateApplicationInput(
      'grant',
      inputErrors,
      milestones,
      title,
      description,
      approvers
    );
    setDisableSubmit(!isValid);
    setInputErrors(errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, milestones, approvers]);

  if (userLoading) return <FullScreenLoader />;

  return (
    <div className='flex flex-col gap-10 leading-[1.5] !mx-3 lg:!mx-auto'>
      <div className='rounded-[20px] border border-solid border-white bg-background'>
        <p className='px-6 lg:px-12 py-5 text-[20px] text-imbue-purple-dark border-b border-imbue-light-purple'>
          Grant description
        </p>
        <div className='px-6 lg:px-12 py-5 lg:py-8 text-base leading-[1.2]'>
          <div className='flex flex-col-reverse lg:flex-row justify-between gap-10 lg:gap-0'>
            <div className='flex flex-col gap-8 w-full lg:w-3/5'>
              <div
                ref={(el) => (milestonesRef.current[0] = el)}
                className='flex flex-col text-imbue-purple-dark'
              >
                <div>Title*</div>
                <input
                  autoComplete='off'
                  value={title}
                  maxLength={50}
                  placeholder='Input title'
                  onChange={handleChange}
                  name='mainTitle'
                  className='bg-transparent border border-imbue-purple rounded-md p-3 placeholder:text-imbue-light-purple text-imbue-purple outline-content-primary mt-4'
                />
                <div className='flex items-center justify-between mt-2'>
                  <p className={`text-xs text-imbue-light-purple-two`}>
                    {inputErrors?.title}
                  </p>
                  <div className='text-imbue-purple text-sm ml-auto'>
                    {`${title?.length || 0}/50`}
                  </div>
                </div>
              </div>
              <div
                ref={(el) => (milestonesRef.current[1] = el)}
                className='flex flex-col text-imbue-purple-dark'
              >
                <div>Description*</div>
                <textarea
                  autoComplete='off'
                  maxLength={5000}
                  value={description}
                  placeholder='Input description'
                  onChange={handleChange}
                  name='mainDescription'
                  className='bg-transparent border border-imbue-purple rounded-md placeholder:text-imbue-light-purple text-imbue-purple outline-content-primary min-h-[160px] p-3 mt-4'
                />
                <div className='flex items-center justify-between mt-2'>
                  <p className={`text-xs text-imbue-light-purple-two`}>
                    {inputErrors?.description}
                  </p>
                  <div className='text-imbue-purple text-sm text-right'>
                    {`${description?.length || 0}/5000`}
                  </div>
                </div>
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
          <div>{`Total grant: ${amountDue} ${Currency[currencyId]}`}</div>
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
              <div
                ref={(el) => (milestonesRef.current[2] = el)}
                className='flex flex-col gap-2'
              >
                <Approvers
                  approvers={approvers}
                  setApprovers={setApprovers}
                  user={user}
                />
                <p className={`text-xs text-imbue-light-purple-two`}>
                  {inputErrors?.approvers}
                </p>
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
            {currencyId >= 100 && (
            <div>
            <p className='text-lg text-content m-0 p-0'>Payment Address:</p>
            <div>
              {accounts.length == 0 ? (
                <button className='primary-btn in-dark w-button' onClick={connect}>Connect</button>
              ) : (
                <select
                  name='paymentAddress'
                  value={paymentAddress}
                  onChange={(e) => setPaymentAddress(e.target.value)}
                  placeholder='Select a payment address'
                  className='bg-transparent round border border-imbue-purple rounded-[5px] text-base px-5 py-3 mt-4 w-full text-content-primary outline-content-primary'
                  required
                >
                  {accounts.map((account: string) => (
                    <option
                      value={account}
                      key={account}
                      className='hover:!bg-overlay'
                    >
                      {account}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
            )}

          </div>
        </div>
        <div className='text-[20px] text-content lg:pl-12 py-5 border-b'>
          Milestones
        </div>
        <div className='flex flex-col px-6 lg:px-12 py-8'>
          <div className='flex flex-col gap-4'>
            {milestones.map(
              ({ name, amount, description: milestoneDescription }, index) => {
                const percent = Number(
                  ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
                );
                return (
                  <div
                    ref={(el) => (milestonesRef.current[index + 3] = el)}
                    key={index}
                    className='flex flex-col gap-0'
                  >
                    <div className='flex flex-row relative'>
                      {index !== 0 && (
                        <span
                          onClick={() => onRemoveMilestone(index)}
                          className='absolute top-[-1rem] right-2 text-sm lg:text-xl text-imbue-purple font-bold hover:border-red-500 hover:text-red-500 cursor-pointer'
                        >
                          x
                        </span>
                      )}

                      <div className='text-base mr-2 lg:mr-9 text-content mt-0.5'>
                        {index + 1}.
                      </div>

                      <div className='flex flex-col lg:flex-row justify-between w-full text-content'>
                        <div className='lg:w-3/5'>
                          <h3 className='text-base lg:text-xl mb-1 p-0 text-imbue-purple-dark font-normal'>
                            Title*
                          </h3>

                          <div className='mb-8'>
                            <input
                              autoComplete='off'
                              type='text'
                              maxLength={50}
                              data-testid={`milestone-title-${index}`}
                              placeholder='Add milestone title'
                              className='input-budget text-base leading-5 rounded-[5px] !p-3 text-content-primary mb-2 outline-content-primary placeholder:text-imbue-light-purple'
                              value={name || ''}
                              onChange={(e) => handleChange(e, index)}
                              name='milestoneTitle'
                            />
                            <div className='flex items-center justify-between'>
                              <p
                                className={`text-xs text-imbue-light-purple-two`}
                              >
                                {inputErrors?.milestones[index]?.name || ''}
                              </p>
                              <div className='text-imbue-purple text-sm ml-auto text-right'>
                                {`${milestones[index].name?.length || 0}/50`}
                              </div>
                            </div>
                          </div>

                          <p className='mb-2 lg:mb-5 text-base lg:text-lg'>
                            Description*
                          </p>
                          <div>
                            <textarea
                              autoComplete='off'
                              maxLength={5000}
                              placeholder='Add milestone description'
                              className='input-description text-base outline-content-primary placeholder:text-imbue-light-purple'
                              value={milestoneDescription}
                              onChange={(e) => handleChange(e, index)}
                              name='milestoneDescription'
                            />
                            <div className='flex items-center justify-between'>
                              <p
                                className={`text-xs text-imbue-light-purple-two`}
                              >
                                {inputErrors?.milestones[index]?.description ||
                                  ''}
                              </p>
                              <div className='text-imbue-purple text-sm ml-auto text-right'>
                                {`${milestones[index].description?.length || 0
                                  }/5000`}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-col lg:w-4/12 mt-5 lg:mt-[-0.2rem]'>
                          <h3 className=' text-base lg:text-xl mb-2 p-0 text-imbue-purple-dark font-normal'>
                            Amount*
                          </h3>
                          <div className='w-full relative p-0 m-0'>
                            <span className='h-fit absolute left-5 bottom-3 text-base text-content'>
                              {Currency[currencyId]}
                            </span>

                            <input
                              type='number'
                              onWheel={(e) => (e.target as HTMLElement).blur()}
                              data-testid={`milestone-amount-${index}`}
                              placeholder='Add an amount'
                              className='input-budget text-base rounded-[5px] py-3 pl-14 pr-5 text-imbue-purple text-right placeholder:text-imbue-light-purple outline-content-primary'
                              value={amount || ''}
                              onChange={(e) => handleChange(e, index)}
                              name='milestoneAmount'
                            />
                          </div>
                          <p
                            className={`text-xs text-imbue-light-purple-two mt-2`}
                          >
                            {inputErrors?.milestones[index]?.amount || ''}
                          </p>

                          {totalCostWithoutFee !== 0 && (
                            <div className='flex flex-col lg:items-end mt-3 gap-2 w-full'>
                              <div className='mt-2 text-base text-content-primary'>
                                {percent}%
                              </div>
                              <div className='progress-bar !w-full'>
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
                {`${Number(totalCostWithoutFee.toFixed(2)).toLocaleString()} $${Currency[currencyId]
                  }`}
              </div>
            </div>

            <hr className='my-6 text-content' />

            <div className='flex flex-row items-center mb-5'>
              <div className='flex flex-col flex-grow'>
                <p className='text-lg lg:text-xl text-content m-0 p-0 flex items-center'>
                  Imbue Service Fee 5% -
                  <a
                    href='https://www.imbue.network/faq'
                    target='_blank'
                    className='hover:underline ml-2 text-sm cursor-pointer'
                  >
                    Learn more about Imbue’s fees
                  </a>
                </p>
              </div>
              <div className='text-content-primary'>
                {`${Number(imbueFee.toFixed(2)).toLocaleString()} $${Currency[currencyId]
                  }`}
              </div>
            </div>

            <hr className='my-6 text-content' />

            <div className='flex flex-row items-center mb-5'>
              <div className='flex flex-col flex-grow'>
                <p className='text-lg lg:text-xl text-content m-0 p-0'>Amount Received</p>
              </div>
              <div className='text-content-primary'>
                {Number(amountDue.toFixed(2)).toLocaleString()} ${
                  Currency[currencyId]
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='buttons-container'>
        <Tooltip
          followCursor
          leaveTouchDelay={10}
          title={disableSubmit && 'Please fill all the required input fields'}
        >
          <button
            // disabled={!formDataValid}
            className={`primary-btn in-dark w-button ${disableSubmit && '!bg-gray-400 !text-white !cursor-not-allowed'
              }`}
            onClick={() => !disableSubmit && handleSubmit()}
          >
            Submit
          </button>
        </Tooltip>
      </div>
      {loading && <FullScreenLoader />}
      <Dialog
        open={success}
        onClose={() => router.push(`/projects/${projectId}`)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        className='px-5 md:p-0 errorDialogue'
      >
        <div className='my-auto flex flex-col gap-3 items-center p-8'>
          <div className='f-modal-alert'>
            <div className='p-6 lg:p-10 border-[2px] lg:border-[5px] border-primary rounded-full relative'>
              <Image
                src={WalletIcon}
                alt='wallet icon'
                className='w-10 h-10 lg:w-24 lg:h-24'
              />
            </div>
          </div>
          <div className='my-2 lg:my-4'>
            <p className='text-center text-lg lg:text-3xl text-content'>
              Grant Created Successfully
            </p>
          </div>

          <CopyToClipboard text={escrowAddress}>
            <div className='flex flex-row gap-4 items-center rounded-[10px] border border-solid border-light-grey p-4 lg:p-6 text-xl text-content'>
              <IconButton onClick={() => copyAddress()}>
                <FaRegCopy className='text-content' />
              </IconButton>
              <span className='text-sm lg:text-base break-all'>
                {escrowAddress}
              </span>
            </div>
          </CopyToClipboard>
          <div className='my-6 text-content text-sm lg:text-lg text-center'>
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
          className={`absolute right-4 top-4 z-10 transform duration-300 transition-all ${copied ? 'flex' : 'hidden'
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

export { getServerSideProps };

export default GrantApplication;
