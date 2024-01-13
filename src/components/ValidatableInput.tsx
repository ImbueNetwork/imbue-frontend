import { TextField } from '@mui/material';
import React, { ChangeEvent, useState } from 'react';

import { isUrlExist } from '@/utils/helper';

const ValidatableInput = (props: any) => {
  const {
    minLength = 10,
    maxLength = 50,
    name = 'Input',
    onChange: handleOnChange,
    hideLimit = false,
    value,
  } = props;

  const [error, setError] = useState<string>('');

  const handleInput = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    if (minLength && (value === undefined || value === null || value.length === 0)) {
      setError(`${name} cannot be empty`);
    } else if (value.length < minLength || value.length > maxLength) {
      setError(
        `Valid ${name} is required between ${minLength} and ${maxLength}`
      );
    } else if (
      (name === 'title' || name === 'education') &&
      isUrlExist(value)
    ) {
      setError(`URL is not allowed in ${name}`);
    } else {
      setError('');
    }

    handleOnChange(event);
  };

  return (
    <div className='w-full'>
      <TextField
        id='outlined-multiline-static'
        {...props}
        inputProps={{
          maxLength,
          className: "text-xs md:text-base"
        }}
        InputProps={{ className: "p-2 md:p-4" }}
        onChange={(e) => handleInput(e)}
        className={'w-full !mb-0'}
        multiline
        color='secondary'
        autoComplete='off'
      />
      <div className='flex justify-between items-center gap-2'>
        <p className='mt-2 text-imbue-coral text-sm text-left lg:text-right capitalize-first'>
          {error}
        </p>
        {!hideLimit && (
          <p className='mt-2 text-content-primary text-sm text-right'>
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default ValidatableInput;
