import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import classNames from 'classnames';
import EmojiPicker from 'emoji-picker-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineInfoCircle, AiOutlinePlus } from 'react-icons/ai';
import { BsEmojiSmile, BsPinAngle, BsSend } from 'react-icons/bs';
import { IoIosRemoveCircleOutline, IoMdClose } from 'react-icons/io';
import { IoImageOutline } from 'react-icons/io5';
import { VscNewline } from 'react-icons/vsc';
import { useSelector } from 'react-redux';
import {
  Channel,
  DefaultGenerics,
  FormatMessageResponse,
  SendFileAPIResponse,
  User,
} from 'stream-chat';
import useOnClickOutside from 'use-onclickoutside';

import { fetchUser } from '@/utils';

import { RootState } from '@/redux/store/store';

import MessageItem from './MessageItem';
import MessageSideBar from './MessageSideBar';
import PinMessages from './PinMessages';

type lastMessageType = {
  date: Date;
  user_id: number;
};

interface imagesType extends SendFileAPIResponse {
  type: string;
  name: string;
}

let lastMessage: lastMessageType | null = null;

export default function MessageBox({
  channel,
  chatpopup,
  handleChatPopUp,
}: {
  chatpopup?: boolean;
  handleChatPopUp?: any;
  channel: Channel<DefaultGenerics>;
}) {
  const { user, client } = useSelector((state: RootState) => state.userState);
  const [targetUser, setTargetUser] = useState<User>();
  const [isTyping, setTyping] = useState(false);
  const [isPinedMessageOpen, setPinnedMessageOpen] = useState(false);
  const [textVal, setTextVal] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<imagesType[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isEmojiOpen, setEmojiOpen] = useState<boolean>(false);
  const [targetUserDetails, setTargetUserDetails] = useState<any | null>(null);
  const [messages, setMessages] = useState<
    FormatMessageResponse<DefaultGenerics>[]
  >([]);
  const router = useRouter();
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [isReplayMessage, setReplayMessage] =
    useState<FormatMessageResponse | null>(null);
  useEffect(() => {
    setMessageId(null);
    setTargetUserDetails(null);
    setTextVal('');
    setSelectedImages([]);
  }, [channel]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEmojiOpen) {
        setEmojiOpen(false);
      }
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [isEmojiOpen]);

  useEffect(() => {
    const key = Object.keys(channel.state?.members);
    Number(channel.state.members[key[0]]?.user_id) === user.id
      ? setTargetUser(channel.state.members[key[1]]?.user)
      : setTargetUser(channel.state.members[key[0]]?.user);
    const { messages } = channel.state.messageSets[0];
    setMessages(messages);

    const getChannel = async () => {
      const res = await client?.queryChannels({ id: channel.id });
      if (res) {
        const { messages } = res[0].state.messageSets[0];
        setMessages(messages);
      }
    };

    const myListener = channel.on((event) => {
      if (
        event.type === 'typing.start' &&
        Number(event.user?.id) !== user?.id
      ) {
        setTyping(true);
      } else if (
        event.type === 'typing.stop' &&
        Number(event.user?.id) !== user?.id
      ) {
        setTyping(false);
      } else if (event.type !== 'message.new')
        setMessageId(event.message?.id || null);
      else if (event.type === 'message.new') setMessageId(null);
      getChannel();
    });

    return () => {
      myListener.unsubscribe();
    };
  }, [
    channel.state.members,
    channel.state.messageSets,
    user.id,
    channel,
    client,
  ]);

  const getUserDetailsForChannel = async () => {
    if (isPinedMessageOpen) {
      setPinnedMessageOpen(false);
    }
    if (targetUserDetails) {
      setTargetUserDetails(null);
      return;
    }
    const user = await fetchUser(Number(targetUser?.id || 0));
    setTargetUserDetails(user);
  };

  const handleTyping = async () => {
    await channel.keystroke();
  };
  const handleScrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleChnages = (e: any) => {
    handleTyping();
    if (e.emoji) {
      setTextVal((val) => val + e.emoji);
    } else {
      setTextVal(e.target.value);
    }
  };

  useEffect(() => {
    const objDiv = document.getElementById('message_box');
    if (messageId === null) {
      objDiv?.scrollTo({ top: objDiv.scrollHeight });
    }
  }, [messages]);

  useOnClickOutside(emojiRef, () => setEmojiOpen(false));

  const onSendMessage = async () => {
    if (textVal.trim().length > 0 || selectedImages.length > 0) {
      const attachment = selectedImages.map((item) => {
        return {
          duration: item.duration,
          thumb_url: item.thumb_url,
          image_url: item.file,
          type: item.type,
          name: item.name,
        };
      });

      if (isReplayMessage !== null) {
        await channel.sendMessage({
          text: textVal,
          attachments: attachment,
          parent_id: isReplayMessage.id,
          parent_message: isReplayMessage,
          show_in_channel: true,
        });
      } else
        await channel.sendMessage({ text: textVal, attachments: attachment });
    }
    setReplayMessage(() => null);
    setTextVal('');
    setSelectedImages([]);
    const { messages } = channel.state.messageSets[0];
    setMessages(messages);
  };
  const imageRef = useRef<HTMLInputElement | null>(null);
  const handleImageUpload = async () => {
    if (imageRef?.current) {
      imageRef.current.click();
    }
  };

  const handleFileUpload = async () => {
    if (fileRef?.current) {
      fileRef.current.click();
    }
  };
  const inputMessageRef = useRef<HTMLDivElement | null>(null);
  const [hState, setHstate] = useState<string>('60vh');
  useEffect(() => {
    if (inputMessageRef.current?.offsetHeight) {
      const val =
        72 - (100 * inputMessageRef.current?.offsetHeight) / window.innerHeight;
      setHstate(val + 'vh');
    }
  }, [inputMessageRef.current?.offsetHeight]);

  /// culprits that are responsible for uploading images //////////
  const uploadFileToChannel = async (file: File) => {
    let data;

    if (file.type.includes('image')) {
      data = await channel.sendImage(file);
    } else data = await channel.sendFile(file);
    const res = {
      ...data,
      type: file.type,
      name: file.name,
    };
    setSelectedImages((val) => [...val, res]);
  };
  const onChangeImage = (event: any) => {
    if (event.target.files[0]) {
      uploadFileToChannel(event.target.files[0]);
      if (imageRef.current) {
        imageRef.current.value = '';
      }
    }
  };

  const handleSendReaction = async (messageID: string, type: string) => {
    await channel.sendReaction(
      messageID,
      { type: type, user_id: String(user.id) },
      { enforce_unique: true }
    );
  };

  const handleEmoji = () => {
    setEmojiOpen((val) => !val);
  };

  const removeItem = (target: string) => {
    const filtered = selectedImages.filter((item) => item.file !== target);
    setSelectedImages(filtered);
  };

  const [prevKey, setPrevKey] = useState<string>();

  const handleKeyDown = (event: any) => {
    if (event.code === 'ShiftLeft' || event.code === 'ShiftLeft') {
      setPrevKey(event.code);
      return;
    } else if (
      prevKey === 'ShiftLeft' ||
      (prevKey === 'ShiftLeft' && event.code === 'Enter')
    ) {
      ////////// just do the default things
    } else if (event.code === 'Enter') {
      event.preventDefault();
      onSendMessage();
    }
    setPrevKey('');
  };

  const handleBarOptions = () => {
    if (targetUserDetails) {
      setTargetUserDetails(null);
    }
    setPinnedMessageOpen((val) => !val);
  };

  const handleReadMessage = async () => {
    if (channel.countUnread() > 0) {
      await channel.markRead();
    }
  };

  return (
    <div className='flex h-full'>
      <div
        onClick={handleReadMessage}
        className="border-[4px] w-full relative h-full bg-[url('/message-box-pattern.svg')]    rounded-2xl"
      >
        {/* messaging header sections */}
        <div
          className={classNames(
            'bg-white w-full justify-between items-center flex rounded-xl px-5 ',
            chatpopup ? 'py-1' : 'py-3'
          )}
        >
          <div
            onClick={() => router.push(`/profile/${targetUser?.username}`)}
            className='flex cursor-pointer'
          >
            <div className='w-14 justify-self-start  relative'>
              <Image
                className={classNames('object-cover rounded-full w-12 h-12')}
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
          {!chatpopup && (
            <div className='flex text-text-aux-colour gap-4  items-center'>
              {/* <p className='cursor-pointer p-3 flex items-center  rounded-full hover:bg-imbue-lime-light'>
              <BsArchive size={18} />
            </p> */}
              <BsPinAngle
                size={44}
                onClick={handleBarOptions}
                className='-rotate-45 rounded-full p-3 hover:bg-imbue-lime-light cursor-pointer'
              />
              {/* <AiOutlineFlag
              className='cursor-pointer rounded-full p-3 hover:bg-imbue-lime-light'
              size={44}
            /> */}
              <AiOutlineInfoCircle
                onClick={getUserDetailsForChannel}
                className='cursor-pointer p-3 rounded-full hover:bg-imbue-lime-light'
                size={44}
              />
            </div>
          )}
          {chatpopup && (
            <div onClick={() => handleChatPopUp(false)}>
              <IoMdClose className='text-black cursor-pointer' size={20} />
            </div>
          )}
        </div>
        {/* messaging header sections ends */}
        <div
          id='message_box'
          style={{ height: hState }}
          className={classNames(
            ' h-full  overflow-auto',
            chatpopup ? 'max-h-[35vh]' : 'max-h-[60vh]'
          )}
        >
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
                handleReplayMessage={setReplayMessage}
                handleSendReaction={handleSendReaction}
                key={item.id}
                user={user}
                message={item}
                showProfile={bool}
              />
            );
          })}
          {isTyping && (
            <div className='flex animate-bounce gap-1 ml-14'>
              <div className='w-3 animate-bounce bg-text-aux-colour h-3 rounded-full' />
              <div className='w-3 animate-bounce bg-text-aux-colour h-3 rounded-full' />
              <div className='w-3 animate-bounce bg-text-aux-colour h-3 rounded-full' />
              <div className='w-3 animate-bounce bg-text-aux-colour h-3 rounded-full' />
            </div>
          )}
        </div>
        <div
          ref={inputMessageRef}
          id='input_message'
          className={classNames(
            'bg-white  w-[99%] absolute h-auto py-2 mx-2 px-2  bottom-0 rounded-lg'
          )}
        >
          {isReplayMessage !== null && (
            <div className='bg-imbue-light-grey px-3 py-2 rounded-xl text-black'>
              <p className='flex mb-2 justify-between'>
                Replying to {isReplayMessage.user?.name}
                <IoIosRemoveCircleOutline
                  onClick={() => setReplayMessage(null)}
                  className='text-text-aux-colour cursor-pointer hover:text-black
                  '
                  size={16}
                />
              </p>
              {isReplayMessage.attachments?.map((item: any) =>
                item.type.includes('image') ? (
                  <div className='w-32 relative h-32' key={item.image_url}>
                    {item.image_url && (
                      <Image
                        className='w-28 h-28 rounded-lg object-fill '
                        src={item.image_url}
                        width={1920}
                        height={1020}
                        alt='selected images'
                      />
                    )}
                  </div>
                ) : (
                  <div
                    className='text-black flex items-center gap-1.5 bg-imbue-light-grey text-sm px-2 py-1 rounded-full'
                    key={item.image_url}
                  >
                    <p>{item.name}</p>
                  </div>
                )
              )}
              <p className='text-text-aux-colour text-sm'>
                {isReplayMessage.text?.length &&
                isReplayMessage.text?.length > 150
                  ? isReplayMessage.text?.substring(0, 150) + ' .....'
                  : isReplayMessage.text}
              </p>
            </div>
          )}
          {selectedImages.length > 0 && (
            <div className='flex items-center gap-3'>
              {selectedImages.map((item) =>
                item.type.includes('image') ? (
                  <div className='w-32 relative h-32' key={item.duration}>
                    <Image
                      className='w-32 h-32 object-fill '
                      src={item.file}
                      width={1920}
                      height={1020}
                      alt='selected images'
                    />
                    <IoIosRemoveCircleOutline
                      onClick={() => removeItem(item.file)}
                      className='text-text-aux-colour z-10 top-0 right-0 absolute cursor-pointer hover:text-black
                  '
                      size={20}
                    />
                  </div>
                ) : (
                  <div
                    className='text-black flex items-center gap-1.5 bg-imbue-light-grey text-sm px-2 py-1 rounded-full'
                    key={item.file}
                  >
                    <p>{item.name}</p>
                    <IoIosRemoveCircleOutline
                      onClick={() => removeItem(item.file)}
                      className='text-text-aux-colour cursor-pointer hover:text-black
                  '
                      size={16}
                    />
                  </div>
                )
              )}
            </div>
          )}
          <TextareaAutosize
            placeholder='type here...'
            onChange={handleChnages}
            onKeyDown={handleKeyDown}
            value={textVal}
            minRows={chatpopup ? 1 : 3}
            maxRows={chatpopup ? 2 : 6}
            className='outline-none resize-none placeholder:text-text-aux-colour border-none text-black'
          />
          <div className='text-text-aux-colour gap-2 flex items-center'>
            <AiOutlinePlus
              onClick={handleFileUpload}
              className='hover:text-black cursor-pointer'
              size={21}
            />
            <p className='text-lg'>|</p>
            <VscNewline
              className='hover:text-black cursor-pointer'
              onClick={() => setTextVal((val) => val + '\n')}
              size={24}
            />
            <div className='relative flex items-center'>
              <BsEmojiSmile
                onClick={handleEmoji}
                className='hover:text-black cursor-pointer'
                size={18}
              />
              {isEmojiOpen && (
                <div ref={emojiRef} className='absolute -top-[28.5rem] shadow'>
                  <EmojiPicker lazyLoadEmojis onEmojiClick={handleChnages} />
                </div>
              )}
            </div>
            <IoImageOutline
              onClick={handleImageUpload}
              className='hover:text-black cursor-pointer'
              size={20}
            />
            <BsSend
              onClick={onSendMessage}
              className='ml-auto mr-2 text-xl cursor-pointer text-imbue-purple'
            />
          </div>
          <input
            ref={imageRef}
            onChange={onChangeImage}
            className='hidden'
            type='file'
            accept='.jpg , .png , .jpeg, .svg'
          />
          <input
            ref={fileRef}
            onChange={onChangeImage}
            className='hidden'
            type='file'
            accept='.rar,.zip ,.html,.pdf,.pptx,.docs,.word,.docx,.csv,.xlsx,.txt,.psd'
          />
        </div>
      </div>
      {targetUserDetails && (
        <div className='bg-white  w-[30rem] text-text-aux-colour mb-2 pl-2 h-full rounded-r-3xl  '>
          <MessageSideBar
            targetUserDetails={targetUserDetails}
            targetChannel={channel}
          />
        </div>
      )}
      {isPinedMessageOpen && (
        <div className='bg-white  w-[30rem] text-text-aux-colour mb-2 pl-2 h-full rounded-r-3xl  '>
          <PinMessages
            handleScroll={handleScrollTo}
            channel={channel}
            handleReplayMessage={setReplayMessage}
          />
        </div>
      )}
    </div>
  );
}
