import { Dialog } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { getFreelancerProfile } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

import FullScreenLoader from '../FullScreenLoader';
import { AppContext, AppContextType } from '../Layout';


const SwitchToFreelancer = () => {
    const router = useRouter()

    const { setProfileMode } = useContext(AppContext) as AppContextType

    const { user, loading: loadingUser } = useSelector(
        (state: RootState) => state.userState
    );

    const [open, setOpen] = useState<boolean>(true)
    const [success, setSuccess] = useState<boolean>(false)
    const [loading, setloading] = useState<boolean>(true)
    const [isFreelancer, setIsFreelancer] = useState<boolean>(false)

    useEffect(() => {
        setloading(true)

        const checkFreelancerProfile = async () => {
            try {
                const freelancer = await getFreelancerProfile(user?.username);
                if (!freelancer?.id) setIsFreelancer(false);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            } finally {
                setloading(false);
            }
        }
        checkFreelancerProfile()
    }, [loadingUser, router, user?.username]);

    if (loadingUser || loading) return <FullScreenLoader />

    return (
        <Dialog
            open={open}
            // onClose={() => setOpen(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='p-14 errorDialogue'
        >
            {
                isFreelancer
                    ? (
                        <div className='my-auto flex flex-col gap-3 items-center p-8 text-content'>
                            <div className='f-modal-icon f-modal-error animate'>
                                <span className='f-modal-x-mark'>
                                    <span className='f-modal-line f-modal-left animateXLeft'></span>
                                    <span className='f-modal-line f-modal-right animateXRight'></span>
                                </span>
                                <div className='f-modal-placeholder'></div>
                                <div className='f-modal-fix'></div>
                            </div>

                            <div className='mt-2 lg:mt-5'>
                                <p className='text-center text-lg lg:text-2xl font-bold text-content-primary'>
                                    You do not have a freelancer account.
                                </p>
                                <p className='text-center lg:text-xl my-2 lg:my-5 text-content whitespace-pre-line !leading-relaxed'>
                                    Do you want to join as a freelancer to complete this action?
                                </p>
                            </div>

                            <div className='flex flex-col gap-4 w-1/2'>
                                <button
                                    onClick={() => router.push(`/freelancers/new`)}
                                    className='primary-btn in-dark min-w-fit w-button w-2/5 !m-0'
                                >
                                    Continue
                                </button>
                                <button
                                    onClick={() => router.push(`/dashboard`)}
                                    className='underline text-xs lg:text-base font-bold'
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    )
                    : (
                        <div className=''>
                            {
                                success
                                    ? (
                                        <div className='my-auto flex flex-col gap-3 items-center p-8 text-content'>
                                            <div className='f-modal-alert'>
                                                <div className='f-modal-icon f-modal-success animate'>
                                                    <span className='f-modal-line f-modal-tip animateSuccessTip'></span>
                                                    <span className='f-modal-line f-modal-long animateSuccessLong'></span>
                                                    <div className='f-modal-placeholder'></div>
                                                    <div className='f-modal-fix'></div>
                                                </div>
                                            </div>

                                            <div className='mt-2 lg:mt-5'>
                                                <p className='text-center text-lg lg:text-2xl font-bold text-content-primary'>
                                                    Congratulations!
                                                </p>
                                                <p className='text-center lg:text-xl my-2 lg:my-5 text-content'>You are now in freelancer profile</p>
                                            </div>

                                            <div className='flex flex-col gap-4 w-1/2'>
                                                <button
                                                    onClick={() => {
                                                        setOpen(false)
                                                        setSuccess(false)
                                                        setProfileMode('freelancer')
                                                    }}
                                                    className='primary-btn in-dark min-w-fit w-button w-2/5 !m-0'
                                                >
                                                    Continue
                                                </button>
                                                {/* <button
                                                    onClick={() => {
                                                        setSuccess(false)
                                                        setProfileMode('client')
                                                    }}
                                                    className='underline text-xs lg:text-base font-bold'
                                                    >
                                                    Back to Client Profile
                                                    </button> */}
                                            </div>
                                        </div>
                                    )
                                    : (
                                        <div className='my-auto flex flex-col gap-3 items-center p-8 text-content'>
                                            <div>
                                                <Image src={require('../../../public/peer-to-peer.png')} alt='' />
                                            </div>

                                            <div className='mt-2 lg:mt-5'>
                                                <p className='text-center lg:text-xl my-2 lg:mt-5 text-content'>You are currently in client profile.</p>
                                                <p className='text-center lg:text-xl mt-1 lg:mb-5 text-content'>You must switch to freelancer profile for accessing this page</p>
                                            </div>
                                            <div className='flex flex-col gap-4 w-1/2'>
                                                <button
                                                    onClick={() => { setSuccess(true) }}
                                                    className='primary-btn in-dark w-button w-full !m-0'
                                                >
                                                    Switch to Freelancer
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard`)}
                                                    className='underline text-xs lg:text-base font-bold'
                                                >
                                                    Go to Dashboard
                                                </button>
                                            </div>
                                        </div>
                                    )
                            }
                        </div>
                    )
            }

        </Dialog>
    );
};

export default SwitchToFreelancer;
