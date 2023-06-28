import { Dialog, IconButton } from '@mui/material';
import { blake2AsHex } from '@polkadot/util-crypto';
import WalletIcon from '@svgs/wallet.svg';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FaRegCopy } from 'react-icons/fa';
import { FiPlusCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { getCurrentUser } from '@/utils';
import { initImbueAPIInfo } from '@/utils/polkadot';

import AccountChoice from '@/components/AccountChoice';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';

import * as config from '@/config';
import { timeData } from '@/config/briefs-data';
import { Currency } from '@/model';
import ChainService from '@/redux/services/chainService';
import { RootState } from '@/redux/store/store';


interface MilestoneItem {
  name: string;
  amount: number | undefined;
}

const GrantApplication = (): JSX.Element => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [approvers, setApprovers] = useState<string[]>([]);
  const [newApprover, setNewApprover] = useState<string>();
  const [currencyId, setCurrencyId] = useState<number>(0);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { name: '', amount: undefined },
  ]);
  const [durationId, setDurationId] = useState(0);
  const [success, setSuccess] = useState(false);
  const [projectId, setProjectId] = useState<number>();
  // FIXME:
  const [onChainAddress, _setOnChainAddress] = useState(
    '0x524c3d9e935649A448FA33666048C'
  );

  const { user } = useSelector((state: RootState) => state.userState);
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);

  const durationOptions = timeData.sort((a, b) =>
    a.value > b.value ? 1 : a.value < b.value ? -1 : 0
  );

  const currencies = Object.keys(Currency).filter(
    (key: any) => !isNaN(Number(Currency[key]))
  );

  const onAddApprover = () => {
    if (!newApprover) return;
    setApprovers([...approvers, newApprover]);
    setNewApprover('');
  };

  const imbueFeePercentage = 5;
  const totalCostWithoutFee = milestones.reduce(
    (acc, { amount }) => acc + (amount ?? 0),
    0
  );
  const imbueFee = (totalCostWithoutFee * imbueFeePercentage) / 100;
  const totalCost = imbueFee + totalCostWithoutFee;

  const onAddMilestone = () => {
    setMilestones([...milestones, { name: '', amount: undefined }]);
  };

  const onRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;

    const newMilestones = [...milestones];
    newMilestones.splice(index, 1);
    setMilestones(newMilestones);
  };

  const removeApprover = (index: number) => {
    if (approvers.length === 0) return;
    const newApprovers = [...approvers];
    newApprovers.splice(index, 1);
    setApprovers(newApprovers);
  };

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

  const submitGrant = async (account : WalletAccount) => {
    // TODO: Submit a grant
    setLoading(true);

    try {
      const user_id = (await getCurrentUser())?.id;
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user)
      const grant = {
        title,
        description,
        duration_id: durationId, // TODO:
        required_funds: totalCost,
        currency_id: currencyId,
        user_id,
        total_cost_without_fee: totalCostWithoutFee,
        imbue_fee: imbueFee,
        chain_project_id: 0, // TODO:
        milestones: milestones.map((milestone) => ({
          ...milestone,
          percentage_to_unlock: Math.floor(
            100 * ((milestone.amount ?? 0) / totalCostWithoutFee)
          ),
        })),
        approvers,
      }
      
      const grant_id = blake2AsHex(JSON.stringify(grant));

      if (!account) return
      const res = await chainService.submitInitialGrant(account, milestones, approvers, currencyId, totalCost, "Kusama", grant_id)
      console.log(res);
      
      const resp = await fetch(`${config.apiBase}grants`, {
        headers: config.postAPIHeaders,
        method: 'post',
        body: JSON.stringify(grant),
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
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-10 leading-[1.5] hq-layout !mx-3 lg:!mx-auto'>
      <div className='rounded-[20px] border border-solid border-white bg-theme-grey-dark'>
        <div className='px-12 py-5 text-[20px] text-white border-b border-white'>
          Grant description
        </div>
        <div className='px-12 py-8 text-base leading-[1.2]'>
          <div className='flex justify-between'>
            <div className='flex flex-col gap-8 w-3/5'>
              <div className='flex flex-col gap-4'>
                <div>Title</div>
                <input
                  value={title}
                  placeholder='Input title'
                  onChange={(e) => setTitle(e.target.value)}
                  className='bg-[#1a1a18] border border-solid border-white rounded-[5px] p-3'
                />
              </div>
              <div className='flex flex-col gap-4'>
                <div>Description</div>
                <textarea
                  maxLength={500}
                  value={description}
                  placeholder='Input description'
                  onChange={(e) => setDescription(e.target.value)}
                  className='border border-solid border-white bg-[#1a1a19] min-h-[160px] p-3'
                />
                <div className='text-[rgba(235, 234, 226, 0.70)]'>{`${description?.length || 0
                  }/300`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='rounded-[20px] border border-solid border-white bg-theme-grey-dark'>
        <div className='flex justify-between text-[20px] text-white px-12 py-5 border-b border-white'>
          <div>Approvers</div>
          <div>{`Total grant: ${totalCost} ${currencies[currencyId]}`}</div>
        </div>
        <div className='flex justify-between px-12 py-8 text-base leading-[1.2]  border border-solid border-b-white items-start'>
          <div className='flex flex-col gap-8'>
            <div className='flex flex-row gap-4 w-[480px] items-center'>
              <input
                value={newApprover || ''}
                placeholder='Input address of an approver'
                onChange={(e) => setNewApprover(e.target.value)}
                className='bg-[#1a1a18] border border-solid border-white rounded-[5px] p-3 flex-grow h-fit'
              />
              <div
                className='flex flex-row items-center gap-2 clickable-text cursor-pointer active:scale-105 origin-top-left'
                onClick={onAddApprover}
              >
                <FiPlusCircle color='var(--theme-primary)' />
                Add approver
              </div>
            </div>
            <div className='flex flex-col gap-4'>
              {approvers.map((approver, index) => (
                <div key={index} className='flex flex-row justify-between'>
                  <span>{approver}</span>
                  <span
                    className='text-light-grey font-bold hover:border-red-500 hover:text-red-500 cursor-pointer'
                    onClick={() => removeApprover(index)}
                  >
                    x
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            <div>
              <h3 className='text-lg lg:text-xl font-bold m-0 p-0'>
                How long will this project take?
              </h3>
              <select
                name='duration'
                value={durationId}
                onChange={(e) => setDurationId(Number(e.target.value))}
                className='bg-[#1a1a19] round border border-white rounded-[5px] text-base px-5 py-3 mt-4 w-full'
                placeholder='Select a duration'
                required
              >
                {durationOptions.map(({ label, value }, index) => (
                  <option value={value} key={index} className='duration-option'>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h3 className='text-lg lg:text-xl font-bold m-0 p-0'>Currency</h3>
              <div>
                <select
                  name='currencyId'
                  value={currencyId}
                  onChange={(e) => setCurrencyId(Number(e.target.value))}
                  placeholder='Select a currency'
                  className='bg-[#1a1a19] round border border-white rounded-[5px] text-base px-5 py-3 mt-4 w-full'
                  required
                >
                  {currencies.map((currency: any) => (
                    <option
                      value={Currency[currency]}
                      key={Currency[currency]}
                      className='duration-option'
                    >
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col px-7 py-5'>
          <div className='text-[20px] text-white ml-5 mb-8'>Milestones</div>
          <div className='flex flex-col gap-4'>
            {milestones.map(({ name, amount }, index) => {
              const percent = Number(
                ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
              );
              return (
                <div key={index} className='flex flex-col gap-0'>
                  <div className='flex flex-row relative'>
                    <span
                      onClick={() => onRemoveMilestone(index)}
                      className='absolute top-0 right-2 text-sm lg:text-xl text-light-grey font-bold hover:border-red-500 hover:text-red-500 cursor-pointer'
                    >
                      x
                    </span>
                    <div className='text-base mr-4 lg:mr-9'>{index + 1}.</div>
                    <div className='flex flex-row justify-between w-full'>
                      <div className='w-3/5'>
                        <h3 className='mb-2 lg:mb-5 text-base lg:text-xl font-bold m-0 p-0'>
                          Description
                        </h3>
                        <textarea
                          className='input-description text-base'
                          value={name}
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
                      </div>
                      <div className='flex flex-col w-4/12'>
                        <h3 className='mb-2 lg:mb-5 text-base lg:text-xl font-bold m-0 p-0'>
                          Amount
                        </h3>
                        <input
                          type='number'
                          className='input-budget bg-[#1a1a19] border border-white text-base leading-5 rounded-[5px] py-3 px-5'
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
                            <div className='progress-value text-base'>
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
                    <hr className='mx-4 my-4 text-white' />
                  )}
                </div>
              );
            })}
          </div>
          <div
            className='clickable-text btn-add-milestone mx-5 mt-8 lg:mx-14 !mb-0 text-base lg:text-xl font-bold'
            onClick={onAddMilestone}
          >
            <FiPlusCircle color='var(--theme-primary)' />
            Add milestone
          </div>

          <div className='mx-4'>
            <hr className='my-6 text-white' />

            <div className='flex flex-row items-center mb-5'>
              <div className='flex flex-col flex-grow'>
                <h3 className='text-lg lg:text-xl font-bold m-0 p-0'>
                  Requested budget
                </h3>
              </div>
              <div className='budget-value'>
                {`${Number(totalCostWithoutFee.toFixed(2)).toLocaleString()} ${currencies[currencyId]
                  }`}
              </div>
            </div>

            <hr className='my-6 text-white' />

            <div className='flex flex-row items-center mb-5'>
              <div className='flex flex-col flex-grow'>
                <h3 className='text-lg lg:text-xl font-bold m-0 p-0'>
                  Imbue Service Fee 5% - Learn more about Imbue’s fees
                </h3>
              </div>
              <div className='budget-value'>
                {`${Number(imbueFee.toFixed(2)).toLocaleString()} ${currencies[currencyId]
                  }`}
              </div>
            </div>

            <hr className='my-6 text-white' />

            <div className='flex flex-row items-center mb-5'>
              <div className='flex flex-col flex-grow'>
                <h3 className='text-lg lg:text-xl font-bold m-0 p-0'>Total</h3>
              </div>
              <div className='budget-value'>
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

          <CopyToClipboard text={onChainAddress}>
            <div className='flex flex-row gap-4 items-center rounded-[10px] border border-solid border-light-grey py-8 px-6 text-xl text-white'>
              <IconButton>
                <FaRegCopy className='text-white' />
              </IconButton>
              <span>{onChainAddress}</span>
            </div>
          </CopyToClipboard>
          <div className='mt-6 mb-12 text-white text-lg text-center'>
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
