/* eslint-disable react-hooks/exhaustive-deps */
import { Skeleton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import 'stream-chat-react/dist/css/v2/index.css';

import { getStreamChat } from '@/utils';

import { User } from '@/model';

import MessageBox from './MessageBox/MessageBox';

export type ChatProps = {
  user: User;
  targetUser: User;
  setShowMessageBox: (_show: boolean) => void;
  showMessageBox: boolean;
  chatPopUp?: boolean;
  showFreelancerProfile: boolean;
};

function CustomSkeletonLoading() {
  return (
    <div className='h-full bg-background'>
      <div className='w-full flex !gap-3 items-center pl-2 pr-8 !py-2 str-chat__channel-header'>
        <Skeleton variant='circular' width={48} height={48} />
        <Skeleton variant='text' sx={{ fontSize: '1rem', width: '16rem' }} />
      </div>

      <div className='flex flex-col gap-10 pt-5 px-3 h-full border-t border-t-imbue-light-purple'>
        {[4, 4, 4, 4].map((value, index) => (
          <div
            key={index}
            className={`flex gap-2 ${index % 2 == 1 && 'flex-row-reverse'}`}
          >
            <Skeleton variant='circular' width={48} height={48} />
            <div>
              <Skeleton
                variant='text'
                sx={{
                  fontSize: '1rem',
                  width: '6rem',
                  marginLeft: `${index % 2 == 1 ? 'auto' : '0'}`,
                }}
              />
              <Skeleton
                variant='text'
                sx={{ fontSize: '1rem', width: '16rem' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className='w-full flex justify-evenly items-center absolute bottom-0 str-chat__channel-header !gap-2'>
        <Skeleton variant='text' sx={{ fontSize: '2rem', width: '20rem' }} />
        <Skeleton variant='circular' width={30} height={30} />
      </div>
    </div>
  );
}

export const ChatBox = ({
  user,
  targetUser,
  showMessageBox,
  setShowMessageBox,
  chatPopUp,
}: ChatProps) => {
  const [content, setContent] = useState<any>(<CustomSkeletonLoading />);

  useEffect(() => {
    async function setup() {
      try {
        const client = await getStreamChat();

        if (client) {
          const currentChannel = `${targetUser.display_name} <> ${user.display_name}`;

          await client.connectUser(
            {
              id: String(user.id),
              name: user.display_name,
            },
            user.getstream_token
          );

          const channel = client.channel('messaging', {
            image:
              targetUser.profile_photo ||
              'https://www.drupal.org/files/project-images/react.png',
            name: currentChannel,
            members: [String(user.id), String(targetUser.id)],
          });

          await channel.watch();

          setContent(
            <MessageBox
              handleChatPopUp={setShowMessageBox}
              chatpopup={chatPopUp}
              channel={channel}
            />
          );
        }
      } catch (error) {
        setContent(<p>GETSTREAM_API_KEY not found</p>);
      }
    }
    setup();
  }, [user, targetUser, showMessageBox]);

  return content;
};
