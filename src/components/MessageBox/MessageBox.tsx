import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  AiOutlineFlag,
  AiOutlineInfoCircle,
  AiOutlinePlus,
} from 'react-icons/ai';
import { BsArchive, BsEmojiSmile, BsPinAngle, BsSend } from 'react-icons/bs';
import { IoImageOutline } from 'react-icons/io5';
import { VscMention } from 'react-icons/vsc';
import { useSelector } from 'react-redux';
import {
  Channel,
  DefaultGenerics,
  FormatMessageResponse,
  SendFileAPIResponse,
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
  const [textVal, setTextVal] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<SendFileAPIResponse[]>(
    []
  );
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
    setTextVal(e.target.value);
  };

  useEffect(() => {
    const objDiv = document.getElementById('message_box');
    objDiv?.scrollTo({ top: objDiv.scrollHeight });
  }, [messages]);

  const onSendMessage = async () => {
    if (textVal.trim().length > 0 || selectedImages.length > 0) {
      const attachment = selectedImages.map((item) => {
        return {
          duration: item.duration,
          thumb_url: item.thumb_url,
          image_url: item.file,
        };
      });
      await channel.sendMessage({ text: textVal, attachments: attachment });
    }
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
    const data = await channel.sendImage(file);
    setSelectedImages((val) => [...val, data]);
  };
  const onChangeImage = (event: any) => {
    if (event.target.files[0]) {
      uploadFileToChannel(event.target.files[0]);
    }
  };

  return (
    <div className="border-[4px] relative h-full bg-[url('/message-box-pattern.svg')] back  rounded-2xl">
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
      <div
        id='message_box'
        style={{ height: hState }}
        className='max-h-[60vh] h-full overflow-auto'
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
              key={new Date(item.created_at).getMilliseconds() + Math.random()}
              user={user}
              message={item}
              showProfile={bool}
            />
          );
        })}
      </div>
      <div
        ref={inputMessageRef}
        id='input_message'
        className='bg-white absolute w-[99%]  h-auto py-2 mx-2 px-2  bottom-0 rounded-lg'
      >
        {selectedImages.length > 0 && (
          <div className='flex gap-3'>
            {selectedImages.map((item) => (
              <div className='w-24 h-24' key={item.duration}>
                <Image
                  className='w-24 h-24 '
                  src={item.file}
                  width={1920}
                  height={1020}
                  alt='selected images'
                />
              </div>
            ))}
          </div>
        )}
        <TextareaAutosize
          placeholder='type here'
          onChange={handleChnages}
          value={textVal}
          minRows={3}
          maxRows={6}
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
          accept='.jpg , .png , .jpeg'
        />
      </div>
    </div>
  );
}
