/* eslint-disable @typescript-eslint/ban-types */
import { Dialog } from '@mui/material';
import React from 'react';
// import Lottie from 'react-lottie';
const Lottie = dynamic(() => import('react-lottie'));

import dynamic from 'next/dynamic';

import animationIcon from '../../assets/svgs/warning_animation.json'


interface WarningScreenPropsType {
    open: boolean
    setOpen: (_open: boolean) => void;
    handler: Function;
    title: string;
}

const WarningScreen = ({ open, setOpen, handler, title }: WarningScreenPropsType) => {

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='p-14 errorDialogue'
        >
            <div className='my-auto flex flex-col gap-3 items-center p-8 text-content'>
                <div className={`w-fit h-fit rounded-full border-2 border-yellow-200 p-1`}>
                    <Lottie options={{
                        loop: false,
                        autoplay: true,
                        animationData: animationIcon,
                        rendererSettings: {
                            preserveAspectRatio: 'xMidYMid slice'
                        }
                    }}
                        height={130}
                        width={130}
                    />
                </div>

                <div className='mt-2 lg:mt-5'>
                    <p className='text-center text-lg lg:text-2xl font-bold text-content-primary'>
                        Are you sure you want to delete this {title}?
                    </p>
                    <p className='text-center lg:text-xl my-2 lg:my-5 text-content'>This action cannot be undone.</p>
                </div>
                <div className='flex flex-col gap-4 w-1/2'>
                    <button
                        onClick={() => {
                            setOpen(false);
                            handler()
                        }}
                        className='primary-btn in-dark w-button w-full !m-0'
                    >
                        Continue
                    </button>
                    <button
                        onClick={() => setOpen(false)}
                        className='underline text-xs lg:text-base font-bold'
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default WarningScreen;