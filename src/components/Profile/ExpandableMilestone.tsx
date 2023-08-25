import { Tooltip } from "@mui/material";
import { WalletAccount } from "@talismn/connect-wallets";
import Image from "next/image";
import { useState } from "react";

import { initImbueAPIInfo } from "@/utils/polkadot";

import { Milestone, Project, User } from "@/model";
import ChainService from "@/redux/services/chainService";
import { updateProjectVotingState } from "@/redux/services/projectServices";

import AccountChoice from "../AccountChoice";
import ProjectStateTag from "../Project/ProjectStateTag";

type ExpandableDropDownsProps = {
    milestone: Milestone;
    index: number;
    modified: Date;
    vote: () => void;
    withdraw: () => void;
    setOpenVotingList: (_value: boolean) => void;
    setLoading: (_value: boolean) => void;
    setSuccess: (_value: boolean) => void;
    setSuccessTitle: (_value: string) => void;
    setError: (_value: any) => void;
    approversPreview: User[];
    firstPendingMilestone: number | undefined;
    projectInMilestoneVoting: boolean | undefined;
    isApplicant: boolean;
    canVote: boolean;
    user: User;
    projectType: 'grant' | 'brief' | null;
    isProjectOwner: boolean;
    balance: number;
    project: Project;
};

