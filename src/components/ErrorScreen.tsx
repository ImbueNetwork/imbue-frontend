import Dialog from '@mui/material/Dialog';
import React, { ReactNode } from 'react';

type ErrorScreenProps = {
  error: any;
  setError: (_e: any) => void;
  children: ReactNode;
};

const ErrorScreen = (props: ErrorScreenProps) => {
  const { error, setError } = props;
  const handleClose = () => {
    setError(null);
  };

  return (
    <Dialog
      open={error?.message ? true : false}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      className='p-14 errorDialogue'
    >
      <div className='my-auto flex flex-col gap-3 items-center p-8'>
        <div className='f-modal-icon f-modal-error animate'>
          <span className='f-modal-x-mark'>
            <span className='f-modal-line f-modal-left animateXLeft'></span>
            <span className='f-modal-line f-modal-right animateXRight'></span>
          </span>
          <div className='f-modal-placeholder'></div>
          <div className='f-modal-fix'></div>
        </div>

        <div className='mt-2 lg:mt-5'>
          <p className='text-center text-lg lg:text-2xl font-bold'>
            An unexpected error occured
          </p>
          <p className='text-center lg:text-xl my-2 lg:my-5'>
            {error?.message}
          </p>
        </div>

        {props.children}
      </div>
    </Dialog>
  );
};

export default ErrorScreen;
