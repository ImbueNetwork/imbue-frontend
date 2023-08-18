import { Backdrop } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import { appLoader } from '@/assets/svgs';

const spinnerStyle = {
    height: '200px',
    width: '200px',
    animation: 'rotation 4s infinite linear',
  };

const BackDropLoader = ({ open }: { open: boolean }) => {
    return (
        <Backdrop
        
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={open}
        >
            <Image className='animate-spin duration' src={appLoader} alt={'spinner'} style={spinnerStyle} />
        </Backdrop>
    );
};

export default BackDropLoader;