import Image from 'next/image';
import { BiArrowBack } from 'react-icons/bi';

interface VotingModalProps {
  setVisible: (_visible: boolean) => void;
  setLoading: (_loading: boolean) => void;
  handleRefund: () => void;
  handleVote: (_vote: boolean) => Promise<void>;
}

export default function RefundModal({
  setVisible,
  handleRefund,
  handleVote,
  setLoading
}: VotingModalProps) {

  const handleNoVote = async (): Promise<void> => {
    setLoading(true)
    setVisible(false);
    await handleVote(false);
    setLoading(false)
  }

  return (
    <div className='bg-white  max-w-[31.938rem] text-left rounded-[18px]'>
      <div className='inline-block bg-light-grey pt-2 pb-4 mt-12 mb-8  px-4 rounded-lg'>
        <Image src={'/wallet.svg'} width={70} height={70} alt='icon' />
      </div>
      <div className='text-left'>
        <h4 className='text-[27px]'>Should a refund be initiated?</h4>
        <p className='text-base mt-4 '>
          A refund can be made when you vote against a milestone deliverables
          and believe strongly that its deliverables is not quantifiable by
          expected milestones.
        </p>
        <div className='flex mb-5 space-x-3 w-full items-center mt-9'>
          <button
            onClick={handleNoVote}
            className='border px-5 py-2  border-imbue-purple text-imbue-purple rounded-full w-[30%]'
          >
            No
          </button>
          <button
            onClick={() => {
              handleRefund()
              setVisible(false)
            }}
            className='primary-btn  ml-auto in-dark w-button w-[70%] '
            style={{ textAlign: 'center' }}
          >
            Yes, initiate refund
            <BiArrowBack
              className='rotate-180 ml-3 text-imbue-lime '
              size={18}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
