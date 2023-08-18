import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PushPinIcon from '@mui/icons-material/PushPin';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  useChannelActionContext,
  useChannelStateContext,
  useChatContext,
} from 'stream-chat-react';

import PinnedMessageList from './pinnedMessageList';

export function CustomChannelHeader(props: any) {
  const { closeChat, chatPopUp, targetUser, showFreelancerProfile } = props;
  const router = useRouter();

  const { members = {}, watcher_count } = useChannelStateContext();
  const { client, channel } = useChatContext();
  const [pinnedMessage, setPinnedMessage] = useState<any>([]);
  const [isOpen, setOpen] = useState(false);
  const { jumpToMessage } = useChannelActionContext();

  const membersCount = Object.keys(members).length;
  let chatTitle = 'Not Found';
  let username = 'Not Found';

  Object.keys(members).forEach(function (key) {
    if (membersCount === 2 && key !== client.userID) {
      username = members[key]?.user?.username || 'Not Found'
      chatTitle = members[key]?.user?.name || "Unknown User"
    }
  });

  const navigateToProfile = () => {
    if (username !== 'Not Found') {
      if (showFreelancerProfile) router.push(`/freelancers/${username}`);
      else router.push(`/profile/${username}`);
    }
  };
  
  const getPinedMessage = async () => {
    const channelState = await client
      .channel('messaging', channel?.id)
      .query({});

    const pinnedMessages = channelState.pinned_messages;
    setPinnedMessage(pinnedMessages);
    setOpen(true);
  };

  return (
    <>
      <div className='py-2 flex justify-between items-center lg:py-3 border-b border-b-imbue-light-purple'>
        <div
          onClick={navigateToProfile}
          className='w-fit flex gap-2 lg:gap-3 items-center ml-3 cursor-pointer'
        >
          {!chatPopUp && (
            <span className='md:hidden' onClick={closeChat}>
              <ArrowBackIcon />
            </span>
          )}
          <div className='relative'>
            <Image
              src={
                targetUser?.profile_photo ||
                require('@/assets/images/profile-image.png')
              }
              width={140}
              height={140}
              className='w-9 h-9 lg:w-12 lg:h-12 rounded-full object-cover object-top'
              alt='profileImage'
            />
            {watcher_count && watcher_count >= 2 && (
              <div className='h-4 w-4 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-black'></div>
            )}
          </div>
          <div className='flex flex-col items-start'>
            <span className='header-pound font-bold text-sm lg:text-lg break-words max-w-[130px] md:max-w-full text-imbue-purple'>
              {chatTitle.length > 22
                ? `${chatTitle?.substring(0, 22)}...`
                : chatTitle}
            </span>
          </div>
        </div>
        {!chatPopUp && (
          <p
            onClick={getPinedMessage}
            className='mr-5 p-2 border rounded-full cursor-pointer flex text-xs items-center'
          >
            <PushPinIcon />
          </p>
        )}
      </div>
      {!chatPopUp && (
        <PinnedMessageList
          jumpToMessage={jumpToMessage}
          isOpen={isOpen}
          pinnedMessage={pinnedMessage}
          setOpen={setOpen}
        />
      )}
    </>
  );
}
