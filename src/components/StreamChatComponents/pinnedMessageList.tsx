import { Divider } from '@mui/material';
import classNames from 'classnames';
import { Dispatch, SetStateAction } from 'react';
import { Message, Modal } from 'stream-chat-react';

import { CloseThreadButton } from './CloseThreadButton';

export default function PinnedMessageList({
  pinnedMessage,
  isOpen,
  setOpen,
  jumpToMessage,
}: {
  pinnedMessage: any;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  jumpToMessage: (_message: any) => void;
}) {
  const clickHandler = async (message: any) => {
    setOpen(false);
    await jumpToMessage(message.id);
  };
  return (
    <Modal open={isOpen} onClose={() => setOpen(false)}>
      <div className={classNames(' w-full rounded-3xl bg-white  z-10')}>
        <div className=' py-4 px-6 flex items-center justify-between'>
          <div className='text-imbue-purple-dark'>
            Pinned Messages ({pinnedMessage.length})
          </div>
          <CloseThreadButton onClick={setOpen} />
        </div>
        <Divider className='mb-3' />
        <div className=' space-y-3 h-[65vh] px-5 overflow-y-auto'>
          {pinnedMessage.map((message: any) => (
            <div
              key={message.id}
              className='cursor-pointer'
              onClick={() => clickHandler(message)}
            >
              <Message
                groupStyles={['single']}
                key={message.id}
                message={message}
                messageListRect={undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
