import { Dialog } from '@mui/material';
import React, { ReactNode } from 'react';

type SuccessScreenProps = {
  open: boolean;
  setOpen: (_open: boolean) => void;
  children: ReactNode;
  title: string;
};

const SuccessScreen = (props: SuccessScreenProps) => {
  const { open, setOpen, title } = props;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      className='p-14 errorDialogue'
    >
      <div className='my-auto flex flex-col gap-3 items-center p-8'>
        <div className='f-modal-alert'>
          <div className='f-modal-icon f-modal-success animate'>
            <span className='f-modal-line f-modal-tip animateSuccessTip'></span>
            <span className='f-modal-line f-modal-long animateSuccessLong'></span>
            <div className='f-modal-placeholder'></div>
            <div className='f-modal-fix'></div>
          </div>
        </div>

        <div className='mt-2 lg:mt-5'>
          <p className='text-center text-lg lg:text-2xl font-bold'>
            Congratulations!
          </p>
          <p className='text-center lg:text-xl my-2 lg:my-5'>{title}</p>
        </div>

        {props.children}
      </div>
    </Dialog>
  );
};

export default SuccessScreen;
