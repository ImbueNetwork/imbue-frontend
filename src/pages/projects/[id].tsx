/* eslint-disable react-hooks/exhaustive-deps */
import {
  Freelancer,
  Milestone,
  Project,
  ProjectOnChain,
  OnchainProjectState,
  User,
} from "@/model";
import { getProjectById } from "@/redux/services/briefService";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { getFreelancerProfile } from "@/redux/services/freelancerService";
import * as utils from "@/utils";
import { initImbueAPIInfo } from "@/utils/polkadot";
import ChainService from "@/redux/services/chainService";
import FullScreenLoader from "@/components/FullScreenLoader";
import moment from "moment";
import AccountChoice from "@/components/AccountChoice";
import { Dialogue } from "@/components/Dialogue";
import ChatPopup from "@/components/ChatPopup";
import Login from "@/components/Login";
import { ProjectStatus } from "../api/models";
import { WalletAccount } from "@talismn/connect-wallets";
import ErrorScreen from "@/components/ErrorScreen";
import SuccessScreen from "@/components/SuccessScreen";

TimeAgo.addDefaultLocale(en);

type ExpandableDropDownsProps = {
  milestone: Milestone;
  index: number;
  modified: Date;
  vote: () => void;
  submitMilestone: () => void;
  withdraw: () => void;
};

const openForVotingTag = (): JSX.Element => {
  return (
    <div className="flex flex-row items-center">
      <div className="h-[15px] w-[15px] rounded-[7.5px] bg-[#BAFF36]" />
      <p className="text-xl font-normal leading-[23px] text-[#BAFF36] mr-[27px] ml-[14px]">
        Open for Voting
      </p>
    </div>
  );
};

const projectStateTag = (dateCreated: Date, text: string): JSX.Element => {
  return (
    <div className="flex flex-row items-center">
      <p className="text-[14px] font-normal leading-[16px] text-white">
        {moment(dateCreated)?.format("DD MMM YYYY")}
      </p>
      <p className="text-xl font-normal leading-[23px] text-[#411DC9] mr-[27px] ml-[14px]">
        {text}
      </p>
    </div>
  );
};

