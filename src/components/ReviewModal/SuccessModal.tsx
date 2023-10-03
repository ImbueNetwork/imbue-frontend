import { Modal } from '@mui/material';
import Image from 'next/image';

interface VotingModalProps {
  visible: boolean;
  setVisible: (_visible: boolean) => void;
}

export default function SuccessModal({
  visible,
  setVisible,
}: VotingModalProps) {
  return (
    <Modal open={visible} className='flex justify-center items-center'>
      <div className='bg-white justify-center max-w-[31.938rem] px-12 text-center py-5 rounded-[18px]'>
        <div className='inline-block  bg-light-grey pt-2 pb-4 mt-12 mb-8  px-4 rounded-lg'>
          <Image src={'/celebrate.svg'} width={70} height={70} alt='icon' />
        </div>
        <h4 className='text-[27px]'>Thanks for voting</h4>
        <p className='text-base mt-4 mb-9'>
          Your vote helps us provide funding for amazing products
        </p>

        <button
          className='primary-btn  ml-auto in-dark w-button w-full '
          style={{ textAlign: 'center' }}
          onClick={() => {
            setVisible(false);
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
