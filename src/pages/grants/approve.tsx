import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';

import { displayState, OffchainProjectState, Project } from '@/model';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

const Approvers = () => {
    const [myApplications, _setMyApplications] = useState<Project[]>();

    const router = useRouter()

    const [error, setError] = useState<any>()
    const [loadingStreamChat, setLoadingStreamChat] = useState<any>()

    const {
        user,
        loading: loadingUser,
    } = useSelector((state: RootState) => state.userState);

    useEffect(() => {
        const setupStreamChat = async () => {
            try {
                if (!user?.username && !loadingUser) return router.push('/');

                // setClient(await getStreamChat());
                // _setBriefs(await getUserBriefs(user?.id));
                _setMyApplications(await getFreelancerApplications(user?.id));
            } catch (error) {
                setError(error);
            } finally {
                setLoadingStreamChat(false);
            }
        };

        setupStreamChat();
    }, [user, loadingUser, router]);

    const redirectToApplication = (applicationId: string) => {
        router.push(`/briefs/applications/${applicationId}`);
    };

    const redirectToDiscoverBriefs = () => {
        router.push(`/briefs`);
    };

    if (loadingStreamChat || loadingUser) return <FullScreenLoader />

    return (
        <>
            <h3 className='mb-3'>Grants to approve</h3>
            {
                myApplications?.length ? (
                    <div className='bg-[#2c2c2c] border border-light-white relative rounded-[0.75rem] overflow-hidden'>
                        {myApplications?.map(
                            (application: any, index: number) =>
                                !application?.chain_project_id && (
                                    <div
                                        key={index}
                                        onClick={() => application?.id && redirectToApplication(application?.id?.toString())}
                                        className='hover:bg-secondary-dark-hover min-h-[100px] border-b border-b-light-white last:border-b-0 flex px-5 py-3 lg:px-[2.5rem] lg:py-[2rem] cursor-pointer gap-[2rem]'
                                    >
                                        <div className='w-4/5 flex items-center'>
                                            <h3 className='text-sm lg:text-xl font-bold mb-3'>
                                                {application?.name}
                                            </h3>
                                        </div>
                                        <div className='flex flex-col gap-2 justify-evenly items-center ml-auto'>
                                            <span className='text-xs lg:text-base'>
                                                {timeAgo?.format(new Date(application?.created))}
                                            </span>
                                            <div
                                                className={`px-4 py-2 w-fit rounded-full text-xs lg:text-base ${OffchainProjectState[application.status_id]
                                                    }-button `}
                                            >
                                                {displayState(application.status_id)}
                                            </div>
                                        </div>
                                    </div>
                                )
                        )}
                    </div>
                ) : (
                    <div className='w-full flex justify-center mt-6'>
                        <button
                            onClick={() => {
                                redirectToDiscoverBriefs();
                            }}
                            className='primary-btn in-dark w-button lg:w-1/3'
                            style={{ textAlign: 'center' }}
                        >
                            Discover Briefs
                        </button>
                    </div>
                )
            }

            {
                myApplications?.length ? (
                    <>
                        <h3 className='mb-3 mt-10'>Currently Reviewing</h3>
                        <div className='bg-[#2c2c2c] border border-light-white relative rounded-[0.75rem] overflow-hidden'>
                            {myApplications?.map(
                                (application: any, index: number) =>
                                    application?.chain_project_id && (
                                        <div
                                            key={index}
                                            onClick={() => router.push(`/projects/${application?.id}`)}
                                            className='hover:bg-secondary-dark-hover min-h-[100px] border-b border-b-light-white last:border-b-0 flex px-5 py-3 lg:px-[2.5rem] lg:py-[2rem] cursor-pointer gap-[2rem]'
                                        >
                                            <div className='w-4/5 flex items-center'>
                                                <h3 className='text-sm lg:text-xl font-bold mb-3'>
                                                    {application?.name}
                                                </h3>
                                            </div>
                                            <div className='flex flex-col gap-2 justify-evenly items-center ml-auto'>
                                                <span className='text-xs lg:text-base'>
                                                    {timeAgo?.format(new Date(application?.created))}
                                                </span>
                                                <div
                                                    className={`px-4 py-2 w-fit rounded-full text-xs lg:text-base ${OffchainProjectState[application.status_id]
                                                        }-button `}
                                                >
                                                    {displayState(application.status_id)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                            )}
                        </div>
                    </>
                ) : (
                    <></>
                )
            }

            <ErrorScreen error={error} setError={setError}>
                <div className='flex flex-col gap-4 w-1/2'>
                    <button
                        onClick={() => router.push(`/`)}
                        className='primary-btn in-dark w-button w-full !m-0'
                    >
                        Log In
                    </button>
                </div>
            </ErrorScreen>
        </>
    );
}

export default Approvers;