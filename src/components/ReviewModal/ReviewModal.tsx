import Image from 'next/image';
import { BiArrowBack } from 'react-icons/bi';

export default function ReviewModal() {
  return (
    <div className='bg-white justify-center max-w-[31.938rem] px-12 text-center py-5 rounded-[18px]'>
      <div className='inline-block  bg-light-grey pt-2 pb-4 mt-12 mb-8  px-4 rounded-lg'>
        <Image src={'/review-icon.svg'} width={70} height={70} alt='icon' />
      </div>
      <h4 className='text-[27px]'>
        Have you Reviewed this Milestone Properly?
      </h4>
      <p className='text-base mt-4 '>
        You’ve read through the milestone expectations and the deliverables
        provided by the grant owner and can now vote for or against this
        project.
      </p>
      <div className='flex mb-5 space-x-3 w-full items-center mt-9'>
        <button className='border px-5 py-2  border-imbue-purple text-imbue-purple rounded-full'>
          Go back
        </button>
        <button
          className='primary-btn  ml-auto in-dark w-button w-[70%] '
          style={{ textAlign: 'center' }}
        >
          Yes, I am done
          <BiArrowBack className='rotate-180 ml-3 text-imbue-lime ' size={18} />
        </button>
      </div>
    </div>
  );
}