const ExpandableDropDowns = (props: ExpandableDropDownsProps) => {

    const { setLoading, project, setSuccess, setSuccessTitle, setError, milestone, index, modified, vote, withdraw, setOpenVotingList, approversPreview, firstPendingMilestone, projectInMilestoneVoting, isApplicant, canVote, user, projectType, isProjectOwner, balance } = props

    const [expanded, setExpanded] = useState(false);
    const [showPolkadotAccounts, setShowPolkadotAccounts] =
        useState<boolean>(false);
    const [submittingMilestone, setSubmittingMilestone] =
        useState<boolean>(false);
    const [milestoneKeyInView, setMilestoneKeyInView] = useState<number>(0);

    // submitting a milestone
    const submitMilestone = async (account: WalletAccount) => {
        setLoading(true);

        try {
            const imbueApi = await initImbueAPIInfo();
            const chainService = new ChainService(imbueApi, user);
            const result = await chainService.submitMilestone(
                account,
                milestone.chain_project_id,
                milestoneKeyInView
            );

            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (result.status || result.txError) {
                    if (result.status) {
                        const resp = await updateProjectVotingState(Number(project.id) || 500, true)
                        if (resp) {
                            setSuccess(true);
                            setSuccessTitle('Milestone Submitted Successfully');
                        } else {
                            setError({ message: "Server error. Could not update project voting status." })
                        }
                    } else if (result.txError) {
                        setError({ message: result.errorMessage });
                    }
                    break;
                }
                await new Promise((f) => setTimeout(f, 1000));
            }
        } catch (error: any) {
            setError({ message: `Internal server error. ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitMilestone = (milestone_index: number) => {
        setSubmittingMilestone(true)
        setShowPolkadotAccounts(true);
        setMilestoneKeyInView(milestone_index)
    }

    return (
        <div className='mb-2 relative bg-white px-5 border border-white rounded-2xl lg:px-12 max-width-750px:!pb-[30px]'>
            {showPolkadotAccounts && (
                <AccountChoice
                    accountSelected={async (account: WalletAccount) => {
                        if (submittingMilestone) {
                            submitMilestone(account);
                        }
                        // else if (raiseVoteOfNoConfidence) {
                        //     refund(account);
                        // } else if (withdrawMilestone) {
                        //     withdraw(account);
                        // } else {
                        //     await setVotingWalletAccount(account);
                        //     await setShowVotingModal(true);
                        // }
                    }}
                    visible={showPolkadotAccounts}
                    setVisible={setShowPolkadotAccounts}
                    initiatorAddress={project?.owner}
                    filterByInitiator
                />)
            }
            <div
                onClick={() => {
                    setExpanded(!expanded);
                }}
                className='py-6 flex justify-between w-full items-center max-width-750px:flex-col max-width-750px:flex cursor-pointer'
            >
                <div className='flex flex-row max-width-750px:w-full'>
                    <h3 className='text-[2rem] text-imbue-purple max-width-750px:text-[24px] font-normal leading-[60px]'>
                        Milestone {index + 1}
                    </h3>
                    <h3 className='text-[1.5rem] break-all text-imbue-purple ml-[32px] font-normal leading-[60px]'>
                        {milestone?.name}
                    </h3>
                </div>
                <div className='flex flex-row items-center max-width-750px:w-full max-width-750px:justify-between'>
                    {milestone?.is_approved ? (
                        <ProjectStateTag
                            openVotingList={setOpenVotingList}
                            dateCreated={modified}
                            text='Completed'
                            voters={approversPreview}
                            allApprovers={approversPreview}
                        />
                    ) : milestone?.milestone_index == firstPendingMilestone &&
                        projectInMilestoneVoting ? (
                        <ProjectStateTag
                            openVotingList={setOpenVotingList}
                            dateCreated={modified}
                            text='Ongoing'
                            voters={approversPreview}
                            allApprovers={approversPreview}
                        />
                    ) : (
                        <ProjectStateTag
                            openVotingList={setOpenVotingList}
                            dateCreated={modified}
                            text='Pending'
                            voters={approversPreview}
                            allApprovers={approversPreview}
                        />
                    )}
                    <Image
                        src={require(expanded
                            ? '@/assets/svgs/minus_btn.svg'
                            : '@/assets/svgs/plus_btn.svg')}
                        height={25}
                        width={25}
                        alt='dropdownstate'
                    />
                </div>
            </div>

            <div className={`${!expanded && 'hidden'} mb-6`}>
                <p className='text-[14px] font-normal text-imbue-purple'>
                    Percentage of funds to be released{' '}
                    <span className=' text-imbue-lemon'>
                        {milestone?.percentage_to_unlock}%
                    </span>
                </p>
                <p className='text-[14px] font-normal text-imbue-purple'>
                    Funding to be released{' '}
                    <span className='text-imbue-lemon'>
                        {Number(milestone?.amount)?.toLocaleString?.()} $IMBU
                    </span>
                </p>

                <p className=' text-base font-normal text-[#3B27C180] break-all leading-[178.15%] mt-[23px] w-[80%]'>
                    {milestone?.description}
                </p>

                {!isApplicant &&
                    milestone.milestone_index == firstPendingMilestone &&
                    projectInMilestoneVoting && (
                        <Tooltip
                            followCursor
                            title={
                                !canVote &&
                                `Only approvers are allowed to vote on a milestone and you cannot vote more than once.${user.web3_address &&
                                `You are currently on wallet: ${user.web3_address}`
                                }`
                            }
                        >
                            <button
                                className={`primary-btn in-dark w-button ${!canVote && '!bg-gray-300 !text-gray-400'
                                    } font-normal max-width-750px:!px-[40px] h-[2.6rem] items-center content-center !py-0 mt-[25px] px-8`}
                                data-testid='next-button'
                                onClick={() => canVote && vote()}
                            >
                                Vote
                            </button>
                        </Tooltip>
                    )}

                {(isApplicant || (projectType === 'grant' && isProjectOwner)) &&
                    milestone.milestone_index == firstPendingMilestone &&
                    !projectInMilestoneVoting &&
                    !milestone?.is_approved && (
                        <Tooltip
                            followCursor
                            title={
                                !balance &&
                                'The escrow wallet balance cannot be 0 while submiting a milestone'
                            }
                        >
                            <button
                                className={`primary-btn in-dark w-button mt-3 ${!balance &&
                                    '!bg-gray-300 !text-gray-400 !cursor-not-allowed'
                                    }`}
                                data-testid='next-button'
                                onClick={() => balance && handleSubmitMilestone(milestone.milestone_index)}
                            >
                                Submit
                            </button>
                        </Tooltip>
                    )}

                {isApplicant && milestone.is_approved && (
                    <button
                        className={`primary-btn in-dark w-button ${!balance && '!bg-gray-300 !text-gray-400'
                            } font-normal max-width-750px:!px-[40px] h-[43px] items-center content-center !py-0 mt-[25px] px-8`}
                        data-testid='next-button'
                        onClick={() => withdraw()}
                        disabled={!balance}
                    >
                        Withdraw
                    </button>
                )}
            </div>
        </div>
    );
};

export default ExpandableDropDowns