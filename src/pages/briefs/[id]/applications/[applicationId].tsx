/* eslint-disable react-hooks/exhaustive-deps */
import { Backdrop, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FiEdit, FiPlusCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { fetchProject, fetchUser } from '@/utils';

import ApplicationOwnerHeader from '@/components/Application/ApplicationOwnerHeader';
import BriefOwnerHeader from '@/components/Application/BriefOwnerHeader';
import { BriefInsights } from '@/components/Briefs/BriefInsights';
import ChatPopup from '@/components/ChatPopup';
import ErrorScreen from '@/components/ErrorScreen';
import Login from '@/components/Login';
import SuccessScreen from '@/components/SuccessScreen';

import * as config from '@/config';
import { timeData } from '@/config/briefs-data';
import {
  Brief,
  Currency,
  Freelancer,
  OffchainProjectState,
  Project,
  User,
} from '@/model';
import {
  changeBriefApplicationStatus as updateBriefApplicationStatus,
  getBrief,
} from '@/redux/services/briefService';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

interface MilestoneItem {
  name: string;
  amount: number | undefined;
}

export type ApplicationPreviewProps = {
  brief: Brief;
  user: User;
  application: Project;
  freelancer: Freelancer;
};

const ApplicationPreview = (): JSX.Element => {
  const [brief, setBrief] = useState<Brief | any>();
  const { user } = useSelector((state: RootState) => state.userState)
  const [application, setApplication] = useState<Project | any>();
  const [freelancer, setFreelancer] = useState<Freelancer | any>();
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [currencyId, setCurrencyId] = useState(application?.currency_id);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [briefOwner, setBriefOwner] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  const isApplicationOwner =
    user && application && user?.id == application?.user_id;
  const isBriefOwner = user && brief && user?.id == brief?.user_id;

  const [error, setError] = useState<any>();
  const [success, setSuccess] = useState<boolean>(false);
  const [openAccountChoice, setOpenAccountChoice] = useState<boolean>(false);

  const router = useRouter();
  const { id: briefId, applicationId }: any = router.query;

  useEffect(() => {
    const getSetUpData = async () => {
      try {
        const brief: Brief | undefined = await getBrief(briefId);
        const applicationResponse = await fetchProject(applicationId);

        const freelancerUser = await fetchUser(
          Number(applicationResponse?.user_id)
        );
        const freelancerResponse = await getFreelancerProfile(
          freelancerUser?.username
        );

        setBrief(brief);
        setApplication(applicationResponse);
        setFreelancer(freelancerResponse);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (briefId && applicationId) {
      getSetUpData();
    }
  }, [briefId, applicationId]);

  useEffect(() => {
    async function setup() {
      if (brief) {
        setLoading(true);
        const briefOwner: User = await fetchUser(brief?.user_id);
        setLoading(false);
        setBriefOwner(briefOwner);
      }
    }
    setup();
  }, [brief, freelancer]);

  const viewFullBrief = () => {
    router.push(`/briefs/${brief?.id}/`);
  };

  const updateProject = async (chainProjectId?: number) => {
    setLoading(true);
    try {
      const resp = await fetch(`${config.apiBase}/project/${application.id}`, {
        headers: config.postAPIHeaders,
        method: 'put',
        body: JSON.stringify({
          user_id: user.id,
          name: `${brief.headline}`,
          total_cost_without_fee: totalCostWithoutFee,
          imbue_fee: imbueFee,
          currency_id: currencyId,
          milestones: milestones
            .filter((m) => m.amount !== undefined)
            .map((m) => {
              return {
                name: m.name,
                amount: m.amount,
                percentage_to_unlock: (
                  ((m.amount ?? 0) / totalCostWithoutFee) *
                  100
                ).toFixed(0),
              };
            }),
          required_funds: totalCost,
          chain_project_id: chainProjectId,
        }),
      });

      if (resp.status === 201 || resp.status === 200) {
        setSuccess(true);
        setIsEditingBio(false);
      } else {
        setError({ message: `${resp.status} ${resp.statusText}` });
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplication = application?.milestones
    ?.filter?.((m: any) => m?.amount !== undefined)
    ?.map?.((m: any) => {
      return { name: m?.name, amount: Number(m?.amount) };
    });

  const imbueFeePercentage = 5;
  const applicationMilestones = application ? filteredApplication : [];

  const [milestones, setMilestones] = useState<MilestoneItem[]>(
    applicationMilestones
  );

  useEffect(() => {
    setMilestones(applicationMilestones);
  }, [application]);

  const currencies = Object.keys(Currency).filter(
    (key: any) => !isNaN(Number(Currency[key]))
  );

  const durationOptions = timeData.sort((a, b) =>
    a.value > b.value ? 1 : a.value < b.value ? -1 : 0
  );

  const totalCostWithoutFee = milestones?.reduce?.(
    (acc, { amount }) => acc + (amount ?? 0),
    0
  );

  const imbueFee = (totalCostWithoutFee * imbueFeePercentage) / 100;
  const totalCost = imbueFee + totalCostWithoutFee;
  const onAddMilestone = () => {
    setMilestones([...milestones, { name: '', amount: undefined }]);
  };

  const onRemoveMilestone = (index: number) => {
    const newMilestones = [...milestones];
    newMilestones.splice(index, 1);
    setMilestones(newMilestones);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyId(Number(event.target.value));
  };

  const handleMessageBoxClick = async (userId: number) => {
    if (userId) {
      setShowMessageBox(true);
      setTargetUser(await fetchUser(userId));
    } else {
      setLoginModal(true);
    }
  };

  const updateApplicationState = async (
    application: any,
    projectStatus: OffchainProjectState
  ) => {
    await updateBriefApplicationStatus(
      application?.brief_id,
      application?.id,
      projectStatus
    );
    window.location.reload();
  };

  const totalPercent = milestones.reduce((sum, { amount }) => {
    const percent = Number(
      ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
    );
    return sum + percent;
  }, 0);

  const allAmountAndNamesHaveValue = () => {
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
    return true;
  };

  const milestoneAmountsAndNamesHaveValue = allAmountAndNamesHaveValue();

  return (
    <div>
      <div className='application-container hq-layout px-4 mt-3 lg:mt-0 lg:px-0'>
        {user && showMessageBox && (
          <ChatPopup
            {...{
              showMessageBox,
              setShowMessageBox,
              browsingUser: user,
              targetUser,
            }}
          />
        )}

        {isBriefOwner && (
          <BriefOwnerHeader
            {...{
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
            }}
          />
        )}

        {isApplicationOwner && (
          <ApplicationOwnerHeader
            {...{
              briefOwner,
              brief,
              handleMessageBoxClick,
              freelancer,
              application,
              setLoading,
              updateProject,
              user,
            }}
          />
        )}

        {/* loading screen while connecting to wallet*/}
        <Backdrop sx={{ color: '#fff', zIndex: 5 }} open={loading}>
          <CircularProgress color='inherit' />
        </Backdrop>

        {
          <div>
            <h3 className='ml-[2rem] mb-[0.5rem] text-xl leading-[1.5] font-bold m-0 p-0  flex'>
              Job description
            </h3>
            {brief && <BriefInsights brief={brief} />}
          </div>
        }
        <div>
          <div className='w-full flex flex-col bg-theme-grey-dark border border-light-white rounded-2xl py-4 lg:py-5 '>
            <div className='flex flex-row justify-between mx-5 lg:mx-14'>
              <h3 className='flex text-lg lg:text-xl leading-[1.5] font-bold m-0 p-0 mb-5'>
                Milestones
                {!isEditingBio && isApplicationOwner && (
                  <div
                    className='ml-[10px] relative top-[-2px]'
                    onClick={() => setIsEditingBio(true)}
                  >
                    <FiEdit />
                  </div>
                )}
              </h3>
              <h3 className='flex text-lg lg:text-xl leading-[1.5] font-bold m-0 p-0'>
                Client&apos;s budget: ${Number(brief?.budget).toLocaleString()}
              </h3>
            </div>

            {isEditingBio && (
              <p className='px-5 lg:px-14 lg:text-xl font-bold border-t border-t-light-white py-5'>
                How many milestone do you want to include?
              </p>
            )}
            <div className='milestone-list lg:mb-5'>
              {milestones?.map?.(({ name, amount }, index) => {
                const percent = Number(
                  ((100 * (amount ?? 0)) / totalCostWithoutFee)?.toFixed?.(0)
                );
                return (
                  <div
                    className='flex flex-row items-start w-full border-t border-t-light-white last:border-b-0 px-5 py-9 lg:px-14 relative'
                    key={index}
                  >
                    {isEditingBio && (
                      <span
                        onClick={() => onRemoveMilestone(index)}
                        className='absolute top-1 right-2 lg:right-4 text-sm lg:text-xl text-light-grey font-bold hover:border-red-500 hover:text-red-500 cursor-pointer'
                      >
                        x
                      </span>
                    )}
                    <div className='mr-4 lg:mr-9 text-lg'>{index + 1}.</div>
                    <div className='flex flex-row justify-between w-full'>
                      <div className='w-3/5 lg:w-1/2'>
                        <h3 className='mb-2 lg:mb-5 text-base lg:text-xl font-bold m-0 p-0'>
                          Description
                        </h3>
                        {isEditingBio ? (
                          <textarea
                            className='input-description'
                            value={name}
                            disabled={!isEditingBio}
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
                        ) : (
                          <p className='text-base text-[#ebeae2] m-0'>
                            {milestones[index]?.name}
                          </p>
                        )}
                      </div>
                      <div className='flex flex-col w-1/3 lg:w-1/5 items-end'>
                        <h3 className='mb-2 lg:mb-5 text-right text-base lg:text-xl font-bold m-0 p-0'>
                          Amount
                        </h3>
                        {isEditingBio ? (
                          <input
                            type='number'
                            className='input-budget'
                            disabled={!isEditingBio}
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
                        ) : (
                          <p className='text-base text-[#ebeae2] m-0'>
                            {milestones[index]?.amount}
                          </p>
                        )}

                        {totalCostWithoutFee !== 0 && isEditingBio && (
                          <div className='flex flex-col items-end mt-[auto] gap-[8px] w-full'>
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
                );
              })}
            </div>
            {isEditingBio && (
              <h4
                className='clickable-text btn-add-milestone mx-5 lg:mx-14 lg:text-2xl'
                onClick={onAddMilestone}
              >
                <FiPlusCircle color='var(--theme-primary)' />
                Add milestone
              </h4>
            )}
          </div>
        </div>

        <div className='w-full bg-theme-grey-dark border border-light-white rounded-[20px] py-[20px]'>
          <p className='mx-5 lg:mx-14 mb-4 text-xl font-bold'>Costs</p>
          <hr className='separator' />

          <div className='flex flex-row items-center mb-[20px] mx-5 lg:mx-14 mt-7'>
            <div className='flex flex-col flex-grow'>
              <h3 className='text-lg lg:text-xl font-bold m-0 p-0'>
                Total price of the project
              </h3>
              <div className='text-sm lg:text-base text-inactive'>
                This includes all milestones, and is the amount client will see
              </div>
            </div>
            <div className='budget-value'>
              ${Number(totalCostWithoutFee?.toFixed?.(2)).toLocaleString()}
            </div>
          </div>

          <div className='flex flex-row items-center mb-[20px] mx-5 lg:mx-14'>
            <div className='flex flex-col flex-grow'>
              <h3 className='text-lg lg:text-xl font-bold m-0 p-0'>
                Imbue Service Fee 5%
              </h3>
            </div>
            <div className='budget-value'>
              ${Number(imbueFee?.toFixed?.(2))?.toLocaleString?.()}
            </div>
          </div>

          <div className='flex flex-row items-center mb-[20px] mx-5 lg:mx-14'>
            <div className='flex flex-col flex-grow'>
              <h3 className='text-lg lg:text-xl font-bold m-0 p-0'>Total</h3>
            </div>
            <div className='budget-value'>
              ${Number(totalCost.toFixed(2))?.toLocaleString?.()}
            </div>
          </div>
        </div>

        <div>
          <h3 className='lg:ml-[2rem] mb-[0.5rem] text-xl font-bold m-0 p-0 flex'>
            Payment terms
          </h3>
          <div className='bg-theme-grey-dark border lg:flex-row border-light-white px-5 py-5 rounded-[20px] payment-details lg:px-14'>
            <div className='duration-selector'>
              <h3 className='text-xl font-bold m-0 p-0'>
                How long will this project take?
              </h3>
              <select
                className='bg-[#1a1a19] border border-light-white rounded-[5px] text-base px-[20px] py-[10px] mt-4 round'
                name='duration'
                placeholder='Select a duration'
                required
                disabled={!isEditingBio}
              >
                {durationOptions.map(({ label, value }, index) => (
                  <option value={value} key={index} className='duration-option'>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className='payment-options mt-5 lg:mt-0'>
              <h3 className='text-xl font-bold m-0 p-0 lg:self-end'>
                Currency
              </h3>
              <div className='network-amount'>
                <select
                  name='currencyId'
                  onChange={handleChange}
                  className='bg-[#1a1a19] round border border-light-white rounded-[5px] text-base px-[20px] py-[10px] mt-4'
                  placeholder='Select a currency'
                  disabled={!isEditingBio}
                  defaultValue={Number(application?.currency_id) || 0}
                  required
                >
                  {currencies.map((currency, index) => (
                    <option
                      value={index}
                      key={index}
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

        <div className='buttons-container'>
          <button
            className='primary-btn in-dark w-button'
            onClick={() => viewFullBrief()}
          >
            Back To Brief
          </button>
          {isEditingBio && (
            <button
              className='primary-btn in-dark w-button'
              disabled={
                totalPercent !== 100 || !milestoneAmountsAndNamesHaveValue
              }
              onClick={() => updateProject()}
            >
              Update
            </button>
          )}

          {/* TODO: Add Drafts Functionality */}
          {/* <button className="secondary-btn">Save draft</button> */}
        </div>
      </div>
      <Login
        visible={loginModal}
        setVisible={(val) => {
          setLoginModal(val);
        }}
        redirectUrl={router.pathname}
      />

      <SuccessScreen
        title={'You have successfully updated this brief'}
        open={success}
        setOpen={() => setSuccess(false)}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => setSuccess(false)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Continue
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

export default ApplicationPreview;
