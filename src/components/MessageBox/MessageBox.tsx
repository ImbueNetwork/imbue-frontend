import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  AiOutlineFlag,
  AiOutlineInfoCircle,
  AiOutlinePlus,
} from 'react-icons/ai';
import { BsArchive, BsEmojiSmile, BsPinAngle } from 'react-icons/bs';
import { IoImageOutline } from 'react-icons/io5';
import { VscMention } from 'react-icons/vsc';
import { useSelector } from 'react-redux';
import {
  Channel,
  DefaultGenerics,
  FormatMessageResponse,
  User,
} from 'stream-chat';

import { RootState } from '@/redux/store/store';

import MessageItem from './MessageItem';

type lastMessageType = {
  date: Date;
  user_id: number;
};

let lastMessage: lastMessageType | null = null;

export default function MessageBox({
  channel,
}: {
  channel: Channel<DefaultGenerics>;
}) {
  const { user } = useSelector((state: RootState) => state.userState);
  const [targetUser, setTargetUser] = useState<User>();
  const [messages, setMessages] =
    useState<FormatMessageResponse<DefaultGenerics>[]>();

  useEffect(() => {
    const key = Object.keys(channel.state?.members);
    Number(channel.state.members[key[0]]?.user_id) === user.id
      ? setTargetUser(channel.state.members[key[1]]?.user)
      : setTargetUser(channel.state.members[key[0]]?.user);
    const { messages } = channel.state.messageSets[0];
    setMessages(messages);
  }, [channel.state.members, channel.state.messageSets, user.id, channel]);

  const handleChnages = (e: any) => {
    channel.keystroke();
  };

  return (
    <div className="border-[4px] h-full bg-[url('/message-box-pattern.svg')] back  rounded-2xl">
      {/* messaging header sections */}
      <div className='bg-white justify-between items-center flex rounded-xl px-5 py-3'>
        <div className='flex'>
          <div className='w-14 justify-self-start  relative'>
            <Image
              className='w-12 h-12  object-cover rounded-full'
              src={
                targetUser?.profile_photo ||
                require('@/assets/images/profile-image.png')
              }
              width={100}
              height={200}
              alt='image'
            />
            <div
              className={classNames(
                'w-3 h-3 absolute -bottom-0.5 border-2 right-3  rounded-full',
                targetUser?.online
                  ? 'bg-[#437EF7]'
                  : 'border-white bg-[#DAE0E6]'
              )}
            />
          </div>
          <div>
            <p className='text-black'>{targetUser?.name}</p>
            <p className='text-text-aux-colour text-sm'>
              {targetUser?.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className='flex text-text-aux-colour gap-7 items-center'>
          <BsArchive size={20} />
          <BsPinAngle size={22} className='-rotate-45' />
          <AiOutlineFlag size={22} />
          <AiOutlineInfoCircle size={22} />
        </div>
      </div>
      {/* messaging header sections ends */}
      <div className='h-[60vh]  overflow-auto'>
        {messages?.map((item, index) => {
          let bool = false;
          if (!lastMessage) {
            lastMessage = {
              date: item.created_at,
              user_id: Number(item.user?.id),
            };
          }

          if (index + 1 >= messages.length) {
            bool = true;
          } else if (
            new Date(messages[index + 1].created_at).getUTCMinutes() -
              new Date(lastMessage.date).getUTCMinutes() >
              2 ||
            lastMessage.user_id !== Number(messages[index + 1].user?.id)
          ) {
            bool = true;
            lastMessage = {
              date: messages[index + 1].created_at,
              user_id: Number(messages[index + 1].user?.id),
            };
          }
          return (
            <MessageItem
              key={new Date(item.created_at).getMilliseconds()}
              user={user}
              message={item}
              showProfile={bool}
            />
          );
        })}
      </div>
      <div className='bg-white py-2 mx-2 px-2 rounded-lg'>
        <TextareaAutosize
          placeholder='type here'
          onChange={handleChnages}
          minRows={2}
          maxRows={2}
          className='outline-none placeholder:text-text-aux-colour border-none text-black'
        />
        <div className='text-text-aux-colour gap-2 flex items-center'>
          <AiOutlinePlus
            className='hover:text-black cursor-pointer'
            size={21}
          />
          <p className='text-lg'>|</p>
          <VscMention className='hover:text-black cursor-pointer' size={28} />
          <BsEmojiSmile className='hover:text-black cursor-pointer' size={18} />
          <IoImageOutline
            className='hover:text-black cursor-pointer'
            size={20}
          />
        </div>
      </div>
    </div>
  );
}
