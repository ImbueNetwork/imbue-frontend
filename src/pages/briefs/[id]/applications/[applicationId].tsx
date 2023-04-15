/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { timeData } from "@/config/briefs-data";
import * as config from "@/config";
import {
  Brief,
  Currency,
  Freelancer,
  Project,
  ProjectStatus,
  User,
} from "@/model";
import {
  changeBriefApplicationStatus as updateBriefApplicationStatus,
  getBrief,
} from "@/redux/services/briefService";
import { BriefInsights } from "@/components/Briefs/BriefInsights";
import { fetchProject, fetchUser, getCurrentUser, redirect } from "@/utils";
import { getFreelancerProfile } from "@/redux/services/freelancerService";
import { HirePopup } from "@/components/HirePopup";
import ChatPopup from "@/components/ChatPopup";
import ChainService from "@/redux/services/chainService";
import { getWeb3Accounts, initImbueAPIInfo } from "@/utils/polkadot";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { blake2AsHex } from "@polkadot/util-crypto";
import { Backdrop, CircularProgress } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import Login from "@/components/Login";

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

const applicationStatusId = [
  "Draft",
  "Pending Review",
  "Changes Requested",
  "Rejected",
  "Accepted",
];

const ApplicationPreview = (): JSX.Element => {
  const [brief, setBrief] = useState<Brief | any>();
  const [user, setUser] = useState<User | any>();
  const [application, setApplication] = useState<Project | any>();
  const [freelancer, setFreelancer] = useState<Freelancer | any>();

  const router = useRouter();
  const { id, applicationId }: any = router.query;
  const briefId = id;

  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [currencyId, setCurrencyId] = useState(application?.currency_id);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [briefOwner, setBriefOwner] = useState<User>();
  const applicationStatus = ProjectStatus[application?.status_id];
  const isApplicationOwner = user?.id == application?.user_id;
  const isBriefOwner = user?.id == brief?.user_id;
  const [freelancerAccount, setFreelancerAccount] =
    React.useState<InjectedAccountWithMeta>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (briefId && applicationId) {
      getSetUpData();
    }
  }, [briefId, applicationId]);

  const getSetUpData = async () => {
    const applicationResponse = await fetchProject(applicationId);
    const freelancerUser = await fetchUser(
      Number(applicationResponse?.user_id)
    );
    const freelancerResponse = await getFreelancerProfile(
      freelancerUser?.username
    );

    const brief: Brief | undefined = await getBrief(briefId);
    const userResponse = await getCurrentUser();

    setFreelancer(freelancerResponse);
    setBrief(brief);
    setApplication(applicationResponse);
    setUser(userResponse);
  };

  useEffect(() => {
    async function setup() {
      if (brief) {
        const briefOwner: User = await fetchUser(brief?.user_id);
        setBriefOwner(briefOwner);
        await fetchAndSetAccounts();
      }
    }
    setup();
  }, [brief]);

  const fetchAndSetAccounts = async () => {
    const accounts = await getWeb3Accounts();
    const account = accounts.filter(
      (account) => account.address === freelancer?.web3_address
    )[0];
    setFreelancerAccount(account);
  };

  const viewFullBrief = () => {
    router.push(`/briefs/${brief?.id}/`);
  };

  const updateProject = async (chainProjectId?: number) => {
    setLoading(true);
    await fetch(`${config.apiBase}/project/${application.id}`, {
      headers: config.postAPIHeaders,
      method: "put",
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
    setLoading(false);
    setIsEditingBio(false);
  };

  const startWork = async () => {
    if (freelancerAccount) {
      setLoading(true);
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);
      delete application.modified;
      const briefHash = blake2AsHex(JSON.stringify(application));
      const result = await chainService?.commenceWork(
        freelancerAccount,
        briefHash
      );
      while (true) {
        if (result.status || result.txError) {
          if (result.status) {
            console.log("***** success");
            const projectId = parseInt(result.eventData[2]);
            await updateProject(projectId);
          } else if (result.txError) {
            console.log("***** failed");
            console.log(result.errorMessage);
          }
          break;
        }
        await new Promise((f) => setTimeout(f, 1000));
      }
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
    setMilestones([...milestones, { name: "", amount: undefined }]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyId(Number(event.target.value));
  };

  const handleMessageBoxClick = async (user_id: number, freelancer: any) => {
    if (user_id) {
      setShowMessageBox(true);
      setTargetUser(await fetchUser(user_id));
    } else {
      setLoginModal(true);
    }
  };

  const updateApplicationState = async (
    application: any,
    projectStatus: ProjectStatus
  ) => {
    await updateBriefApplicationStatus(
      application?.brief_id,
      application?.id,
      projectStatus
    );
    window.location.reload();
  };

  return (
    <>
      <div className="application-container">
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
          <>
            <div className="flex items-center justify-evenly">
              <Image
                className="w-16 h-16 rounded-full object-cover"
                src={require("@/assets/images/profile-image.png")}
                priority
                alt="profileImage"
              />
              <div className="">
                <p className="text-xl font-bold">{freelancer?.display_name}</p>
                <p
                  className="text-base mt-2 underline cursor-pointer primary-text"
                  onClick={() =>
                    redirect(`freelancers/${freelancer?.username}/`)
                  }
                >
                  View Full Profile
                </p>
              </div>
              <div>
                <p className="text-xl primary-text">@{freelancer?.username}</p>
              </div>
              <button
                className="PendingReviewButton in-dark rounded-full px-8 py-4 dark-button"
                onClick={() =>
                  handleMessageBoxClick(
                    application?.user_id,
                    freelancer?.username
                  )
                }
              >
                Message
              </button>

              <div className="grid grid-cols-2 gap-2">
                {application?.status_id == ProjectStatus.PendingReview ? (
                  <>
                    <button
                      onClick={() => {
                        setOpenPopup(true);
                      }}
                      className="Accepted-btn in-dark !rounded-full !px-1 !py-2 dark-button"
                    >
                      Hire
                    </button>
                    <button
                      onClick={() => {
                        updateApplicationState(
                          application,
                          ProjectStatus.ChangesRequested
                        );
                      }}
                      className="Request-btn in-dark  !rounded-full !px-1 !py-2 dark-button"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => {
                        updateApplicationState(
                          application,
                          ProjectStatus.Rejected
                        );
                      }}
                      className="Rejected-btn in-dark  !rounded-full !px-1 !py-2 dark-button"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    className={`${
                      applicationStatusId[application?.status_id]
                    }-btn in-dark !rounded-full !px-6 !py-3`}
                  >
                    {applicationStatusId[application?.status_id]}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {isApplicationOwner && (
          <div className="flex items-center justify-evenly">
            <Image
              className="w-16 h-16 rounded-full object-cover"
              src={require("@/assets/images/profile-image.png")}
              priority
              alt="profileImage"
            />
            <div className="">
              <p className="text-xl font-bold">{briefOwner?.display_name}</p>
            </div>
            <div>
              <p className="text-xl primary-text">@{briefOwner?.username}</p>
            </div>
            <div>
              <button
                className="primary-btn in-dark w-button"
                onClick={() =>
                  brief &&
                  handleMessageBoxClick(brief?.user_id, freelancer?.username)
                }
              >
                Message
              </button>
              {application?.status_id === 4 ? (
                <button
                  onClick={() => brief?.project_id && startWork()}
                  className="Accepted-btn in-dark rounded-full text-black px-6 py-3"
                >
                  Start Work
                </button>
              ) : (
                <button
                  className={`${
                    applicationStatusId[application?.status_id]
                  }-btn in-dark rounded-full px-6 py-3`}
                >
                  {applicationStatusId[application?.status_id]}
                </button>
              )}
            </div>
          </div>
        )}

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

        <Backdrop
          sx={{ color: "#fff", zIndex: 5 }}
          open={loading}
          // onClick={handleClose}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {
          <div>
            <h3 className="ml-[2rem] mb-[0.5rem] text-xl leading-[1.5] font-bold m-0 p-0  flex">
              Job description
            </h3>
            {brief && <BriefInsights brief={brief} />}
          </div>
        }
        <div>
          <div className="w-full flex flex-col gap-[20px] bg-[#2c2c2c] border border-solid border-white rounded-[20px] py-[20px] ">
            <div className="flex flex-row justify-between mx-14 -mb-3">
              <h3 className="flex text-xl leading-[1.5] font-bold m-0 p-0">
                Milestones
                {!isEditingBio && isApplicationOwner && (
                  <div
                    className="ml-[10px] relative top-[-2px]"
                    onClick={() => setIsEditingBio(true)}
                  >
                    <FiEdit />
                  </div>
                )}
              </h3>
              <h3 className="flex text-xl leading-[1.5] font-bold m-0 p-0">
                Client&apos;s budget: ${Number(brief?.budget).toLocaleString()}
              </h3>
            </div>
            <hr className="separator" />
            {isEditingBio && (
              <p className="mx-14 text-xl font-bold">
                How many milestone do you want to include?
              </p>
            )}
            <div className="milestone-list mx-14 mb-5">
              {milestones?.map?.(({ name, amount }, index) => {
                const percent = Number(
                  ((100 * (amount ?? 0)) / totalCostWithoutFee)?.toFixed?.(0)
                );
                return (
                  <div className="flex flex-row items-start w-full" key={index}>
                    <div className="mr-[36px] text-sm">{index + 1}</div>
                    <div className="flex flex-row justify-between w-full">
                      <div className="w-[50%]">
                        <h3 className="mb-[1.25rem] text-xl font-bold m-0 p-0">
                          Description
                        </h3>
                        {isEditingBio ? (
                          <textarea
                            className="input-description bg-[#1a1a19] border border-solid border-white text-base leading-[20px] py-[10px] px-[20px]"
                            value={name}
                            disabled={!isEditingBio}
                            onChange={(e) =>
                              setMilestones([
                                ...milestones?.slice(0, index),
                                {
                                  ...milestones[index],
                                  name: e.target.value,
                                },
                                ...milestones?.slice(index + 1),
                              ])
                            }
                          />
                        ) : (
                          <p className="text-base text-[#ebeae2] m-0">
                            {milestones[index]?.name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col w-[fit-content] items-end">
                        <h3 className="mb-[1.25rem] text-xl font-bold m-0 p-0">
                          Amount
                        </h3>
                        {isEditingBio ? (
                          <input
                            type="number"
                            className="input-budget bg-[#1a1a19] border border-solid border-white text-base leading-[20px] rounded-[5px] py-[10px] px-[20px]"
                            disabled={!isEditingBio}
                            value={amount || ""}
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
                          <p className="text-base text-[#ebeae2] m-0">
                            {milestones[index]?.amount}
                          </p>
                        )}

                        {totalCostWithoutFee !== 0 && isEditingBio && (
                          <div className="flex flex-col items-end mt-[auto] gap-[8px] w-full">
                            <div className="progress-value text-base">
                              {percent}%
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress"
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
                className="clickable-text btn-add-milestone mx-14 text-2xl"
                onClick={onAddMilestone}
              >
                <FiPlusCircle color="var(--theme-primary)" />
                Add milestone
              </h4>
            )}
          </div>
        </div>

        <div className=" w-full bg-[#2c2c2c] border border-solid border-white rounded-[20px] py-[20px]">
          <p className="mx-14 mb-4 text-xl font-bold">Costs</p>
          <hr className="separator" />

          <div className="flex flex-row items-center mb-[20px] mx-14 mt-7">
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-bold m-0 p-0">
                Total price of the project
              </h3>
              <div className="text-inactive">
                This includes all milestones, and is the amount client will see
              </div>
            </div>
            <div className="budget-value">
              ${Number(totalCostWithoutFee?.toFixed?.(2)).toLocaleString()}
            </div>
          </div>

          <div className="flex flex-row items-center mb-[20px] mx-14">
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-bold m-0 p-0">
                Imbue Service Fee 5%
              </h3>
            </div>
            <div className="budget-value">
              ${Number(imbueFee?.toFixed?.(2))?.toLocaleString?.()}
            </div>
          </div>

          <div className="flex flex-row items-center mb-[20px] mx-14">
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-bold m-0 p-0">Total</h3>
            </div>
            <div className="budget-value">
              ${Number(totalCost.toFixed(2))?.toLocaleString?.()}
            </div>
          </div>
        </div>

        <div>
          <h3 className="ml-[2rem] mb-[0.5rem] text-xl font-bold m-0 p-0 flex">
            Payment terms
          </h3>
          <div className="bg-[#2c2c2c] border border-solid border-[#fff] py-[20px] rounded-[20px] payment-details px-14">
            <div className="duration-selector">
              <h3 className="text-xl font-bold m-0 p-0">
                How long will this project take?
              </h3>

              <select
                className="bg-[#1a1a19] border border-solid border-[#fff] rounded-[5px] text-base px-[20px] py-[10px] mt-4 round"
                name="duration"
                placeholder="Select a duration"
                required
              >
                {durationOptions.map(({ label, value }, index) => (
                  <option value={value} key={index} className="duration-option">
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="payment-options">
              <h3 className="text-xl font-bold m-0 p-0 self-end">Currency</h3>
              <div className="network-amount">
                <select
                  name="currencyId"
                  onChange={handleChange}
                  className="bg-[#1a1a19] round border border-solid border-[#fff] rounded-[5px] text-base px-[20px] py-[10px] mt-4"
                  placeholder="Select a currency"
                  disabled={!isEditingBio}
                  defaultValue={Number(application?.currency_id)}
                  required
                >
                  {currencies.map((currency, index) => (
                    <option
                      value={index}
                      key={index}
                      className="duration-option"
                    >
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="buttons-container">
          <button
            className="primary-btn in-dark w-button"
            onClick={() => viewFullBrief()}
          >
            Back To Brief
          </button>
          {isEditingBio && (
            <button
              className="primary-btn in-dark w-button"
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
        redirectUrl={`/freelancer/${freelancer?.username}/`}
      />
    </>
  );
};

export default ApplicationPreview;
