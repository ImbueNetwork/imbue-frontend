import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

export default function BriefComponent({ brief }: { brief: any }) {
  const router = useRouter();
  const [user_Activites, setUserActivites] = useState({
    totalSpent: 0,
    totalHire: 0,
    activeHire: 0,
  });
  useEffect(() => {
    let totalSpent = 0;
    let totalHire = 0;
    let activeHire = 0;
    for (const project of brief.user_hire_history) {
      if (project.project_status === 6) totalSpent += Number(project.cost);
      if (project.project_status === 4 || project.status === 5) activeHire++;
      if (project.project_status !== 0) totalHire++;
    }
    setUserActivites({ totalSpent, activeHire, totalHire });
  }, [brief]);

  return (
    <div className='flex border-b hover:bg-imbue-light-purple-three cursor-pointer last:border-b-0'>
      <div
        onClick={() => router.push(`/briefs/${brief.id}`)}
        className='py-9 px-7 max-w-[70%] w-full break-words'
      >
        <p className='text-2xl text-imbue-purple-dark'>{brief.headline}</p>
        <div className='flex text-sm text-imbue-dark-coral gap-5 mt-5'>
          <p className='px-3 flex items-center gap-1 rounded-xl py-1 bg-imbue-light-coral '>
            <TbNorthStar size={18} />
            {brief.experience_level}
          </p>
          <p className='px-3 rounded-xl flex gap-1 items-center py-1 bg-imbue-light-coral '>
            <AiOutlineCalendar size={18} />
            Posted {timeAgo.format(new Date(brief.created))}
          </p>
          <p className='px-3 flex items-center gap-1 rounded-xl py-1 bg-imbue-light-coral '>
            <AiOutlineClockCircle size={18} />
            {brief.duration}
          </p>
          <p className='px-3 flex items-center gap-1 rounded-xl py-1 bg-imbue-light-coral '>
            <HiOutlineCurrencyDollar size={20} />
            Fixed price
          </p>
        </div>
        <div className='mt-7'>
          <p className='text-black text-sm'>
            {brief.description.length > 500
              ? brief.description.substring(0, 500)
              : brief.description}
            {brief.description.length > 500 && (
              <span className='text-imbue-purple ml-1 cursor-pointer underline'>
                more
              </span>
            )}
          </p>
        </div>
        <div className='flex gap-2 mt-5'>
          {[0, 1, 2, 3].map(
            (item) =>
              brief.skills.at(item) && (
                <p
                  key={'skills' + item}
                  className='text-imbue-purple flex items-center gap-1 bg-imbue-light-purple-three px-4 rounded-full py-1'
                >
                  {brief.skills.at(item)?.name}
                  <AiOutlinePlus color='black' size={18} />
                </p>
              )
          )}
          {brief.skills.length - 4 > 0 && (
            <p className='text-imbue-purple flex items-center gap-1 bg-imbue-light-purple-three px-4 rounded-full py-1'>
              {brief.skills.length - 4} more
            </p>
          )}
        </div>
      </div>
      <div className='max-w-[30%] w-full py-7 border-l'>
        <div className='px-7 flex gap-2 pb-4 border-b'>
          <Image
            className='w-9 h-9 rounded-full'
            src={
              brief.owner_photo || require('@/assets/images/profile-image.png')
            }
            width={40}
            height={40}
            alt='profile'
          />
          <div>
            <p
              onClick={() => {
                router.push(`/profile/${brief.owner_name}`);
              }}
              className='text-black'
            >
              {brief.created_by}
            </p>
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
            {brief.number_of_briefs_submitted}
          </p>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-1.5'>
              <HiOutlineCurrencyDollar size={20} />
            </span>
            $
            {user_Activites.totalSpent >= 1000
              ? Math.trunc(user_Activites.totalSpent / 1000) + 'k'
              : user_Activites.totalSpent}{' '}
            total spent
          </p>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-2'>
              <TbUsers size={18} />
            </span>
            {user_Activites.totalHire} hires,{user_Activites.activeHire} active
          </p>
        </div>
        <div className='text-xs pt-3 px-7 text-black'>
          {/* <Rating
            className='text-base'
            name='text-feedback'
            value={4.68}
            readOnly
            precision={0.5}
            emptyIcon={
              <StarIcon style={{ opacity: 0.55 }} fontSize='inherit' />
            }
          /> */}
          <div className='flex mt-1 justify-between'>
            {/* <p>4.68 of 40 reviews</p> */}
            <p>Member since: {timeAgo.format(new Date(brief.joined))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
