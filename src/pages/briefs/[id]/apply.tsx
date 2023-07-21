/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import AccountChoice from '@/components/AccountChoice';
import { BriefInsights } from '@/components/Briefs/BriefInsights';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import SuccessScreen from '@/components/SuccessScreen';

import { dollarIcon } from '@/assets/svgs';
import * as config from '@/config';
import { timeData } from '@/config/briefs-data';
import { Brief, Currency, Freelancer } from '@/model';
import { getBrief } from '@/redux/services/briefService';
import { getFreelancerBrief } from '@/redux/services/briefService';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import { selectAccount } from '@/redux/services/polkadotService';
import { RootState } from '@/redux/store/store';

interface MilestoneItem {
  name: string;
  amount: number | undefined;
  description: string;
}

export const SubmitProposal = (): JSX.Element => {
  const [currencyId, setCurrencyId] = useState(0);
  const [durationId, setDurationId] = useState(0);
  const [brief, setBrief] = useState<Brief | any>();
  // const [user, setUser] = useState<User>();
  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  // FIXME: freelancer
  const [_freelancer, setFreelancer] = useState<Freelancer>();
  // const userHasWeb3Addresss = !!user?.web3_address;
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const briefId: any = router?.query?.id || 0;

  const [applicationId, setapplicationId] = useState();
  const [error, setError] = useState<any>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(applicationId ? true : false);
  }, [applicationId]);

  useEffect(() => {
    !loadingUser && getUserAndFreelancer();
  }, [briefId, user?.username, loadingUser]);

  useEffect(() => {
    router?.isReady && getCurrentUserBrief();
  }, [user, router.isReady]);

  const getUserAndFreelancer = async () => {
    const freelancer = await getFreelancerProfile(user?.username);
    if (!freelancer?.id) redirectToBreif();
    setFreelancer(freelancer);

    const userApplication: any = await getFreelancerBrief(user?.id, briefId);
    if (userApplication) {
      router.push(`/briefs/${briefId}/applications/${userApplication?.id}/`);
    }
  };

  const getCurrentUserBrief = async () => {
    if (briefId && user) {
      setLoading(true);
      try {
        const briefResponse: Brief | undefined = await getBrief(briefId);
        if (briefResponse?.user_id === user.id) redirectToBreif();
        setBrief(briefResponse);
      } catch (error) {
        setError({ message: 'could not find brief' });
      } finally {
        setLoading(false);
      }
    }
  };

  const redirectToBreif = () => {
    router.push(`/briefs/${briefId}`);
  };

  const currencies = Object.keys(Currency).filter(
    (key: any) => !isNaN(Number(Currency[key]))
  );
  const imbueFeePercentage = 5;

  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { name: '', amount: undefined, description: '' },
  ]);

  const durationOptions = timeData.sort((a, b) =>
    a.value > b.value ? 1 : a.value < b.value ? -1 : 0
  );

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
    const newMilestones = [...milestones];
    newMilestones.splice(index, 1);
    setMilestones(newMilestones);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyId(Number(event.target.value));
  };

  const handleSelectAccount = async (account: WalletAccount) => {
    try {
      setLoading(true);
      await selectAccount(account);
      await insertProject();
    } catch (error) {
      setError({ message: error });
    } finally {
      setLoading(false);
      setShowPolkadotAccounts(false);
    }
  };

  async function handleSubmit() {
    if (!user?.web3_address) {
      setShowPolkadotAccounts(true);
    } else {
      await insertProject();
    }
  }

  async function insertProject() {
    //TODO: validate all milestone sum up to 100%
    setLoading(true);
    try {
      const resp = await fetch(`${config.apiBase}/project`, {
        headers: config.postAPIHeaders,
        method: 'post',
        body: JSON.stringify({
          user_id: user?.id,
          name: `Brief Application: ${brief?.headline}`,
          brief_id: brief?.id,
          total_cost_without_fee: totalCostWithoutFee,
          imbue_fee: imbueFee,
          currency_id: currencyId,
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
          required_funds: totalCost,
          duration_id: durationId,
          description: brief?.description,
        }),
      });

      if (resp.ok) {
        const applicationId = (await resp.json()).id;
        applicationId && setapplicationId(applicationId);
      } else {
        setError({ message: 'Failed to submit the proposal' });
      }
    } catch (error) {
      setError({ message: error });
    } finally {
      setLoading(false);
    }
  }

  const totalPercent = milestones.reduce((sum, { amount }) => {
    const percent = Number(
      ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
    );
    return sum + percent;
  }, 0);

  const allAmountAndNamesHaveValue = () => {
    for (let i = 0; i < milestones.length; i++) {
      const { amount, name, description } = milestones[i];

      if (
        amount === undefined ||
        amount === null ||
        amount === 0 ||
        name === undefined ||
        name === null ||
        name.length === 0 ||
        description === undefined ||
        description === null ||
        description.length === 0
      ) {
        return false;
      }
    }

    return true;
  };

  const milestoneAmountsAndNamesHaveValue = allAmountAndNamesHaveValue();

  if (loadingUser || loading) <FullScreenLoader />;

  return (
    <div className='flex flex-col gap-10 text-base leading-[1.5] !mx-3 lg:!mx-auto'>
      <div className='bg-white rounded-[20px]'>
        <h3 className='ml-4 lg:ml-[3rem] text-xl leading-[1.5] m-0 p-0  mt-[1.2rem] flex text-imbue-purple-dark font-normal'>
          Job description
        </h3>
        {brief && <BriefInsights brief={brief} />}
      </div>

      <div className='milestones border border-white py-[2rem] rounded-[20px] bg-white'>
        <div className='flex flex-row justify-between mx-5 lg:mx-14 -mb-3'>
          <h3 className='text-lg lg:text-[1.25rem] leading-[1.5] text-imbue-purple-dark font-normal m-0 p-0 flex'>
            Milestones
          </h3>
          <h3 className='text-lg lg:text-[1.25rem] text-imbue-light-purple-two leading-[1.5] font-normal m-0 p-0'>
            Client&apos;s budget:{' '}
            <span className=' text-imbue-purple-dark text-lg lg:text-[1.25rem]'>
              ${Number(brief?.budget)?.toLocaleString()}
            </span>
          </h3>
        </div>

        <hr className='h-[1px] bg-[rgba(3, 17, 106, 0.12)] w-full mt-4' />

        <div className='milestone-list !gap-0'>
          {milestones.map(({ name, amount, description }, index) => {
            const percent = Number(
              ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
            );
            return (
              <div
                className='milestone-row !px-4 !py-7 !m-0 lg:!px-14 relative border-t border-light-white border-b border-b-[#03116A1F]'
                key={index}
              >
                <span
                  onClick={() => onRemoveMilestone(index)}
                  className='absolute top-1 right-2 lg:right-4 text-sm lg:text-xl font-bold hover:border-red-500 text-red-500 cursor-pointer'
                >
                  x
                </span>
                <div className='text-base mr-4 lg:mr-9 text-imbue-purple-dark font-normal'>
                  {index + 1}.
                </div>
                <div className='flex flex-row justify-between w-full'>
                  <div className='lg:w-2/5 w-3/5'>
                    <h3 className=' text-base lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                      Title
                    </h3>

                    <input
                      type='text'
                      data-testid={`milestone-title-${index}`}
                      className='input-budget text-base rounded-md py-3 px-5 text-imbue-purple text-left mb-8 placeholder:text-imbue-light-purple'
                      placeholder='Add milestone name here'
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

                    <h3 className='mb-2 lg:mb-5 text-base lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                      Description
                    </h3>
                    <textarea
                      placeholder='Add milestone description here'
                      className='input-description text-base placeholder:text-imbue-light-purple'
                      data-testid={`milestone-description-${index}`}
                      value={description}
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

                  <div className='flex flex-col lg:w-3/12 w-4/12 lg:items-start lg:mt-[-0.5rem]'>
                    <h3 className=' text-base lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                      Amount
                    </h3>

                    <div className='w-full relative p-0 m-0'>
                      <Image
                        src={dollarIcon}
                        alt='dollar icon'
                        height={12}
                        width={12}
                        className='h-fit absolute left-2 bottom-3'
                      />
                      <input
                        type='number'
                        data-testid={`milestone-amount-${index}`}
                        placeholder='Add an amount'
                        className='input-budget text-base rounded-[5px] py-3 px-5 text-imbue-purple text-right placeholder:text-imbue-light-purple'
                        value={amount || ''}
                        onChange={(e) => {
                          if (Number(e.target.value) >= 0)
                            setMilestones([
                              ...milestones.slice(0, index),
                              {
                                ...milestones[index],
                                amount: Number(e.target.value),
                              },
                              ...milestones.slice(index + 1),
                            ]);
                        }}
                      />
                    </div>
                    {totalCostWithoutFee !== 0 && (
                      <div className='flex flex-col items-end mt-3 gap-2 w-full'>
                        <div className='progress-value text-base !text-imbue-purple-dark'>
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
            );
          })}
        </div>

        <p
          typeof='button'
          className='clickable-text btn-add-milestone mx-5 lg:mx-14 !mb-0 text-base lg:text-xl font-bold !text-imbue-lemon'
          onClick={onAddMilestone}
        >
          <FiPlusCircle color='#7AA822' />
          Add milestone
        </p>

        <div className='bg-imbue-light-purple-three lg:mt-[5rem] p-[1.5rem] rounded-[0.5rem] mx-[1rem] lg:mx-[3rem]'>
          <div className='flex flex-row items-center mb-5'>
            <div className='flex flex-col flex-grow'>
              <h3 className='text-lg lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                Total price of the project
              </h3>
              <div className='text-inactive text-sm !font-normal lg:text-[1rem] !text-imbue-light-purple-two'>
                This includes all milestonees, and is the amount client will see
              </div>
            </div>
            <div className='budget-value text-[1.25rem] text-imbue-purple-dark font-normal'>
              ${Number(totalCostWithoutFee.toFixed(2)).toLocaleString()}
            </div>
          </div>

          <div className='flex flex-row items-center mb-5'>
            <div className='flex flex-col flex-grow'>
              <h3 className='text-lg lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                Imbue Service Fee 5% - Learn more about Imbue’s fees
              </h3>
            </div>
            <div className='budget-value text-[1.25rem] text-imbue-purple-dark font-normal'>
              ${Number(imbueFee.toFixed(2)).toLocaleString()}
            </div>
          </div>

          <div className='flex flex-row items-center mb-5'>
            <div className='flex flex-col flex-grow'>
              <h3 className='text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                Total
              </h3>
            </div>
            <div className='budget-value text-[1.25rem] text-imbue-light-purple-two font-normal'>
              ${Number(totalCost.toFixed(2)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-[20px] py-[1.5rem]'>
        <h3 className='ml-4 mb-2 text-[1.25rem] text-imbue-purple-dark font-normal m-0 p-0 flex'>
          Payment terms
        </h3>

        <hr className='h-[1px] bg-[rgba(3, 17, 106, 0.12)] w-full mt-4' />

        <div className='bg-white pt-5 rounded-[20px] flex flex-col lg:flex-row lg:justify-between gap-3 px-5'>
          <div className='duration-selector'>
            <h3 className='text-lg lg:text-[1.25rem] font-normal m-0 p-0 text-imbue-purple-dark'>
              How long will this project take?
            </h3>
            <select
              name='duration'
              className='bg-white outline-none round border border-imbue-purple rounded-[0.5rem] text-base px-5 mt-4 h-[2.75rem] text-imbue-purple-dark'
              placeholder='Select a duration'
              required
              onChange={(e) => setDurationId(Number(e.target.value))}
              value={durationId}
            >
              {durationOptions.map(({ label, value }, index) => (
                <option value={value} key={index} className='duration-option'>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className='payment-options'>
            <h3 className='text-lg lg:text-[1.25rem] font-normal m-0 p-0 text-imbue-purple-dark'>
              Currency
            </h3>

            <div className='network-amount'>
              <select
                name='currencyId'
                onChange={handleChange}
                placeholder='Select a currency'
                className='bg-white outline-none round border border-imbue-purple rounded-[0.5rem] text-base px-5 mt-4 h-[2.75rem] text-imbue-purple-dark'
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

      <div className='mt-[0.5rem] mb-[0.5rem] bg-white rounded-2xl w-full p-[1rem] flex items-center justify-between   self-center'>
        <div className='buttons-container'>
          <button
            disabled={
              totalPercent !== 100 || !milestoneAmountsAndNamesHaveValue
            }
            className='primary-btn in-dark w-button hover:!bg-imbue-purple hover:!text-white'
            onClick={() => handleSubmit()}
          >
            Submit
          </button>
          {/* TODO: Add Drafts Functionality */}
          {/* <button className="secondary-btn">Save draft</button> */}
        </div>
      </div>
      <AccountChoice
        accountSelected={(account: WalletAccount) =>
          handleSelectAccount(account)
        }
        visible={showPolkadotAccounts}
        setVisible={setShowPolkadotAccounts}
      />
      {loading && <FullScreenLoader />}
      <SuccessScreen
        title={'You have successfully applied for this brief'}
        open={open}
        setOpen={setOpen}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() =>
              router.push(`/briefs/${brief?.id}/applications/${applicationId}/`)
            }
            className='primary-btn in-dark w-button w-full !m-0'
          >
            See Application
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </SuccessScreen>

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

export default SubmitProposal;
