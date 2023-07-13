import { Dialog } from '@mui/material';
import React, { ReactNode } from 'react';
import Lottie from 'react-lottie';

import animationIcon from '../assets/svgs/glassLoading.json'

type WaitingScreenProps = {
    open: boolean;
    setOpen: (_open: boolean) => void;
    children: ReactNode;
    title: string;
};

const WaitingScreen = (props: WaitingScreenProps) => {
    const { open, setOpen, title } = props;

    const handleClose = () => {
        setOpen(false);
    };

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationIcon,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='p-14 errorDialogue'
        >
            <div className='my-auto flex flex-col gap-3 items-center p-8 text-content'>
                <div className={`w-fit h-fit rounded-full border-2 border-yellow-200 p-1`}>
                    <Lottie options={defaultOptions}
                        height={130}
                        width={130}
                    />
                </div>

                <div className='mt-2 lg:mt-5'>
                    <p className='text-center text-lg lg:text-2xl font-bold text-content-primary'>
                        Please wait for a moment
                    </p>
                    <p className='text-center lg:text-xl my-2 lg:my-5 text-content'>{title}</p>
                </div>
                {props.children}
            </div>
        </Dialog>
    );
};

export default WaitingScreen;
