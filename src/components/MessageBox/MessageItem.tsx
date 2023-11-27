import { Modal } from '@mui/material';
import classNames from 'classnames';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { BsEmojiSmile, BsThreeDotsVertical } from 'react-icons/bs';
import { FormatMessageResponse } from 'stream-chat';
import useOnClickOutside from 'use-onclickoutside';

import {
  deleteMessage,
  sendMessageReaction,
  setPinMessage,
  setUnPinMessage,
} from '@/utils/MessageOptions';

import { User } from '@/model';

import ImageCurosal from './ImageCurosal';

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

export interface CustomMessage extends FormatMessageResponse {
  parent_message: FormatMessageResponse;
}

export default function MessageItem({
  message,
  user,
  showProfile,
  handleReplayMessage,
}: {
  handleReplayMessage: (_message: FormatMessageResponse) => void;
  user: User;
  showProfile: boolean;
  message: CustomMessage | any;
}) {
  const [isModal, setModal] = useState<string | false>(false);
  const [modal, setModal1] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModal) {
        setModal(false);
      }
    };
    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [isModal]);

  const handlePopOver = () => {
    setModal1((val) => !val);
  };

  const handleCloseModal = () => {
    setModal1(false);
  };
  useOnClickOutside(modalRef, handleCloseModal);
  useOnClickOutside(emojiRef, () => setIsEmojiModalOpen(false));

  if (Number(message.user?.id) === user?.id) {
    return (
      <>
        <Modal
          className='flex justify-center items-center'
          open={isModal ? true : false}
          onClose={() => setModal(false)}
        >
          <ImageCurosal
            Images={message.attachments}
            activeSlide={isModal ? isModal : ''}
          />
        </Modal>

        <div
          id={message.id}
          className={classNames(
            'flex group flex-row-reverse items-end gap-2 ',
            message.parent_id ? 'mt-9' : showProfile ? ' mt-1 mb-9' : 'my-1'
          )}
        >
          {showProfile && (
            <Image
              className='w-10 mb-5 h-10 rounded-full object-cover'
              src={
                user.profile_photo ||
                require('@/assets/images/profile-image.png')
              }
              width={70}
              height={70}
              alt='profile image'
            />
          )}
          {!showProfile && <div className='w-10 h-10' />}
          <div className='flex relative h-auto flex-row-reverse gap-3 items-center w-full'>
            {message.parent_id && (
              <div className='bg-gray-300 absolute cursor-pointer  -top-8 rounded-3xl pt-1.5 pb-2 min-w-fit text-gray-600 px-5'>
                {message.parent_message?.attachments?.length > 0 && (
                  <p>Attachments</p>
                )}
                <p>
                  {message.parent_message?.text?.length &&
                  message.parent_message?.text?.length > 50
                    ? message.parent_message?.text?.substring(0, 50) + '...'
                    : message.parent_message?.text}
                </p>
              </div>
            )}
            <div className='flex  relative max-w-[70%]  flex-col items-end'>
              {message.pinned && !message.deleted_at && (
                <Image
                  src={'/pin.png'}
                  width={1920}
                  height={1920}
                  className='w-4 -top-1.5 absolute'
                  alt='pinned '
                />
              )}
              {!!message.attachments?.length && (
                <div className='flex flex-row-reverse gap-1 my-1 flex-wrap'>
                  {message.attachments?.map((item: any) =>
                    item.type?.includes('image') ? (
                      <div className='' key={'first' + item.image_url}>
                        <Image
                          onClick={() => setModal(item.image_url)}
                          className='w-80 cursor-pointer h-36 rounded-md object-cover'
                          src={item.image_url || ''}
                          width={1920}
                          height={1080}
                          alt='attachments'
                        />
                      </div>
                    ) : (
                      <div
                        className='bg-imbue-lime-light text-black px-2 py-1 rounded-full'
                        key={'second' + item.image_url}
                      >
                        <a className='underline' href={item.image_url}>
                          {item.name}
                        </a>
                      </div>
                    )
                  )}
                </div>
              )}
              {!!message.text?.trim().length && (
                <div className='bg-imbue-lime-light relative  px-4 py-1.5 rounded-2xl text-right text-black'>
                  <p>{message.text}</p>

                  {message.lates_reactions?.length > 0 && (
                    <p className='absolute right-0 p-0.5 rounded-full bg-white'>
                      {message.lates_reactions[0].val}
                    </p>
                  )}
                </div>
              )}
              {showProfile && (
                <p
                  className={classNames(
                    'text-[#7C8B9D]',
                    message.lates_reactions?.length > 0 ? 'mt-5' : 'mt-0'
                  )}
                >
                  {timeAgo.format(new Date(message.created_at))}
                </p>
              )}
            </div>
            {!message.deleted_at && (
              <div
                className={classNames(
                  ' gap-2  relative    items-center',
                  showProfile ? 'mb-6' : 'mb-0',
                  modal || isEmojiModalOpen ? 'flex' : 'group-hover:flex hidden'
                )}
              >
                <div className='flex items-center'>
                  <BsThreeDotsVertical
                    onClick={handlePopOver}
                    size={18}
                    className='hover:text-black  cursor-pointer text-text-aux-colour'
                  />

                  <div
                    ref={modalRef}
                    onClick={handleCloseModal}
                    className={classNames(
                      'absolute z-20 text-black min-w-32  w-32 top-6  right-5 bg-white shadow-lg  rounded-md',
                      modal ? 'block' : 'hidden'
                    )}
                  >
                    <p
                      onClick={() => handleReplayMessage(message)}
                      className='px-2 py-1 cursor-pointer hover:bg-slate-100'
                    >
                      Reply
                    </p>
                    {!message.pinned ? (
                      <p
                        onClick={() => setPinMessage(message)}
                        className=' px-2 py-1 cursor-pointer hover:bg-slate-100'
                      >
                        Pin
                      </p>
                    ) : (
                      <p
                        onClick={() => setUnPinMessage(message)}
                        className=' px-2 py-1 cursor-pointer hover:bg-slate-100'
                      >
                        Unpin
                      </p>
                    )}

                    <p className=' px-2 py-1 cursor-pointer hover:bg-slate-100'>
                      Edit Message
                    </p>
                    <p
                      onClick={() => deleteMessage(message)}
                      className=' px-2 py-1 cursor-pointer hover:bg-slate-100'
                    >
                      Delete
                    </p>
                  </div>
                </div>
                <div ref={emojiRef} className='relative'>
                  <BsEmojiSmile
                    onClick={() => setIsEmojiModalOpen((val) => !val)}
                    className='hover:text-black text-text-aux-colour cursor-pointer'
                    size={18}
                  />
                  {isEmojiModalOpen && (
                    <div className='absolute z-30 bg-white flex -top-10 right-0 rounded-md  items-center   text-xl'>
                      <p
                        onClick={() => sendMessageReaction(message, '😁')}
                        className='hover:bg-imbue-light-grey py-1 px-3 cursor-pointer'
                      >
                        😁
                      </p>
                      <p
                        onClick={() => sendMessageReaction(message, '👍')}
                        className='hover:bg-imbue-light-grey py-1 px-2 cursor-pointer'
                      >
                        👍
                      </p>
                      <p
                        onClick={() => sendMessageReaction(message, '👎')}
                        className='hover:bg-imbue-light-grey py-1 px-2 cursor-pointer'
                      >
                        👎
                      </p>
                      <p
                        onClick={() => sendMessageReaction(message, '❤️')}
                        className='hover:bg-imbue-light-grey py-1 px-2 cursor-pointer'
                      >
                        ❤️
                      </p>
                      <p
                        onClick={() => sendMessageReaction(message, '😢')}
                        className='hover:bg-imbue-light-grey py-1 px-3 cursor-pointer'
                      >
                        😢
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
  return (
    <div
      id={message.id}
      className={classNames(
        'flex group items-center gap-2 relative ',
        message.parent_id ? 'mt-9' : showProfile ? ' mt-1 mb-9' : 'my-1'
      )}
    >
      <Modal
        className='flex justify-center items-center'
        open={isModal ? true : false}
        onClose={() => setModal(false)}
      >
        <ImageCurosal
          Images={message.attachments}
          activeSlide={isModal ? isModal : ''}
        />
      </Modal>
      {showProfile && (
        <Image
          className='w-10 mb-5 h-10 rounded-full object-cover'
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
      {message.parent_id && (
        <div className='bg-gray-300 absolute cursor-pointer left-12 -top-8 rounded-3xl pt-1.5 pb-2 min-w-fit text-gray-600 px-5'>
          {message.parent_message?.attachments?.length > 0 && (
            <p>Attachments</p>
          )}
          <p>
            {message.parent_message?.text?.length &&
            message.parent_message?.text?.length > 50
              ? message.parent_message?.text?.substring(0, 50) + '...'
              : message.parent_message?.text}
          </p>
        </div>
      )}
      <div className='flex relative max-w-[70%] flex-col items-start'>
        {message.pinned && !message.deleted_at && (
          <Image
            src={'/pin.png'}
            width={1920}
            height={1920}
            className='w-4 -rotate-90 -top-1.5 absolute'
            alt='pinned '
          />
        )}
        {!!message.attachments?.length && (
          <div className='flex gap-1 my-1 flex-wrap'>
            {message.attachments?.map((item: any) =>
              item.type.includes('image') ? (
                <div className='' key={'third' + item.image_url}>
                  <Image
                    onClick={() => setModal(item.image_url)}
                    className='w-80 cursor-pointer h-36 rounded-md object-cover'
                    src={item.image_url || ''}
                    width={1920}
                    height={1080}
                    alt='attachments'
                  />
                </div>
              ) : (
                <div
                  className='bg-imbue-lime-light text-black px-2 py-1 rounded-full'
                  key={'fourth' + item.image_url}
                >
                  <a className='underline' href={item.image_url}>
                    {item.name}
                  </a>
                </div>
              )
            )}
          </div>
        )}
        {!!message.text?.trim().length && (
          <div className='bg-white px-4 py-1.5 rounded-2xl  text-black'>
            <p>{message.text}</p>
          </div>
        )}
        {showProfile && (
          <p className='text-[#7C8B9D] ml-2'>
            {timeAgo.format(new Date(message.created_at))}
          </p>
        )}
      </div>
      {!message.deleted_at && (
        <div
          className={classNames(
            ' gap-2  relative    items-center',
            showProfile ? 'mb-6' : 'mb-0',
            modal || isEmojiModalOpen ? 'flex' : 'group-hover:flex hidden'
          )}
        >
          <div className='flex items-center'>
            <BsThreeDotsVertical
              onClick={handlePopOver}
              size={18}
              className='hover:text-black  cursor-pointer text-text-aux-colour'
            />

            <div
              ref={modalRef}
              onClick={handleCloseModal}
              className={classNames(
                'bg-white z-20 absolute top-8 text-black w-32 rounded-md',
                modal ? 'block' : 'hidden'
              )}
            >
              <p
                onClick={() => handleReplayMessage(message)}
                className='px-2 py-1 cursor-pointer hover:bg-slate-100'
              >
                Reply
              </p>
              {!message.pinned ? (
                <p
                  onClick={() => setPinMessage(message)}
                  className=' px-2 py-1 cursor-pointer hover:bg-slate-100'
                >
                  Pin
                </p>
              ) : (
                <p
                  onClick={() => setUnPinMessage(message)}
                  className=' px-2 py-1 cursor-pointer hover:bg-slate-100'
                >
                  Unpin
                </p>
              )}
            </div>
          </div>
          <div ref={emojiRef} className='relative'>
            <BsEmojiSmile
              onClick={() => setIsEmojiModalOpen((val) => !val)}
              className='hover:text-black text-text-aux-colour cursor-pointer'
              size={18}
            />
            {isEmojiModalOpen && (
              <div className='absolute z-30 bg-white flex -top-10  rounded-md  items-center   text-xl'>
                <p
                  onClick={() => sendMessageReaction(message, '😁')}
                  className='hover:bg-imbue-light-grey py-1 px-3 cursor-pointer'
                >
                  😁
                </p>
                <p
                  onClick={() => sendMessageReaction(message, '👍')}
                  className='hover:bg-imbue-light-grey py-1 px-2 cursor-pointer'
                >
                  👍
                </p>
                <p
                  onClick={() => sendMessageReaction(message, '👎')}
                  className='hover:bg-imbue-light-grey py-1 px-2 cursor-pointer'
                >
                  👎
                </p>
                <p
                  onClick={() => sendMessageReaction(message, '❤️')}
                  className='hover:bg-imbue-light-grey py-1 px-2 cursor-pointer'
                >
                  ❤️
                </p>
                <p
                  onClick={() => sendMessageReaction(message, '😢')}
                  className='hover:bg-imbue-light-grey py-1 px-3 cursor-pointer'
                >
                  😢
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
