
import ArrowBackIcon from '@mui/icons-material/ChevronLeft';
import { Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';


const BackButton = (props: JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>) => {
    const router = useRouter()
    return (
        <div {...props}>
            <Tooltip
                title='Go back to previous page'
                followCursor
                leaveTouchDelay={10}
                enterDelay={500}
                className='cursor-pointer hover:bg-content-primary group'
            >
                <div
                    onClick={() => router.back()}
                    className='border border-transparent hover:border-content rounded-full flex items-center justify-center cursor-pointer'
                >
                    <ArrowBackIcon className='h-7 w-7 group-hover:text-white' color='secondary' />
                </div>
            </Tooltip>
        </div>
    );
};

export default BackButton;