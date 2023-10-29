import Image from 'next/image';
import { useRouter } from 'next/router';
import { AiOutlineHeart } from 'react-icons/ai';
import { BiMessageRoundedDetail } from 'react-icons/bi';
import { HiOutlineTicket } from 'react-icons/hi';

import { Freelancer } from '@/model';

export default function FreelancerCard({
  freelancer,
  handleMessage,
}: {
  freelancer: Freelancer;
  handleMessage: any;
}) {
  const router = useRouter();
  return (
    <div className='border min-w-[28.75rem]  px-5 py-5 rounded-2xl '>
      <div className='flex items-center gap-2'>
        <Image
          className='w-14 h-14 rounded-full'
          alt='freelancer profile'
          src={'/profile-image.png'}
          width={40}
          height={40}
        />
        <div
          className='cursor-pointer'
          onClick={() => router.push(`/freelancers/${freelancer?.username}`)}
        >
          <p className='text-imbue-purple-dark  text-2xl'>
            {freelancer?.display_name?.substring(0, 15)}.
          </p>
          <p className='text-sm text-[#494949]'>
            {freelancer?.title?.substring(0, 20)}
            {freelancer?.title?.length > 20 && '...'}
          </p>
        </div>
        <p className='flex ml-auto bg-imbue-lime-light text-imbue-purple px-3 py-1 text-sm rounded-full gap-1 items-center'>
          Avilable
          <div className='w-2 h-2 rounded-full bg-lime-900' />
        </p>
      </div>
      <div className='my-5 items-center flex justify-between'>
        <p className='text-lg text-imbue-purple-dark'>
          $50-$75 <span className='text-xs'>hr</span>
        </p>
        <p className='text-xs'>
          Job Success rate <span className='text-imbue-purple'>99.2%</span>
        </p>
      </div>
      <div className='flex text-xs gap-5'>
        {[1, 2, 3, 4].map(
          (item: number, index: number) =>
            index < freelancer?.skills?.length && (
              <p
                key={item}
                className='bg-imbue-light-grey gap-0.5 flex items-center text-black px-2 py-1 rounded-full'
              >
                <HiOutlineTicket
                  size={16}
                  className='rotate-180 text-[#404040]'
                />
                {freelancer?.skills?.at(index)?.name}
              </p>
            )
        )}
        {freelancer?.skills?.length > 4 && (
          <p className='border px-2 py-1  rounded-full'>
            + {freelancer?.skills?.length - 4}
          </p>
        )}
      </div>
      <hr className='my-9' />
      <div className='flex gap-3'>
        <p className='border px-4 rounded-3xl items-center flex border-imbue-purple'>
          <AiOutlineHeart
            size={20}
            className='text-imbue-purple'
            color='imbue-purple'
          />
        </p>
        <p
          onClick={() => handleMessage(freelancer?.user_id)}
          className='bg-imbue-purple flex items-center gap-1 justify-center  px-7 py-2 w-full text-white text-sm rounded-full cursor-pointer'
        >
          Connect Freelancer
          <BiMessageRoundedDetail size={18} />
        </p>
      </div>
    </div>
  );
}
