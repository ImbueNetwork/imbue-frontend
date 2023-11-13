import Image from 'next/image';

interface VotingModalProps {
  vote: boolean;
  setVisible: (_visible: boolean) => void;
  undergoingRefund: boolean;
}

export default function SuccessRefundModal({
  setVisible,
  vote,
  undergoingRefund
}: VotingModalProps) {
  return (
    <div className='bg-white justify-center max-w-[31.938rem] text-center rounded-[18px]'>
      <div className='inline-block  bg-light-grey pt-2 pb-4 mt-12 mb-8  px-4 rounded-lg'>
        <Image src={require('../../assets/svgs/refundInit.svg')} width={70} height={70} alt='icon' />
      </div>
      <h4 className='text-[27px]'>{
        !vote
          ? "Thanks for initiating a refund"
          : "Thank you for your vote on refunding this grant"
      }</h4>
      <p className='text-base  mt-4 mb-9'>
        {
          (undergoingRefund && !vote)
            ? "This project at this time would be put on hold and the approvers would be notified to vote on this refund request."
            : "This project is currently on hold and the approvers are needed to vote on this refund request"
        }
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
