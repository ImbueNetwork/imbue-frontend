import { Dialog } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

import refundIcon from "../../assets/svgs/refund.svg"

type RefunScreenProps = {
    open: boolean;
    setOpen: (_open: boolean) => void;
};

const RefundScreen = (props: RefunScreenProps) => {
    const { open } = props;
    const router = useRouter()

    return (
        <Dialog
            open={open}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            className='p-2 lg:p-14 errorDialogue'
        >
            <div className='my-auto flex flex-col gap-3 items-center p-8 text-content'>
                <Image src={refundIcon} width={100} height={100} alt="refund icon" />

                <div className='mt-2 lg:mt-5'>
                    <p className='text-center text-lg lg:text-2xl font-bold text-content-primary'>
                        Cancelled!
                    </p>
                    <p className='text-center lg:text-xl my-2 lg:my-5 text-content'>This project has been refunded!</p>
                </div>
                <div className='flex flex-col gap-4 w-1/2'>
                    <button
                        onClick={() => router.push(`/dashboard`)}
                        className='primary-btn in-dark w-button w-full !m-0'
                    >
                        Go to dashboard
                    </button>
                </div>
            </div>
        </Dialog>
    )
};

export default RefundScreen;