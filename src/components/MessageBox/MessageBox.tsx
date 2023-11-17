import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import classNames from 'classnames';
import EmojiPicker from 'emoji-picker-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  AiOutlineFlag,
  AiOutlineInfoCircle,
  AiOutlinePlus,
} from 'react-icons/ai';
import { BsArchive, BsEmojiSmile, BsPinAngle, BsSend } from 'react-icons/bs';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
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

interface imagesType extends SendFileAPIResponse {
  type: string;
  name: string;
}

let lastMessage: lastMessageType | null = null;

export default function MessageBox({
  channel,
}: {
  channel: Channel<DefaultGenerics>;
}) {
  const { user, client } = useSelector((state: RootState) => state.userState);
  const [targetUser, setTargetUser] = useState<User>();
  const [isTyping, setTyping] = useState(false);
  const [textVal, setTextVal] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<imagesType[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isEmojiOpen, setEmojiOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<
    FormatMessageResponse<DefaultGenerics>[]
  >([]);
  const [messageId, setMessageId] = useState<string | null>(null);

  useEffect(() => {
    setMessageId(null);
  }, [channel]);

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

  const handleTyping = async () => {
    await channel.keystroke();
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
    if (file.type === 'image/png') {
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
    }
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

  const handleReadMessage = async () => {
    if (channel.countUnread() > 0) {
      await channel.markRead();
    }
  };

  return (
    <div
      onClick={handleReadMessage}
      className="border-[4px] relative h-full bg-[url('/message-box-pattern.svg')]  back  rounded-2xl"
    >
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
        className='bg-white absolute w-[99%]  h-auto py-2 mx-2 px-2  bottom-0 rounded-lg'
      >
        {selectedImages.length > 0 && (
          <div className='flex items-center gap-3'>
            {selectedImages.map((item) =>
              item.type === 'image/png' ? (
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
          placeholder='type here'
          onChange={handleChnages}
          onKeyDown={handleKeyDown}
          value={textVal}
          minRows={3}
          maxRows={6}
          className='outline-none placeholder:text-text-aux-colour border-none text-black'
        />
        <div className='text-text-aux-colour gap-2 flex items-center'>
          <AiOutlinePlus
            onClick={handleFileUpload}
            className='hover:text-black cursor-pointer'
            size={21}
          />
          <p className='text-lg'>|</p>
          <VscMention className='hover:text-black cursor-pointer' size={28} />
          <div className='relative flex items-center'>
            <BsEmojiSmile
              onClick={handleEmoji}
              className='hover:text-black cursor-pointer'
              size={18}
            />
            {isEmojiOpen && (
              <div className='absolute -top-[28.5rem] shadow'>
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
          accept='.jpg , .png , .jpeg'
        />
        <input
          ref={fileRef}
          onChange={onChangeImage}
          className='hidden'
          type='file'
          accept='.rar , .zip , .html , .pdf , .pptx , .docs , .word'
        />
      </div>
    </div>
  );
}
