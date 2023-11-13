import classNames from 'classnames';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Channel, DefaultGenerics, User } from 'stream-chat';

import { RootState } from '@/redux/store/store';
TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

export default function ChannelListItem({
  channel,
  setChannel,
  selectedChannel,
}: {
  channel: Channel<DefaultGenerics>;
  setChannel: any;
  selectedChannel: Channel | null;
}) {
  const { user } = useSelector((state: RootState) => state.userState);
  const [targetUser, setTargetUser] = useState<User>();

  useEffect(() => {
    const key = Object.keys(channel.state?.members);
    Number(channel.state.members[key[0]]?.user_id) === user.id
      ? setTargetUser(channel.state.members[key[1]]?.user)
      : setTargetUser(channel.state.members[key[0]]?.user);
  }, [channel.state?.members, user.id]);

  return (
    <div
      onClick={() => setChannel(channel)}
      className={classNames(
        'flex px-3 rounded-md border-l-2 h-[6rem] border-white hover:border-imbue-lime cursor-pointer hover:bg-imbue-lime-light gap-3 py-4',
        selectedChannel?.id === channel.id ? 'bg-imbue-lime-light' : 'bg-white'
      )}
    >
      <div className='w-14 justify-self-start  relative'>
        <Image
          className='w-11 h-11  object-cover rounded-full'
          src={
            targetUser?.profile_photo ||
            require('@/assets/images/profile-image.png')
          }
          width={20}
          height={20}
          alt='image'
        />
        <div
          className={classNames(
            'w-3 h-3 absolute bottom-5 border-2 right-0  rounded-full',
            targetUser?.online ? 'bg-[#437EF7]' : 'border-white bg-[#DAE0E6]'
          )}
        />
      </div>
      <div className='w-full'>
        <div className='text-black items-center flex justify-between'>
          <p>
            {targetUser?.name?.length && targetUser?.name?.length < 15
              ? targetUser?.name
              : targetUser?.name?.substring(0, 15) + '...'}
          </p>
          <p className='text-text-aux-colour text-sm'>
            {channel?.lastMessage()?.created_at &&
              timeAgo.format(new Date(channel?.lastMessage()?.created_at))}
          </p>
        </div>
        <p className='text-text-aux-colour mt-1'>
          {channel?.lastMessage()?.text?.substring(0, 20)}
        </p>
      </div>
    </div>
  );
}
