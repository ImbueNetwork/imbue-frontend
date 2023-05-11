import { Freelancer, Project, User } from '@/model';
import { Brief } from '@/pages/api/models';
import { useMediaQuery } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';
import AccountChoice from '../AccountChoice';
import { initImbueAPIInfo } from '@/utils/polkadot';
import ChainService from '@/redux/services/chainService';
import { blake2AsHex } from '@polkadot/util-crypto';
import { WalletAccount } from '@talismn/connect-wallets';
import { useRouter } from 'next/router';

type ApplicationOwnerProps = {
    briefOwner: any;
    brief: Brief;
    handleMessageBoxClick: Function;
    freelancer: Freelancer;
    application: Project | any;
    setLoading: Function;
    updateProject: (chainProjectId?: number) => void;
    user: User | any
}

const ApplicationOwnerHeader = (props: ApplicationOwnerProps) => {
    const {
        briefOwner,
        brief,
        handleMessageBoxClick,
        freelancer,
        application,
        setLoading,
        updateProject,
        user
    } = props

    const [openPopup, setOpenPopup] = useState(false)
    const mobileView = useMediaQuery('(max-width:480px)');

    const router = useRouter();
    const { applicationId }: any = router.query;

    const applicationStatusId = ['Draft', 'Pending Review', 'Changes Requested', 'Rejected', 'Accepted'];

    const startWork = async (account: WalletAccount) => {
        setLoading(true);
        const imbueApi = await initImbueAPIInfo();
        const chainService = new ChainService(imbueApi, user);
        delete application.modified;
        const briefHash = blake2AsHex(JSON.stringify(application));
        const result = await chainService?.commenceWork(account, briefHash);
        while (true) {
            if (result.status || result.txError) {
                if (result.status) {
                    console.log('***** success');
                    const projectId = parseInt(result.eventData[2]);
                    while (true) {
                        const projectIsOnChain = await chainService.getProjectOnChain(projectId);
                        if (projectIsOnChain) {
                            await updateProject(projectId);
                            router.push(`/projects/${applicationId}`);
                            break;
                        }
                        await new Promise((f) => setTimeout(f, 1000));
                    }
                } else if (result.txError) {
                    console.log('***** failed');
                    console.log(result.errorMessage);
                }
                break;
            }
            await new Promise((f) => setTimeout(f, 1000));
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center w-full lg:justify-between lg:px-10 flex-wrap">
            <div className="flex gap-5 items-center">
                <Image className="w-16 h-16 rounded-full object-cover cursor-pointer"
                    src={require('@/assets/images/profile-image.png')}
                    priority
                    alt="profileImage" />
                <p className="text-2xl font-bold">{briefOwner?.display_name}</p>
            </div>
            {
                <p className="text-base text-primary break-words text-center ml-3">@
                    {(mobileView && briefOwner?.username?.length > 16)
                        ? `${briefOwner?.username.substr(0, 16)}...`
                        : briefOwner?.username
                    }
                </p>
            }

            <div className='ml-auto lg:ml-0'>
                <button className="primary-btn in-dark w-button !text-xs lg:!text-base" onClick={() => brief && handleMessageBoxClick(brief?.user_id, freelancer?.username)}>
                    Message
                </button>
                {application?.status_id === 4 ? (
                    <button className="Accepted-btn text-black in-dark text-xs lg:text-base rounded-full py-[7px] px-3 ml-3 lg:ml-0 lg:px-6 md:py-[14px]" onClick={() => brief?.project_id && setOpenPopup(true)} >
                        Start Work
                    </button>
                ) : (
                    <button className={`${applicationStatusId[application?.status_id]}-btn in-dark text-xs lg:text-base rounded-full py-3 px-3 lg:px-6 lg:py-[14px]`}>{applicationStatusId[application?.status_id]}</button>
                )}
            </div>
            <AccountChoice accountSelected={(account) => startWork(account)} visible={openPopup} setVisible={setOpenPopup} initiatorAddress={application?.initiator} filterByInitiator />
        </div>
    );
};

export default ApplicationOwnerHeader;