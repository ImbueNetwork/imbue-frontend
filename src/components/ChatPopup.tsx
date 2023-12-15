import { StyledEngineProvider } from '@mui/material';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import React from 'react';

import { ChatBox } from '@/components/Chat';

import { User } from '@/model';

interface ChatPopupProps {
  showMessageBox: boolean;
  setShowMessageBox: (_visible: boolean) => void;
  browsingUser: User | null;
  targetUser: User | null;
  showFreelancerProfile: boolean;
}

const ChatPopup = (props: ChatPopupProps) => {
  const {
    showMessageBox,
    setShowMessageBox,
    browsingUser,
    targetUser,
    showFreelancerProfile,
  } = props;



  return (
    <StyledEngineProvider injectFirst>
      <Slide
        direction='up'
        className='z-10  chat-popup'
        in={showMessageBox}
        mountOnEnter
        unmountOnExit
      >
        <Box>
          <div className='relative bg-imbue-light-grey h-full border border-imbue-light-purple'>
            {/* <div
              className='w-5 cursor-pointer absolute top-2 right-1 z-10 font-semibold text-content-primary'
              onClick={() => setShowMessageBox(false)}
            >
              x
            </div> */}
            {browsingUser && targetUser ? (
              <ChatBox
                user={browsingUser}
                targetUser={targetUser}
                setShowMessageBox={setShowMessageBox}
                showMessageBox={showMessageBox}
                chatPopUp={true}
                showFreelancerProfile={showFreelancerProfile}
              ></ChatBox>
            ) : (
              <p>GETSTREAM_API_KEY not found</p>
            )}
          </div>
        </Box>
      </Slide>
    </StyledEngineProvider>
  );
};

export default ChatPopup;
