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
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import moment from "moment";
import AccountChoice from "@/components/AccountChoice";
import { Dialogue } from "@/components/Dialogue";
import ChatPopup from "@/components/ChatPopup";
import Login from "@/components/Login";
import { ProjectStatus } from "../api/models";

TimeAgo.addDefaultLocale(en);

type ExpandableDropDownsProps = {
  milestone: Milestone;
  index: number;
  modified: Date;
  vote: () => void;
  submitMilestone: () => void;
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
  const [submittingMilestone, setSubmittingMileStone] =
    useState<boolean>(false);
  const [showVotingModal, setShowVotingModal] = useState<boolean>(false);
  const [projectChainService, setProjectChainService] = useState<
    Record<any, any>
  >({});
  const [mileStoneKeyInView, setMileStoneKeyInview] = useState<number>(0);
  const [web3account, setWeb3Account] = useState<InjectedAccountWithMeta | any>(
    {}
  );
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const projectId: any = router?.query?.id || 0;
  const [milestoneBeingVotedOn, setMilestoneBeingVotedOn] = useState<number>();
  const [isApplicant, setIsApplicant] = useState<boolean>();

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
    const onChainProjectRes: ProjectOnChain = await chainService.getProject(
      projectId
    );
    setIsApplicant(onChainProjectRes.initiator == user.web3_address);
    setLoading(false);
    if (onChainProjectRes) {
      console.log("******");
      console.log(onChainProjectRes);
      console.log(OnchainProjectState[onChainProjectRes.projectState]);
      if (onChainProjectRes.projectState == OnchainProjectState.OpenForVoting) {
        const firstPendingMilestone =
          await chainService.findFirstPendingMilestone(
            onChainProjectRes.milestones
          );
        setMilestoneBeingVotedOn(firstPendingMilestone);
      }

      setOnChainProject(onChainProjectRes);
    }
  };

  const getProject = async () => {
    const projectRes = await getProjectById(projectId);
    setProject(projectRes);
    // api  project response
    const userResponse = await utils.getCurrentUser();
    await setUser(userResponse);
    await getChainProject();
    await getFreelancerData(userResponse?.username);
  };

  const getFreelancerData = async (freelancerName: string) => {
    const freelanceRes = await getFreelancerProfile(freelancerName);
    setFreelancer(freelanceRes);
  };

  // voting on a mile stone
  const voteMileStone = async (web3Account: any, booleanValue: boolean) => {
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    const userRes: User | any = await utils.getCurrentUser();
    const chainService = new ChainService(imbueApi, userRes);
    const voteResponse = await chainService.voteOnMilestone(
      web3Account,
      onChainProject,
      mileStoneKeyInView,
      booleanValue
    );
    setLoading(false);
    console.log({ voteResponse });
  };

  // submitting a mile stone
  const submitMileStone = async (account: InjectedAccountWithMeta) => {
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    const user: User | any = await utils.getCurrentUser();
    const chainService = new ChainService(imbueApi, user);
    const result = await chainService.submitMilestone(
      account,
      onChainProject,
      mileStoneKeyInView
    );
    while (true) {
      if (result.status || result.txError) {
        if (result.status) {
          console.log("***** success");
          console.log(result.eventData);
        } else if (result.txError) {
          console.log("***** failed");
          console.log(result.errorMessage);
        }
        break;
      }
      await new Promise((f) => setTimeout(f, 1000));
    }
    setLoading(false);
  };

  const renderPolkadotJSModal = (
    <div>
      <AccountChoice
        accountSelected={async (account: InjectedAccountWithMeta) => {
          if (submittingMilestone) {
            await submitMileStone(account);
          } else {
            await setWeb3Account(account);
            await setShowVotingModal(true);
          }
          await setShowPolkadotAccounts(false);
        }}
        closeModal={() => setShowPolkadotAccounts(false)}
        initiator_address={onChainProject?.initiator}
        filterByInitiator
      />
    </div>
  );

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
                voteMileStone(web3account, true);
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
                voteMileStone(web3account, false);
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

  const approvedMilStones = project?.milestones?.filter?.(
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
  }: ExpandableDropDownsProps) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="transparent-conatainer relative !bg-[#2c2c2c] !py-[20px] !border !border-white rounded-[20px]">
        <div
          onClick={() => {
            setExpanded(!expanded);
          }}
          className="flex justify-between w-full items-center"
        >
          <div className="flex flex-row">
            <h3 className="text-[39px] font-normal leading-[60px]">
              Milestone {index + 1}
            </h3>
            <h3 className="text-[24px] ml-[32px] font-normal leading-[60px]">
              {milestone?.name}
            </h3>
          </div>
          <div className="flex flex-row items-center">
            {milestone?.is_approved
              ? projectStateTag(modified, "Completed")
              : (milestone?.milestone_key == milestoneBeingVotedOn)
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

          <p className="text-[16px] font-normal text-[#a6a6a6] leading-[178.15%] mt-[23px] w-[80%]">
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

          {milestone.milestone_key == milestoneBeingVotedOn && (
            <button
              className="primary-btn in-dark w-button font-normal h-[43px] items-center content-center !py-0 mt-[25px] px-8"
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
                className="primary-btn in-dark w-button font-normal h-[43px] items-center content-center !py-0 mt-[25px] px-8"
                data-testid="next-button"
                onClick={() => submitMilestone()}
              >
                Submit
              </button>
            )}
        </div>
      </div>
    );
  };

  return (
    <div>
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
      <div className="flex flex-row bg-[#2c2c2c] border border-opacity-25 -border--theme-light-white rounded-[20px] p-[50px]">
        <div className="flex flex-col gap-[20px] flex-grow flex-shrink-0 basis-[75%] mr-[5%]">
          <div className="brief-title">
            <h3 className="text-[32px] leading-[1.5] font-normal m-0 p-0">
              {project?.name}
            </h3>
            <span
              onClick={() => {
                // project?.brief_id
              }}
              className="text-[#b2ff0b] cursor-pointer text-[20px] font-normal !m-0 !p-0 relative top-4"
            >
              View full brief
            </span>
          </div>
          <div className="text-inactive w-[80%]">
            <p className="text-[16px] font-normal leading-[178.15%]">
              {project?.description}
            </p>
          </div>
          <p className="text-inactive text-[16px] font-normal leading-[1.5] m-0 p-0">
            Posted {timePosted}
          </p>

          <p className="text-white text-[20px] font-normal leading-[1.5] mt-[16px] p-0">
            Freelancer hired
          </p>

          <div className="flex flex-row items-center mt-[20px]">
            <Image
              src={require("@/assets/images/profile-image.png")}
              alt="freelaner-icon"
              height={50}
              width={50}
              className="border border-solid border-white rounded-[25px]"
            />

            <p className="text-white text-[20px] font-normal leading-[1.5] p-0 mx-[27px]">
              {freelancer?.display_name}
            </p>

            <button
              onClick={() =>
                handleMessageBoxClick(project?.user_id, freelancer?.username)
              }
              className="primary-btn in-dark w-button !mt-0 font-normal h-[43px] items-center content-center !py-0 ml-[40px] px-8"
              data-testid="next-button"
            >
              Message
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-[50px] flex-grow flex-shrink-0 basis-[20%]">
          <div className="flex flex-col">
            <div className="flex flex-row">
              <Image
                src={require("@/assets/svgs/shield.svg")}
                height={24}
                width={24}
                alt={"shieldIcon"}
              />

              <h3 className="text-xl leading-[1.5] ml-[24px] font-normal m-0 p-0">
                Milestone{" "}
                <span className="text-[#BAFF36]">
                  {approvedMilStones?.length}/{project?.milestones?.length}
                </span>
              </h3>
            </div>
            {/* mile stone step indicator */}
            <div className="w-48 bg-[#1C2608] mt-5 h-1 relative my-auto">
              <div
                style={{
                  width: `${
                    (onChainProject?.milestones?.filter?.(
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
                    className={`h-4 w-4 ${
                      m.is_approved ? "Accepted-button" : "bg-[#1C2608]"
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
              <h3 className="text-xl leading-[1.5] ml-[24px] font-normal m-0 p-0">
                {Number(project?.total_cost_without_fee)?.toLocaleString()}{" "}
                $IMBU
              </h3>
            </div>

            <div className="text-inactive ml-[20%] mt-[7px]">
              Budget - Fixed
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-row ">
              <Image
                src={require("@/assets/svgs/calendar_icon.svg")}
                height={24}
                width={24}
                alt={"calenderIcon"}
              />

              <h3 className="text-xl leading-[1.5] ml-[24px] font-normal m-0 p-0">
                1 to 3 months
              </h3>
            </div>

            <div className="text-inactive  ml-[20%] mt-[7px]">Timeline</div>
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
                await setSubmittingMileStone(false);
                // setMile stone key in view
                await setMileStoneKeyInview(milestone.milestone_key);
              }}
              submitMilestone={async () => {
                // set submitting mile stone to true
                await setSubmittingMileStone(true);
                // show polkadot account modal
                await setShowPolkadotAccounts(true);
                // setMile stone key in view
                await setMileStoneKeyInview(milestone.milestone_key);
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
    </div>
  );
}

export default Project;