function Project() {
  const router = useRouter();
  const [project, setProject] = useState<Project | any>({});
  const [freelancer, setFreelancer] = useState<Freelancer | any>({});
  const [onChainProject, setOnChainProject] = useState<ProjectOnChain | any>();
  const [user, setUser] = useState<User | any>();
  const [chatTargetUser, setChatTargetUser] = useState<User | null>(null);
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);
  const [submittingMilestone, setSubmittingMilestone] =
    useState<boolean>(false);
  const [withdrawMilestone, setWithdrawMilestone] = useState<boolean>(false);
  const [showVotingModal, setShowVotingModal] = useState<boolean>(false);
  const [votingWalletAccount, setVotingWalletAccount] = useState<
    WalletAccount | any
  >({});
  const [milestoneKeyInView, setMilestoneKeyInView] = useState<number>(0);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const projectId: any = router?.query?.id || 0;
  const [milestoneBeingVotedOn, setMilestoneBeingVotedOn] = useState<number>();
  const [isApplicant, setIsApplicant] = useState<boolean>();

  const [error, setError] = useState<any>()
  const [sucessTitle, setSuccessTitle] = useState<any>("")


  // fetching the project data from api and from chain
  useEffect(() => {
    if (projectId) {
      getProject();
    }
  }, [projectId]);

  const getChainProject = async () => {
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    const user: User | any = await utils.getCurrentUser();
    const chainService = new ChainService(imbueApi, user);
    const onChainProjectRes = await chainService.getProject(projectId);
    if (onChainProjectRes) {
      const isApplicant = onChainProjectRes.initiator == user.web3_address;

      if (isApplicant) {
        await getFreelancerData(user.username);
      }

      setIsApplicant(isApplicant);
      if (onChainProjectRes.projectState == OnchainProjectState.OpenForVoting) {
        const firstPendingMilestone =
          await chainService.findFirstPendingMilestone(
            onChainProjectRes.milestones
          );
        setMilestoneBeingVotedOn(firstPendingMilestone);
      }

      setOnChainProject(onChainProjectRes);
    }
    setLoading(false);
  };

  const getProject = async () => {
    const projectRes = await getProjectById(projectId);
    setProject(projectRes);
    // api  project response
    const userResponse = await utils.getCurrentUser();
    await setUser(userResponse);
    await getChainProject();
  };

  const getFreelancerData = async (freelancerName: string) => {
    const freelanceRes = await getFreelancerProfile(freelancerName);
    setFreelancer(freelanceRes);
  };

  // voting on a mile stone
  const voteOnMilestone = async (account: WalletAccount, vote: boolean) => {
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    const userRes: User | any = await utils.getCurrentUser();
    const chainService = new ChainService(imbueApi, userRes);
    const voteResponse = await chainService.voteOnMilestone(
      account,
      onChainProject,
      milestoneKeyInView,
      vote
    );
    setLoading(false);
  };

  // submitting a milestone
  const submitMilestone = async (account: WalletAccount) => {
    setLoading(true);
    try {
      const imbueApi = await initImbueAPIInfo();
      const user: User | any = await utils.getCurrentUser();
      const chainService = new ChainService(imbueApi, user);
      const result = await chainService.submitMilestone(
        account,
        onChainProject,
        milestoneKeyInView
      );
      while (true) {
        if (result.status || result.txError) {
          if (result.status) {
            // TODO: show Success screen
          } else if (result.txError) {
            // TODO: show error screen
            console.log(result.errorMessage);
          }
          await new Promise((f) => setTimeout(f, 1000));
        }
      }
    } catch (error) {
      setError(error)
      console.log(error);
    }
    finally {
      setLoading(false);
    }

    // submitting a m
    const withdraw = async (account: WalletAccount) => {
      setLoading(true);
      try {
        const imbueApi = await initImbueAPIInfo();
        const user: User | any = await utils.getCurrentUser();
        const chainService = new ChainService(imbueApi, user);
        const result = await chainService.withdraw(account, onChainProject);
        while (true) {
          if (result.status || result.txError) {
            if (result.status) {
              // TODO: show success screen
            } else if (result.txError) {
              // TODO: show error screen
              console.log(result.errorMessage);
            }
            await new Promise((f) => setTimeout(f, 1000));
          }
        }
      } catch (error) {
        setError(error)
        console.log(error);
      }
      finally {
        setLoading(false);
      }

      const renderPolkadotJSModal = (
        <div>
          <AccountChoice
            accountSelected={async (account: WalletAccount) => {
              if (submittingMilestone) {
                submitMilestone(account);
              } else if (withdrawMilestone) {
                withdraw(account);
              } else {
                await setVotingWalletAccount(account);
                await setShowVotingModal(true);
              }
            }}
            visible={showPolkadotAccounts}
            setVisible={setShowPolkadotAccounts}
            initiatorAddress={onChainProject?.initiator}
            filterByInitiator
          />
        </div>
      );

      const showAccountChoice = (vote: boolean) => {
        <AccountChoice
          accountSelected={(account) => voteOnMilestone(account, vote)}
          visible={true}
          setVisible={setShowVotingModal}
        />;
      };

      const renderVotingModal = (
        <Dialogue
          title="Want to appove milestone?"
          closeDialouge={() => setShowVotingModal(false)}
          actionList={
            <>
              <li className="button-container !bg-transparent !hover:bg-gray-950  !border !border-solid !border-white">
                <button
                  className="primary !bg-transparent !hover:bg-transparent"
                  onClick={() => {
                    voteOnMilestone(votingWalletAccount, true);
                    setShowVotingModal(false);
                  }}
                >
                  Yes
                </button>
              </li>
              <li className="button-container !bg-transparent !hover:bg-transparent  !border !border-solid !border-white">
                <button
                  className="primary !bg-transparent !hover:bg-transparent"
                  onClick={() => {
                    voteOnMilestone(votingWalletAccount, false);
                    setShowVotingModal(false);
                  }}
                >
                  No
                </button>
              </li>
            </>
          }
        />
      );

      const approvedMilestones = project?.milestones?.filter?.(
        (milstone: Milestone) => milstone?.is_approved === true
      );

      const timeAgo = new TimeAgo("en-US");
      const timePosted = project?.created
        ? timeAgo.format(new Date(project?.created))
        : 0;

      const handleMessageBoxClick = async (user_id: number, freelancer: any) => {
        if (user_id) {
          setShowMessageBox(true);
          setChatTargetUser(await utils.fetchUser(user_id));
        } else {
          setLoginModal(true);
        }
      };

      const ExpandableDropDowns = ({
        milestone,
        index,
        modified,
        vote,
        submitMilestone,
        withdraw,
      }: ExpandableDropDownsProps) => {
        const [expanded, setExpanded] = useState(false);

        return (
          <div
            className="
      transparent-conatainer 
      relative 
      !bg-[#2c2c2c] 
      !py-[20px] 
      !border 
      !border-white 
      rounded-[20px]
      max-lg:!px-[20px]
      max-width-750px:!pb-[30px]
      "
          >
            <div
              onClick={() => {
                setExpanded(!expanded);
              }}
              className="
          flex 
          justify-between 
          w-full 
          items-center 
          max-width-750px:flex-col 
          max-width-750px:flex"
            >
              <div className="flex flex-row max-width-750px:w-full">
                <h3 className="text-[39px] max-width-750px:text-[24px] font-normal leading-[60px]">
                  Milestone {index + 1}
                </h3>
                <h3 className="text-[24px] ml-[32px] font-normal leading-[60px]">
                  {milestone?.name}
                </h3>
              </div>
              <div className="flex flex-row items-center max-width-750px:w-full max-width-750px:justify-between">
                {milestone?.is_approved
                  ? projectStateTag(modified, "Completed")
                  : milestone?.milestone_key == milestoneBeingVotedOn
                    ? openForVotingTag()
                    : projectStateTag(modified, "Not Started")}

                <Image
                  src={require(expanded
                    ? "@/assets/svgs/minus_btn.svg"
                    : "@/assets/svgs/plus_btn.svg")}
                  height={25}
                  width={25}
                  alt="dropdownstate"
                />
              </div>
            </div>

            <div className={`${!expanded && "hidden"} my-6`}>
              <p className="text-[14px] font-normal text-white">
                Percentage of funds to be released{" "}
                <span className="text-[#BAFF36]">
                  {milestone?.percentage_to_unlock}%
                </span>
              </p>
              <p className="text-[14px] font-normal text-white">
                Funding to be released{" "}
                <span className="text-[#BAFF36]">
                  {Number(milestone?.amount)?.toLocaleString?.()} $IMBU
                </span>
              </p>

              <p className=" text-base font-normal text-[#a6a6a6] leading-[178.15%] mt-[23px] w-[80%]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
                purus sit amet luctus venenatis, lectus magna fringilla urna,
                porttitor rhoncus dolor purus non enim praesent elementum facilisis
                leo, vel fringilla est ullamcorper eget nulla facilisi etiam
                dignissim diam quis enim lobortis scelerisque fermentum dui faucibus
                in ornare quam viverra orci sagittis eu volutpat odio facilisis
                mauris sit amet massa vitae tortor condimentum lacinia quis vel eros
                donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue
                lacus, viverra vitae congue eu, consequat ac felis donec et odio
                pellentesque diam volutpat commodo sed egestas egestas fringilla
                phasellus faucibus
              </p>

              {!isApplicant && milestone.milestone_key == milestoneBeingVotedOn && (
                <button
                  className="primary-btn in-dark w-button font-normal max-width-750px:!px-[40px] h-[43px] items-center content-center !py-0 mt-[25px] px-8"
                  data-testid="next-button"
                  onClick={() => vote()}
                >
                  Vote
                </button>
              )}

              {isApplicant &&
                onChainProject?.projectState !==
                OnchainProjectState.OpenForVoting && (
                  <button
                    className="primary-btn in-dark w-button font-normal max-width-750px:!px-[40px] h-[43px] items-center content-center !py-0 mt-[25px] px-8"
                    data-testid="next-button"
                    onClick={() => submitMilestone()}
                  >
                    Submit
                  </button>
                )}

              {isApplicant && milestone.is_approved && (
                <button
                  className="primary-btn in-dark w-button font-normal max-width-750px:!px-[40px] h-[43px] items-center content-center !py-0 mt-[25px] px-8"
                  data-testid="next-button"
                  onClick={() => withdraw()}
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>
        );
      };

      return (
        <div className="max-lg:p-[var(--hq-layout-padding)]">
          {loading && <FullScreenLoader />}
          {user && showMessageBox && (
            <ChatPopup
              {...{
                showMessageBox,
                setShowMessageBox,
                browsingUser: user,
                targetUser: chatTargetUser,
              }}
            />
          )}
          <div
            className="flex 
      flex-row
       bg-[#2c2c2c] 
       border 
       border-opacity-25 
       -border--theme-light-white 
       rounded-[20px] 
       p-12
       max-lg:p-5
       max-lg:flex-col
       "
          >
            <div className="flex flex-col gap-[20px] flex-grow flex-shrink-0 basis-[75%] max-lg:basis-[60%] mr-[5%]  max-lg:mr-0">
              <div className="brief-title">
                <h3 className="text-[32px] max-lg:text-[24px] leading-[1.5] font-normal m-0 p-0">
                  {project?.name}
                </h3>
                <span
                  onClick={() => {
                    // project?.brief_id
                  }}
                  className="text-[#b2ff0b] cursor-pointer text-[20px]  max-lg: text-base  font-normal !m-0 !p-0 relative top-4"
                >
                  View full brief
                </span>
              </div>
              <div className="text-inactive w-[80%]">
                <p className=" text-base font-normal leading-[178.15%]">
                  {project?.description}
                </p>
              </div>
              <p className="text-inactive  text-base font-normal leading-[1.5] m-0 p-0">
                Posted {timePosted}
              </p>

              <p className="text-white text-xl font-normal leading-[1.5] mt-[16px] p-0">
                Freelancer hired
              </p>

              <div className="flex flex-row items-center max-lg:flex-wrap mt-5">
                <Image
                  src={require("@/assets/images/profile-image.png")}
                  alt="freelaner-icon"
                  height={50}
                  width={50}
                  className="border border-solid border-white rounded-[25px]"
                />

                <p className="text-white text-[20px] font-normal leading-[1.5] p-0 mx-7">
                  {freelancer?.display_name}
                </p>

                <button
                  onClick={() =>
                    handleMessageBoxClick(project?.user_id, freelancer?.username)
                  }
                  className="primary-btn 
              in-dark w-button 
              !mt-0 
              font-normal 
              h-11
              max-lg:!w-full 
              max-lg:!text-center 
              max-lg:!ml-0 
              max-lg:!mt-5 
              items-center 
              content-center 
              !py-0 ml-[40px] 
              px-8
              max-lg:!mr-0
              "
                  data-testid="next-button"
                >
                  Message
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-[50px] flex-grow flex-shrink-0 basis-[20%]  max-lg:mt-10">
              <div className="flex flex-col">
                <div className="flex flex-row">
                  <Image
                    src={require("@/assets/svgs/shield.svg")}
                    height={24}
                    width={24}
                    alt={"shieldIcon"}
                  />

                  <h3 className="text-xl leading-[1.5] ml-6  font-normal m-0 p-0">
                    Milestone{" "}
                    <span className="text-[#BAFF36]">
                      {approvedMilestones?.length}/{project?.milestones?.length}
                    </span>
                  </h3>
                </div>
                {/* mile stone step indicator */}
                <div className="w-48 bg-[#1C2608] mt-5 h-1 relative my-auto">
                  <div
                    style={{
                      width: `${(onChainProject?.milestones?.filter?.(
                        (m: any) => m?.is_approved
                      )?.length /
                        onChainProject?.milestones?.length) *
                        100
                        }%`,
                    }}
                    className="h-full rounded-xl Accepted-button absolute"
                  ></div>
                  <div className="flex justify-evenly">
                    {onChainProject?.milestones?.map((m: any, i: number) => (
                      <div
                        key={i}
                        className={`h-4 w-4 ${m.is_approved ? "Accepted-button" : "bg-[#1C2608]"
                          } rounded-full -mt-1.5`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-row">
                  <Image
                    src={require("@/assets/svgs/dollar_sign.svg")}
                    height={24}
                    width={24}
                    alt={"dollarSign"}
                  />
                  <h3 className="text-xl leading-[1.5] ml-6 font-normal m-0 p-0">
                    {Number(project?.total_cost_without_fee)?.toLocaleString()}{" "}
                    $IMBU
                  </h3>
                </div>

                <div className="text-inactive ml-[20%] mt-2">Budget - Fixed</div>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-row ">
                  <Image
                    src={require("@/assets/svgs/calendar_icon.svg")}
                    height={24}
                    width={24}
                    alt={"calenderIcon"}
                  />

                  <h3 className="text-xl leading-[1.5] ml-6 font-normal m-0 p-0">
                    1 to 3 months
                  </h3>
                </div>

                <div className="text-inactive  ml-[20%] mt-2">Timeline</div>
              </div>
            </div>
          </div>

          {onChainProject?.milestones?.map?.(
            (milestone: Milestone, index: number) => {
              return (
                <ExpandableDropDowns
                  key={`${index}-milestone`}
                  index={index}
                  milestone={milestone}
                  modified={milestone?.modified!}
                  vote={async () => {
                    // show polkadot account modal
                    await setShowPolkadotAccounts(true);
                    // set submitting mile stone to false
                    await setSubmittingMilestone(false);
                    // setMile stone key in view
                    await setMilestoneKeyInView(milestone.milestone_key);
                  }}
                  submitMilestone={async () => {
                    // set submitting mile stone to true
                    await setSubmittingMilestone(true);
                    // show polkadot account modal
                    await setShowPolkadotAccounts(true);
                    // setMile stone key in view
                    await setMilestoneKeyInView(milestone.milestone_key);
                  }}
                  withdraw={async () => {
                    // set submitting mile stone to true
                    await setWithdrawMilestone(true);
                    // show polkadot account modal
                    await setShowPolkadotAccounts(true);
                    // setMile stone key in view
                    await setMilestoneKeyInView(milestone.milestone_key);
                  }}
                />
              );
            }
          )}

          {showPolkadotAccounts && renderPolkadotJSModal}
          {showVotingModal && renderVotingModal}
          <Login
            visible={loginModal}
            setVisible={(val) => {
              setLoginModal(val);
            }}
            redirectUrl={`/project/${projectId}/`}
          />

          <ErrorScreen {...{ error, setError }}>
            <div className='flex flex-col gap-4 w-1/2'>
              <button
                onClick={() => setError(null)}
                className='primary-btn in-dark w-button w-full !m-0'>
                Try Again
              </button>
              <button
                onClick={() => router.push(`/dashboard`)}
                className='underline text-xs lg:text-base font-bold'>
                Go to Dashboard
              </button>
            </div>
          </ErrorScreen>

          <SuccessScreen
            title={sucessTitle}
            open={sucessTitle ? true : false}
            setOpen={setSuccessTitle}>
            <div className='flex flex-col gap-4 w-1/2'>
              <button
                onClick={() => setSuccessTitle(false)}
                className='primary-btn in-dark w-button w-full !m-0'>
                Continue
              </button>
              <button
                onClick={() => router.push(`/dashboard`)}
                className='underline text-xs lg:text-base font-bold'>
                Go to Dashboard
              </button>
            </div>
          </SuccessScreen>
        </div>
      );
    }
  }
}

export default Project;
