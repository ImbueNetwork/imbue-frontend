/* eslint-disable react-hooks/exhaustive-deps */
import { Tooltip } from '@mui/material';
import Filter from 'bad-words';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { FiEdit, FiPlusCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { fetchProject, fetchUser } from '@/utils';
import {
  handleApplicationInput,
  validateApplicationInput,
} from '@/utils/helper';

import ApplicationOwnerHeader from '@/components/Application/ApplicationOwnerHeader';
const BriefOwnerHeader = dynamic(
  () => import('@/components/Application/BriefOwnerHeader')
);

import { BriefInsights } from '@/components/Briefs/BriefInsights';
import ChatPopup from '@/components/ChatPopup';
import ErrorScreen from '@/components/ErrorScreen';
import BackDropLoader from '@/components/LoadingScreen/BackDropLoader';
const LoginPopup = dynamic(() => import('@/components/LoginPopup/LoginPopup'));

// import LoginPopup from '@/components/LoginPopup/LoginPopup';
import SuccessScreen from '@/components/SuccessScreen';

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
import { updateProject } from '@/redux/services/projectServices';
import { RootState } from '@/redux/store/store';

interface MilestoneItem {
  name: string;
  description: string;
  amount: number | undefined;
}

interface InputErrorType {
  title?: string;
  description?: string;
  approvers?: string;
  milestones: Array<{ name?: string; amount?: string; description?: string }>;
}

export type ApplicationPreviewProps = {
  brief: Brief;
  user: User;
  application: Project;
  freelancer: Freelancer;
};

const ApplicationPreview = (): JSX.Element => {
  const filter = new Filter();
  const [brief, setBrief] = useState<Brief | any>();
  const { user, loading: userLoading } = useSelector(
    (state: RootState) => state.userState
  );
  const [application, setApplication] = useState<Project | any>();
  const [freelancer, setFreelancer] = useState<Freelancer | any>();
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [currencyId, setCurrencyId] = useState(application?.currency_id);
  const [durationId, setDurationId] = useState(application?.duration_id);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [briefOwner, setBriefOwner] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [inputErrors, setInputErrors] = useState<InputErrorType>({
    title: '',
    description: '',
    approvers: '',
    milestones: [],
  });
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);

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
        const applicationResponse = await fetchProject(applicationId, briefId);

        if (!applicationResponse)
          return setError({
            noRetry: true,
            message: 'Could not find any application',
          });

        const freelancerUser = await fetchUser(
          Number(applicationResponse?.user_id)
        );
        const freelancerResponse = await getFreelancerProfile(
          freelancerUser?.username
        );

        setBrief(brief);
        setApplication(applicationResponse);
        setFreelancer(freelancerResponse);
        setCurrencyId(applicationResponse?.currency_id);
        setDurationId(applicationResponse?.duration_id);
      } catch (error) {
        setError({ message: 'Could not find application' });
      } finally {
        //setLoading(false);
      }
    };

    if (briefId && applicationId) {
      getSetUpData();
    }
  }, [briefId, applicationId]);

  useEffect(() => {
    async function setup() {
      if (brief) {
        // setLoading(true);
        const briefOwner: User = await fetchUser(brief?.user_id);
        // setLoading(false);
        setBriefOwner(briefOwner);
      }
    }
    setup();
  }, [brief, freelancer]);

  const viewFullBrief = () => {
    router.push(`/briefs/${brief?.id}/`);
  };

  const filteredApplication = application?.milestones
    ?.filter?.((m: any) => m?.amount !== undefined)
    ?.map?.((m: any) => {
      return {
        name: m?.name,
        description: m?.description,
        amount: Number(m?.amount),
      };
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
  const amountDue = totalCostWithoutFee - imbueFee;
  const onAddMilestone = () => {
    setMilestones([
      ...milestones,
      { name: '', description: '', amount: undefined },
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

  const handleMessageBoxClick = async (userId: number) => {
    if (userId) {
      setShowMessageBox(true);
      setTargetUser(await fetchUser(userId));
    } else {
      setLoginModal(true);
    }
  };

  useEffect(() => {
    if (freelancer && briefOwner && user.id && !userLoading) {
      if (freelancer.user_id === user.id || briefOwner.id === user.id) {
        setLoading(false);
      } else {
        router.push('/');
      }
    } else if (!userLoading && (!user || !user.id)) {
      router.push('/');
    }
  }, [briefOwner, freelancer]);

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

  const handleMilestoneChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    milestoneIndex: number | undefined = undefined
  ) => {
    const { milestonesRes, errors } = handleApplicationInput(
      event,
      milestoneIndex,
      inputErrors,
      milestones,
      brief?.headline,
      brief?.description
    );
    setMilestones(milestonesRes);
    setInputErrors(errors);
  };

  const totalPercent = milestones.reduce((sum, { amount }) => {
    const percent = Number(
      ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
    );
    return sum + percent;
  }, 0);

  const milestonesRef = useRef<any>([]);

  useEffect(() => {
    const { isValid, errors } = validateApplicationInput(
      'brief',
      inputErrors,
      milestones
    );
    setDisableSubmit(!isValid);
    setInputErrors(errors);
  }, [milestones]);

  const handleUpdateProject = async (
    chainProjectId?: number,
    escrow_address?: string
  ) => {
    if (totalPercent !== 100)
      return setError({ message: 'TotalPercent must be 100%' });
    if (totalCostWithoutFee > 100000000)
      return setError({
        message: 'Total price of the project must be less than $100,000,000',
      });
    if (totalCostWithoutFee < 10)
      return setError({
        message: 'Total price of the project must be greater than $10',
      });

    setLoading(true);
    try {
      const resp = await updateProject(application?.id, {
        user_id: user.id,
        name: `${brief.headline}`,
        total_cost_without_fee: totalCostWithoutFee,
        imbue_fee: imbueFee,
        currency_id: currencyId,
        milestones: milestones
          .filter((m) => m.amount !== undefined)
          .map((m) => {
            return {
              name: filter.clean(m.name),
              amount: m.amount,
              description: filter.clean(m.description),
              percentage_to_unlock: (
                ((m.amount ?? 0) / totalCostWithoutFee) *
                100
              ).toFixed(0),
              chain_project_id: chainProjectId,
            };
          }),
        required_funds: amountDue,
        owner: user.web3_address,
        chain_project_id: chainProjectId,
        escrow_address: escrow_address,
        duration_id: durationId,
      });

      if (resp.id) {
        const milStone = milestones
          .filter((m) => m.amount !== undefined)
          .map((m) => {
            return {
              name: filter.clean(m.name),
              amount: m.amount,
              description: filter.clean(m.description),
              percentage_to_unlock: (
                ((m.amount ?? 0) / totalCostWithoutFee) *
                100
              ).toFixed(0),
            };
          });
        setMilestones(milStone);
        setSuccess(true);
        setIsEditingBio(false);
      } else {
        setError({ message: `${resp.status} ${resp.message}` });
      }
    } catch (error) {
      setError({ message: error });
    } finally {
      setLoading(false);
    }
  };
  // const milestoneAmountsAndNamesHaveValue = allAmountAndNamesHaveValue();
  // if (loading) return <FullScreenLoader />;

  return (
    <div>
      <div className='application-container  px-4 mt-3 lg:mt-0 lg:px-0'>
        {user && showMessageBox && (
          <ChatPopup
            {...{
              showMessageBox,
              setShowMessageBox,
              browsingUser: user,
              targetUser,
            }}
            showFreelancerProfile={!isApplicationOwner}
          />
        )}

        {isBriefOwner && (
          <div className='bg-white py-[1.25rem] px-[2.3rem] rounded-[1.25rem]'>
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
                amountDue: amountDue,
                setLoading,
                openAccountChoice,
                setOpenAccountChoice,
                user,
              }}
            />
          </div>
        )}

        {isApplicationOwner && (
          <div className='bg-white py-[1.25rem] px-[2.3rem] rounded-[1.25rem]'>
            <ApplicationOwnerHeader
              {...{
                briefOwner,
                brief,
                handleMessageBoxClick,
                application,
                setLoading,
                updateProject: handleUpdateProject,
                user,
              }}
            />
          </div>
        )}
        {
          <div className='bg-white rounded-[20px]'>
            <h3 className='ml-4 lg:ml-[3rem] text-xl leading-[1.5] m-0 p-0  mt-[1.2rem] flex text-imbue-purple-dark font-normal'>
              Job description
            </h3>
            {brief && <BriefInsights brief={brief} />}
          </div>
        }
        <div>
          <div className='w-full flex flex-col bg-white border border-white rounded-2xl py-4 lg:py-5 '>
            <div className='flex flex-row justify-between mx-5 lg:mx-14'>
              <h3 className='flex text-lg lg:text-[1.25rem] text-imbue-purple font-normal leading-[1.5] m-0 p-0 mb-5'>
                Milestones
              </h3>

              {application?.total_cost_without_fee &&
                application?.imbue_fee && (
                  <h3 className='text-lg lg:text-[1.25rem] text-imbue-light-purple-two leading-[1.5] font-normal m-0 p-0'>
                    Projects&apos;s budget:{' '}
                    <span className=' text-imbue-purple-dark text-lg lg:text-[1.25rem]'>
                      $
                      {Number(application.total_cost_without_fee)?.toLocaleString()}
                    </span>
                  </h3>
                )}
            </div>

            <hr className='h-[1px] bg-[#E1DDFF] w-full' />

            <div className='milestone-list lg:mb-5'>
              {milestones?.map?.(({ name, description, amount }, index) => {
                const percent = Number(
                  ((100 * (amount ?? 0)) / totalCostWithoutFee)?.toFixed?.(0)
                );
                return (
                  <div
                    className={`flex items-start w-full px-5 py-9 lg:px-14 relative border-b border-b-imbue-light-purple last:border-b-0`}
                    key={index}
                    ref={(el) => (milestonesRef.current[index] = el)}
                  >
                    {isEditingBio && index !== 0 && (
                      <span
                        onClick={() => onRemoveMilestone(index)}
                        className='absolute top-1 right-2 lg:right-4 text-sm lg:text-xl font-bold hover:border-red-500 text-red-500 cursor-pointer'
                      >
                        x
                      </span>
                    )}
                    <div className='mr-4 lg:mr-9 text-base lg:text-[1.25rem] text-imbue-purple font-normal'>
                      {index + 1}.
                    </div>
                    <div
                      className={`flex ${
                        isEditingBio ? 'flex-col lg:flex-row' : 'flex-row'
                      } justify-between w-full`}
                    >
                      <div className='w-full lg:w-2/3 h-fit'>
                        {isEditingBio ? (
                          <>
                            <h3 className='text-base lg:text-xl mb-2 lg:mb-5 p-0 text-imbue-purple-dark font-normal'>
                              Title
                            </h3>
                            <input
                              type='text'
                              autoComplete='off'
                              maxLength={50}
                              placeholder='Add Milestone Name'
                              className='input-budget !pl-3 text-base rounded-[5px] py-3 text-imbue-purple mb-2 placeholder:text-imbue-light-purple'
                              value={name || ''}
                              name='milestoneTitle'
                              onChange={(e) => handleMilestoneChange(e, index)}
                            />
                            <div className='flex items-center justify-between mb-4'>
                              <p className='text-sm text-content my-2'>
                                {name?.length}/50
                              </p>
                              <p
                                className={`text-xs text-imbue-light-purple-two`}
                              >
                                {inputErrors?.milestones[index]?.name ||
                                  error?.name ||
                                  ''}
                              </p>
                            </div>
                          </>
                        ) : (
                          <h3 className='mb-2 lg:mb-5 text-base lg:text-[1.25rem] text-imbue-purple font-normal m-0 p-0 break-words'>
                            {name}
                          </h3>
                        )}
                        {isEditingBio ? (
                          <>
                            <h3 className='text-base lg:text-xl mb-2 lg:mb-5 p-0 text-imbue-purple-dark font-normal'>
                              Description
                            </h3>
                            <textarea
                              maxLength={5000}
                              className='text-content !p-3 placeholder:text-imbue-light-purple'
                              placeholder='Add Milestone Description'
                              rows={7}
                              value={description}
                              disabled={!isEditingBio}
                              name='milestoneDescription'
                              onChange={(e) => handleMilestoneChange(e, index)}
                            />
                            <div className='flex items-center justify-between mb-4'>
                              <p className='text-sm text-content my-2'>
                                {description?.length}/5000
                              </p>
                              <p
                                className={`text-xs text-imbue-light-purple-two`}
                              >
                                {inputErrors?.milestones[index]?.description ||
                                  error?.description ||
                                  ''}
                              </p>
                            </div>
                          </>
                        ) : (
                          <p className='text-[1rem] text-[#3B27C180] m-0 break-words'>
                            {description}
                          </p>
                        )}
                      </div>
                      <div className='flex flex-col w-full lg:w-1/5 items-end'>
                        <h3 className='mb-2 lg:mb-5 text-right text-base lg:text-[1.25rem] text-imbue-purple font-normal m-0 p-0'>
                          Amount
                        </h3>
                        {isEditingBio ? (
                          <>
                            <div className='w-full relative p-0 m-0'>
                              <span className='h-fit absolute left-5 bottom-3 text-base text-content'>
                                {Currency[currencyId]}
                              </span>

                              <input
                                type='number'
                                onWheel={(e) =>
                                  (e.target as HTMLElement).blur()
                                }
                                autoComplete='off'
                                disabled={!isEditingBio}
                                placeholder='Add an amount'
                                className='input-budget text-base rounded-[5px] py-3 pl-14 pr-5 text-imbue-purple text-right placeholder:text-imbue-light-purple'
                                value={amount || ''}
                                onChange={(e) =>
                                  handleMilestoneChange(e, index)
                                }
                                name='milestoneAmount'
                              />
                            </div>
                            <p
                              className={`text-xs text-imbue-light-purple-two mt-2`}
                            >
                              {inputErrors?.milestones[index]?.amount ||
                                error?.amount ||
                                ''}
                            </p>
                          </>
                        ) : (
                          <p className='text-[1rem] text-[#3B27C180] m-0'>
                            $
                            {Number(
                              milestones[index]?.amount?.toFixed(2)
                            )?.toLocaleString?.()}
                          </p>
                        )}

                        {totalCostWithoutFee !== 0 && isEditingBio && (
                          <div className='flex flex-col items-end mt-[auto] gap-[8px] w-full'>
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
            {isEditingBio && (
              <p
                typeof='button'
                className='clickable-text btn-add-milestone mx-5 lg:mx-14 !mb-0 text-base lg:text-xl font-bold !text-imbue-lemon w-fit'
                onClick={onAddMilestone}
              >
                <FiPlusCircle color='#7AA822' />
                Add milestone
              </p>
            )}
          </div>
        </div>

        <div className='w-full bg-white border border-white rounded-[20px] py-[20px]'>
          <p className='mx-5 lg:mx-14 mb-4 text-[1.25rem] text-imbue-purple font-normal'>
            Costs
          </p>
          <hr className='h-[1px] bg-[#E1DDFF] w-full' />

          <div className='flex flex-row lg:items-center mb-[20px] mx-5 lg:mx-14 mt-7 gap-5'>
            <div className='flex flex-col flex-grow gap-1'>
              <h3 className='text-base lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                Total price of the project
              </h3>
              <div className='text-inactive text-xs !font-normal lg:text-base !text-imbue-light-purple-two'>
                This includes all milestones, and is the amount client will see
              </div>
            </div>
            <div className='budget-value text-xl text-imbue-purple-dark font-normal'>
              ${Number(totalCostWithoutFee?.toFixed?.(2)).toLocaleString()}
            </div>
          </div>

          <div className='flex flex-row items-center mb-[20px] mx-5 lg:mx-14'>
            <div className='flex flex-col flex-grow'>
              <h3 className='text-base lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                Imbue Service Fee 5%
              </h3>
            </div>
            <div className='budget-value text-[1.25rem] text-imbue-purple-dark font-normal'>
              ${Number(imbueFee?.toFixed?.(2))?.toLocaleString?.()}
            </div>
          </div>

          <div className='flex flex-row items-center mb-[20px] mx-5 lg:mx-14'>
            <div className='flex flex-col flex-grow'>
              <h3 className='text-base lg:text-xl m-0 p-0 text-imbue-purple-dark font-normal'>
                Amount Received
              </h3>
            </div>
            <div className='budget-value text-[1.25rem] text-imbue-light-purple-two font-normal'>
              ${Number(amountDue.toFixed(2))?.toLocaleString?.()}
            </div>
          </div>
        </div>

        <div className='bg-white rounded-[20px] py-5'>
          <h3 className='ml-4 mb-2 text-[1.25rem] text-imbue-purple-dark font-normal mx-5 lg:mx-14 p-0 flex'>
            Payment terms
          </h3>

          <hr className='h-[1px] bg-[rgba(3, 17, 106, 0.12)] w-full mt-4' />

          <div className='bg-white pt-5 rounded-[20px] flex flex-col lg:flex-row lg:justify-between gap-3 mx-5 lg:mx-14'>
            <div className='duration-selector'>
              <h3 className='text-lg lg:text-[1.25rem] font-normal m-0 p-0 text-imbue-purple-dark'>
                How long will this project take?
              </h3>
              {isApplicationOwner && isEditingBio ? (
                <select
                  value={durationId || 0}
                  name='duration'
                  className='bg-white outline-none round border border-content-primary rounded-[0.5rem] text-base px-5 mt-4 h-[2.75rem] text-content cursor-pointer'
                  placeholder='Select a duration'
                  required
                  onChange={(e) => setDurationId(e.target.value)}
                >
                  {durationOptions.map(({ label, value }, index) => (
                    <option
                      value={value}
                      key={index}
                      className='duration-option'
                    >
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className='text-content-primary mt-2 w-full'>
                  {durationOptions[durationId || 0]?.label || ''}
                </p>
              )}
            </div>
            <div className='payment-options'>
              <h3 className='text-lg lg:text-[1.25rem] font-normal m-0 p-0 text-imbue-purple-dark'>
                Currency
              </h3>

              <div className='network-amount'>
                {isApplicationOwner && isEditingBio ? (
                  <select
                    value={currencyId || 0}
                    name='currencyId'
                    onChange={handleChange}
                    placeholder='Select a currency'
                    className='bg-white outline-none round border border-content-primary rounded-[0.5rem] text-base px-5 mt-4 h-[2.75rem] text-content cursor-pointer'
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
                ) : (
                  <p className='text-content-primary mt-2 w-full lg:text-end'>
                    {Currency[currencyId || 0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='mb-[0.5rem] bg-white rounded-2xl w-full p-[1rem] flex items-center justify-between   self-center'>
          <div className='buttons-container'>
            <button
              className='primary-btn in-dark w-button'
              onClick={() => viewFullBrief()}
            >
              Back To Brief
            </button>
            {!isEditingBio &&
              isApplicationOwner &&
              application.status_id !== 4 && (
                <button
                  className='primary-btn in-dark w-button !flex items-center gap-1 lg:gap-2'
                  onClick={() => setIsEditingBio(true)}
                >
                  <span>Edit Application</span>
                  <FiEdit />
                </button>
              )}
            {isEditingBio && (
              <Tooltip
                followCursor
                title={disableSubmit && 'Please fill all the input fields'}
              >
                <button
                  className={`primary-btn in-dark w-button ${
                    disableSubmit &&
                    '!bg-gray-400 !text-white !cursor-not-allowed'
                  }`}
                  onClick={() => !disableSubmit && handleUpdateProject()}
                >
                  Update
                </button>
              </Tooltip>
            )}

            {/* TODO: Add Drafts Functionality */}
            {/* <button className="secondary-btn">Save draft</button> */}
          </div>
        </div>
      </div>
      <LoginPopup
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
          {!error?.noRetry && (
            <button
              onClick={() => setError(null)}
              className='primary-btn in-dark w-button w-full !m-0'
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </ErrorScreen>

      <BackDropLoader open={loading} />
    </div>
  );
};

export default ApplicationPreview;
