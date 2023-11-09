import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Channel, DefaultGenerics, User } from 'stream-chat';

import { RootState } from '@/redux/store/store';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

export default function MessageComponent({
  handleMessageClick,
  props,
}: {
  props: Channel<DefaultGenerics>;
  handleMessageClick: any;
}) {
  const { user } = useSelector((state: RootState) => state.userState);

  const [targetUser, setTargetUser] = useState<User>();

  useEffect(() => {
    const key = Object.keys(props.state.members);
    Number(props.state.members[key[0]]?.user_id) === user.id
      ? setTargetUser(props.state.members[key[1]]?.user)
      : setTargetUser(props.state.members[key[0]]?.user);
  }, [props.state.members, user.id]);

  const handleClick = () => {
    handleMessageClick(targetUser?.id);
  };

  return (
    <div
      onClick={handleClick}
      className='flex items-center hover:bg-imbue-light-purple-three px-4 py-1 rounded-sm cursor-pointer text-black gap-5 text-sm'
    >
      <Image
        className='w-14 h-14 object-cover mb-2 rounded-full'
        src={
          targetUser?.profile_photo ||
          require('@/assets/images/profile-image.png')
        }
        width={40}
        height={40}
        alt='profile image'
      />
      <div className='flex border-b w-full pb-2 justify-between'>
        <div className=' space-y-1'>
          <p>{targetUser?.name}</p>
          <p className='text-text-aux-colour'>{props?.lastMessage()?.text}</p>
        </div>
        <p className='min-w-fit text-text-aux-colour'>
          {props?.lastMessage()?.created_at &&
            timeAgo.format(new Date(props?.lastMessage()?.created_at))}
        </p>
      </div>
    </div>
  );
}
