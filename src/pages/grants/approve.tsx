import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';

import { Brief } from '@/model';
import { getAllBriefs } from '@/redux/services/briefService';
import { RootState } from '@/redux/store/store';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

const Approvers = () => {
    const [grants, setGrants] = useState<Brief[]>();

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

                const totalGrants: any = await getAllBriefs(5, 1)
                setGrants(totalGrants?.currentData);
            } catch (error) {
                setError({message: error});
            } finally {
                setLoadingStreamChat(false);
            }
        };

        setupStreamChat();
    }, [user, loadingUser, router]);

    if (loadingStreamChat || loadingUser) return <FullScreenLoader />

    return (
        <div className='hq-layout px-3 lg:px-0'>
            <h3 className='mb-6 text-xl lg:text-2xl'>Grants to review</h3>
            {
                grants?.length ? (
                    <div className='bg-[#2c2c2c] border border-light-white relative rounded-[0.75rem] overflow-hidden'>
                        {grants?.map(
                            (application: any, index: number) => (
                                <div
                                    key={index}
                                    // onClick={() => application?.id && redirectToApplication(application?.id?.toString())}
                                    className='hover:bg-secondary-dark-hover min-h-[100px] border-b border-b-light-white last:border-b-0 flex items-center px-5 py-3 lg:px-[2.5rem] lg:py-[2rem] cursor-pointer gap-[2rem]'
                                >
                                    <div className='w-9/12 flex flex-col gap-2'>
                                        <h3 className='text-sm lg:text-xl font-bold mb-3'>
                                            {application?.headline}
                                        </h3>
                                        <p className='text-xs lg:text-lg'>
                                            Created by : <span className="text-primary">{application?.created_by}</span>
                                        </p>
                                        <span className='text-xs lg:text-lg'>
                                            Budget : ${application?.budget}
                                        </span>
                                        <span className='text-xs lg:text-lg'>
                                            {application?.description}
                                        </span>
                                        <span className='text-xs lg:text-sm mt-5'>
                                            {timeAgo?.format(new Date(application?.created))}
                                        </span>
                                    </div>
                                    <div className='w-2/12 flex flex-col gap-2 items-center ml-auto'>

                                        <span className='text-xs lg:text-lg'>Milestones</span>
                                        <span className='text-primary text-sm lg:text-xl'>3</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className='w-full flex justify-center mt-6'>
                        <h3>No Grant to review</h3>
                    </div>
                )
            }

            {
                grants?.length ? (
                    <>
                        <h3 className='mb-6 mt-12 lg:mt-20 text-xl lg:text-2xl'>Currently Reviewing</h3>
                        <div className='bg-[#2c2c2c] border border-light-white relative rounded-[0.75rem] overflow-hidden'>
                            {grants?.map(
                                (application: any, index: number) => (
                                    <div
                                        key={index}
                                        // onClick={() => application?.id && redirectToApplication(application?.id?.toString())}
                                        className='hover:bg-secondary-dark-hover min-h-[100px] border-b border-b-light-white last:border-b-0 flex items-center px-5 py-3 lg:px-[2.5rem] lg:py-[2rem] cursor-pointer gap-[2rem]'
                                    >
                                        <div className='w-9/12 flex flex-col gap-2'>
                                            <h3 className='text-sm lg:text-xl font-bold mb-3'>
                                                {application?.headline}
                                            </h3>
                                            <p className='text-xs lg:text-lg'>
                                                Created by : <span className="text-primary">{application?.created_by}</span>
                                            </p>
                                            <span className='text-xs lg:text-lg'>
                                                Budget : ${application?.budget}
                                            </span>
                                            <span className='text-xs lg:text-lg'>
                                                {application?.description}
                                            </span>
                                            <span className='text-xs lg:text-sm mt-5'>
                                                {timeAgo?.format(new Date(application?.created))}
                                            </span>
                                        </div>
                                        <div className='w-2/12 flex flex-col gap-2 items-center ml-auto'>

                                            <span className='text-xs lg:text-lg text-center ml-auto'>Milestones Approved</span>
                                            <span className='text-primary text-sm lg:text-xl'>3/5</span>
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
        </div>
    );
}

export default Approvers;