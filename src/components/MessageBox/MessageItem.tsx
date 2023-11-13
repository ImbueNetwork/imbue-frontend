import classNames from 'classnames';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Image from 'next/image';
import { DefaultGenerics, FormatMessageResponse } from 'stream-chat';

import { User } from '@/model';

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

export default function MessageItem({
  message,
  user,
  showProfile,
}: {
  user: User;
  showProfile: boolean;
  message: FormatMessageResponse<DefaultGenerics>;
}) {
  if (Number(message.user?.id) === user?.id) {
    return (
      <div
        className={classNames(
          'flex flex-row-reverse items-center gap-2 ',
          showProfile ? ' mt-1 mb-9' : 'my-1'
        )}
      >
        {showProfile && (
          <Image
            className='w-10 mb-7 h-10 rounded-full object-cover'
            src={
              user.profile_photo || require('@/assets/images/profile-image.png')
            }
            width={70}
            height={70}
            alt='profile image'
          />
        )}
        {!showProfile && <div className='w-10 h-10' />}
        <div className='flex  flex-col items-end'>
          <div className='bg-imbue-lime-light  px-4 py-1.5 rounded-2xl text-right text-black'>
            <p>{message.text}</p>
          </div>
          {showProfile && (
            <p className='text-[#7C8B9D]'>
              {timeAgo.format(new Date(message.created_at))}
            </p>
          )}
        </div>
      </div>
    );
  }
  return (
    <div
      className={classNames(
        'flex items-center gap-2 ',
        showProfile ? ' mt-1 mb-9' : 'my-1'
      )}
    >
      {showProfile && (
        <Image
          className='w-10 mb-7 h-10 rounded-full object-cover'
          src={
            message.user?.profile_photo ||
            require('@/assets/images/profile-image.png')
          }
          width={70}
          height={70}
          alt='profile image'
        />
      )}
      {!showProfile && <div className='w-10 h-10' />}
      <div className='flex flex-col items-start'>
        <div className='bg-white px-4 py-1.5 rounded-2xl text-right text-black'>
          <p>{message.text}</p>
        </div>
        {showProfile && (
          <p className='text-[#7C8B9D] ml-2'>
            {timeAgo.format(new Date(message.created_at))}
          </p>
        )}
      </div>
    </div>
  );
}
