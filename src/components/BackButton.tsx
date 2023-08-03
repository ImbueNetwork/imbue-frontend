
import ArrowBackIcon from '@mui/icons-material/ChevronLeft'; 
import { Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';


const BackButton = () => {
    const router = useRouter()
    return (
        <Tooltip
            title='Go back to previous page'
            followCursor
            leaveTouchDelay={10}
            enterDelay={500}
            className='cursor-pointer hover:bg-content-primary group'
        >
            <div
                onClick={() => router.back()}
                className='border border-transparent hover:border-content rounded-full flex items-center justify-center relative cursor-pointer right-10'
            >
                <ArrowBackIcon className='h-7 w-7 group-hover:text-white' color='secondary' />
            </div>
        </Tooltip>
    );
};

export default BackButton;