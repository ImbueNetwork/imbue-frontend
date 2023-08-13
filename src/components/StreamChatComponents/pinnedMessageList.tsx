import { Divider } from '@mui/material';
import classNames from 'classnames';
import { Dispatch, SetStateAction } from 'react';
import { Message } from 'stream-chat-react';

import { CloseThreadButton } from './CloseThreadButton';

export default function PinnedMessageList({
  pinnedMessage,
  isOpen,
  setOpen,
}: {
  pinnedMessage: any;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className={classNames(
        'absolute border-l-2 w-[28rem] transition-all  bg-white right-0 z-10',
        isOpen ? 'translate-x-0' : 'translate-x-[28rem]'
      )}
    >
      <div className=' py-4 px-6 flex items-center justify-between'>
        <div className='text-imbue-purple-dark'>
          Pinned Messages ({pinnedMessage.length})
        </div>
        <CloseThreadButton onClick={setOpen} />
      </div>
      <Divider className='mb-3' />
      <div className=' space-y-3 h-[65vh] px-5 overflow-y-auto'>
        {pinnedMessage.map((message: any) => (
          <Message
            groupStyles={['single']}
            key={message.id}
            message={message}
          />
        ))}
      </div>
    </div>
  );
}
