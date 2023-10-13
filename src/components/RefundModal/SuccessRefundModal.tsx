import Image from 'next/image';

interface VotingModalProps {
  // visible: boolean;
  setVisible: (_visible: boolean) => void;
}

export default function SuccessRefundModal({
  setVisible,
}: VotingModalProps) {
  return (
    <div className='bg-white justify-center max-w-[31.938rem] text-center rounded-[18px]'>
      <div className='inline-block  bg-light-grey pt-2 pb-4 mt-12 mb-8  px-4 rounded-lg'>
        <Image src={require('../../assets/svgs/refundInit.svg')} width={70} height={70} alt='icon' />
      </div>
      <h4 className='text-[27px]'>Thanks for initiating a refund</h4>
      <p className='text-base  mt-4 mb-9'>
        This project at this time would be put on hold and the approvers would
        be notified to vote on this refund request.
      </p>

      <button
        className='primary-btn  ml-auto in-dark w-button w-full '
        style={{ textAlign: 'center' }}
        onClick={() => {
          setVisible(false);
          window.location.reload();
        }}
      >
        Close
      </button>
    </div>
  );
}
