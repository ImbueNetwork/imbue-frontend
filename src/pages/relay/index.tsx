import {
  FilledInput,
  FormControl,
  InputAdornment,
  InputLabel,
} from '@mui/material';
import React, { useState } from 'react';

import { getServerSideProps } from '@/utils/serverSideProps';

const Relay = () => {
  const [_value, setValue] = useState('');
  return (
    <div className='bg-background p-10 rounded-2xl'>
      <h1 className='fund-h1'>My funds</h1>

      <p className='my-5 text-content'>Transfer KSM to Imbue Network</p>

      <FormControl
        className='transferFund'
        fullWidth
        sx={{ m: 1 }}
        color='secondary'
        variant='filled'
      >
        <InputLabel htmlFor='filled-adornment-amount'>
          Amount to transfer*
        </InputLabel>
        <FilledInput
          onChange={(e) => setValue(e.target.value)}
          className='pt-2 text-lg'
          id='filled-adornment-amount'
          startAdornment={
            <InputAdornment className='mr-' position='start'>
              KSM
            </InputAdornment>
          }
        />
      </FormControl>
      <button className='rounded-xl transition-colors duration-300 bg-background  hover:bg-primary hover:border-primary text-content shadow-lg border border-imbue-light-purple w-full py-5 text-lg'>
        Transfer
      </button>
    </div>
  );
};

export { getServerSideProps };

export default Relay;
