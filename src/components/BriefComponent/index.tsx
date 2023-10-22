import StarIcon from '@mui/icons-material/Star';
import { Rating } from '@mui/material';
import Image from 'next/image';
import {
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlinePlus,
} from 'react-icons/ai';
import { HiOutlineCurrencyDollar } from 'react-icons/hi';
import { TbNorthStar } from 'react-icons/tb';
import { TbUsers } from 'react-icons/tb';
import { TfiEmail } from 'react-icons/tfi';
import { VscVerified } from 'react-icons/vsc';

export default function BriefComponent() {
  return (
    <div className='flex border-b'>
      <div className='py-9 px-7'>
        <p className='text-2xl text-imbue-purple-dark'>
          Product Development Engineer
        </p>
        <div className='flex text-sm text-imbue-dark-coral gap-5 mt-5'>
          <p className='px-3 flex items-center gap-1 rounded-xl py-1 bg-imbue-light-coral '>
            <TbNorthStar size={18} />
            Intermediate
          </p>
          <p className='px-3 rounded-xl flex gap-1 items-center py-1 bg-imbue-light-coral '>
            <AiOutlineCalendar size={18} />
            Posted 3 hours ago
          </p>
          <p className='px-3 flex items-center gap-1 rounded-xl py-1 bg-imbue-light-coral '>
            <AiOutlineClockCircle size={18} />
            4-5 Weeks
          </p>
          <p className='px-3 flex items-center gap-1 rounded-xl py-1 bg-imbue-light-coral '>
            <HiOutlineCurrencyDollar size={20} />
            Fixed price
          </p>
        </div>
        <div className='mt-7'>
          <p className='text-black text-sm'>
            The Digital Designer Intern is responsible for assisting the
            creative team in the design and development of digital marketing
            materials, including websites, social media graphics, and email
            campaigns. The intern will work closely with the Creative Director
            and other designers to...{' '}
            <span className='text-imbue-purple underline'>more</span>
          </p>
        </div>
        <div className='flex gap-2 mt-5'>
          <p className='text-imbue-purple flex items-center gap-1 bg-imbue-light-purple-three px-4 rounded-full py-1'>
            Product Development
            <AiOutlinePlus color='black' size={18} />
          </p>
          <p className='text-imbue-purple flex items-center gap-1 bg-imbue-light-purple-three px-4 rounded-full py-1'>
            Health
            <AiOutlinePlus color='black' size={18} />
          </p>
          <p className='text-imbue-purple flex items-center gap-1 bg-imbue-light-purple-three px-4 rounded-full py-1'>
            Wellness
            <AiOutlinePlus color='black' size={18} />
          </p>
        </div>
      </div>
      <div className='w-[45%] py-7 border-l'>
        <div className='px-7 flex gap-2 pb-4 border-b'>
          <Image
            className='w-9 h-9 rounded-full'
            src='/profile-image.png'
            width={40}
            height={40}
            alt='profile'
          />
          <div>
            <p className='text-black'>Ethereum Organization</p>
            <p className='text-sm'>Company Hire</p>
          </div>
        </div>
        <div className='text-black border-b text-sm py-3 space-y-2 px-9'>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-2'>
              <VscVerified size={20} />
            </span>
            Payment method verified
          </p>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-2 ml-0.5'>
              <TfiEmail size={16} />
            </span>
            20 Briefs posted
          </p>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-1.5'>
              <HiOutlineCurrencyDollar size={20} />
            </span>
            $19k total spent
          </p>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-2'>
              <TbUsers size={18} />
            </span>
            59 hires,6 active
          </p>
        </div>
        <div className='text-xs pt-3 px-7 text-black'>
          <Rating
            className='text-base'
            name='text-feedback'
            value={4.68}
            readOnly
            precision={0.5}
            emptyIcon={
              <StarIcon style={{ opacity: 0.55 }} fontSize='inherit' />
            }
          />
          <div className='flex mt-1 justify-between'>
            <p>4.68 of 40 reviews</p>
            <p>Member since: Aug 17,2023</p>
          </div>
        </div>
      </div>
    </div>
  );
}
