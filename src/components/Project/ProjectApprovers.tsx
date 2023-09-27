import { Skeleton } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Project, User } from '@/model';
import { getApproverProfiles } from '@/redux/services/projectServices';
import { RootState } from '@/redux/store/store';

type ProjectApproversType = {
    approversPreview: User[];
    project: Project;
    setIsApprover: (_value: boolean) => void;
    setApproverPreview: (_value: User[]) => void;
    projectOwner: User | undefined;
}

const ProjectApprovers = (props: ProjectApproversType) => {
    const { approversPreview, project, setIsApprover, setApproverPreview, projectOwner } = props;

    const { user } = useSelector(
        (state: RootState) => state.userState
    );

    const [loading, setLoading] = useState(true);

    const router = useRouter()

    useEffect(() => {
        const getAndSetApprovers = async () => {
            // setting approver list
            let approversPreviewList: any = [...approversPreview];

            try {
                // if (project?.approvers?.length) {
                //     const promises: Promise<User>[] = [];

                //     project?.approvers.map((approverAddress: any) => {
                //         if (approverAddress === user?.web3_address) setIsApprover(true);

                //         promises.push(utils.fetchUserByUsernameOrAddress(approverAddress))
                //     })

                //     const approversList = await Promise.all(promises)

                //     approversList.map((approver, index) => {
                //         if (approver?.id) {
                //             approversPreviewList.push(approver);
                //         } else {
                //             approversPreviewList.push({
                //                 id: 0,
                //                 display_name: '',
                //                 profile_photo: '',
                //                 username: '',
                //                 web3_address: project.approvers[index],
                //                 getstream_token: '',
                //             });
                //         }
                //     })

                // } else if (approversPreviewList.length === 0 && projectOwner) {
                //     approversPreviewList.push({
                //         id: projectOwner?.id,
                //         display_name: projectOwner?.display_name,
                //         profile_photo: projectOwner?.profile_photo,
                //         username: projectOwner?.username,
                //         web3_address: projectOwner?.web3_address,
                //         getstream_token: projectOwner?.getstream_token,
                //     });
                // }
                // setApproverPreview(approversPreviewList);

                if (project?.approvers?.length) {
                    const approvers = await getApproverProfiles(project.approvers)
                    approversPreviewList = approvers
                }
                else {
                    approversPreviewList = [
                        {
                            id: projectOwner?.id,
                            display_name: projectOwner?.display_name,
                            profile_photo: projectOwner?.profile_photo,
                            username: projectOwner?.username,
                            web3_address: projectOwner?.web3_address,
                            getstream_token: projectOwner?.getstream_token,
                        }
                    ]
                }

                if (
                    user.web3_address &&
                    (project?.approvers?.includes(user.web3_address) || projectOwner?.web3_address === user.web3_address)
                )
                    setIsApprover(true)

                setApproverPreview(approversPreviewList);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        project?.id && getAndSetApprovers()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id, setApproverPreview, user?.web3_address, setIsApprover, projectOwner?.id, projectOwner?.display_name, projectOwner?.profile_photo, projectOwner?.username, projectOwner?.web3_address, projectOwner?.getstream_token])

    if (loading || approversPreview?.length === 0) return (
        <div className='flex items-center gap-5'>
            {[1, 1, 1].map((approver: any, index: number) => (
                <div
                    key={index}
                    className={`flex text-content gap-4 items-center ${approver?.display_name && 'cursor-pointer'
                        }`}
                    onClick={() =>
                        approver.display_name &&
                        router.push(`/profile/${approver.username}`)
                    }
                >
                    <Skeleton animation="wave" variant="circular" width={40} height={40} />
                    <div className='flex flex-col'>
                        <Skeleton animation="wave" variant="text" sx={{ fontSize: '.9rem', width: 50 }} />
                        <Skeleton animation="wave" variant="text" sx={{ fontSize: '.6rem', width: 80 }} />
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div>
            {approversPreview?.length > 0 && (
                <div className='flex flex-row flex-wrap gap-10'>
                    {approversPreview?.map((approver: any, index: number) => (
                        <div
                            key={index}
                            className={`flex text-content gap-4 items-center ${approver?.display_name && 'cursor-pointer'
                                }`}
                            onClick={() =>
                                approver.display_name &&
                                router.push(`/profile/${approver.username}`)
                            }
                        >
                            <Image
                                height={80}
                                width={80}
                                src={
                                    approver?.profile_photo || require('../../assets/images/profile-image.png')
                                }
                                alt=''
                                className='rounded-full w-10 h-10 object-cover'
                            />
                            <div className='flex flex-col'>
                                <span className='text-base'>
                                    {approver?.display_name}
                                </span>
                                <p className='text-xs break-all text-imbue-purple-dark text-opacity-40'>
                                    {approver?.web3_address?.substring(0, 4) +
                                        '...' +
                                        approver?.web3_address?.substring(44)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectApprovers;