import { Alert, Modal } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { AiOutlineMail } from 'react-icons/ai';
import { BiBuildings } from 'react-icons/bi';
import { FiDownload } from 'react-icons/fi';
import { IoCopyOutline } from 'react-icons/io5';
import { SlWallet } from 'react-icons/sl';
import { TfiWorld } from 'react-icons/tfi';
import { Attachment, Channel } from 'stream-chat';

import ImageCurosal from './ImageCurosal';

export default function MessageSideBar({
  targetUserDetails,
  targetChannel,
}: {
  targetChannel: Channel;
  targetUserDetails: any;
}) {
  const router = useRouter();
  const [isClick, setClick] = useState<string | false>(false);
  const Attachments = useMemo(() => {
    const Images: Attachment[] = [];
    const File: Attachment[] = [];
    targetChannel.state.messageSets[0].messages.map((item) => {
      if (item.attachments?.length && item.attachments?.length > 0) {
        item.attachments.map((item) => {
          if (item.type?.includes('image')) Images.push(item);
          else File.push(item);
        });
      }
    });
    return { Images, File };
  }, [targetChannel]);

  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <>
      <Modal
        className='flex items-center justify-center'
        open={isClick !== false ? true : false}
        onClose={() => setClick(false)}
      >
        <ImageCurosal
          Images={Attachments.Images}
          activeSlide={isClick !== false ? isClick : '0'}
        />
      </Modal>
      <div className='bg-imbue-light-grey h-full overflow-auto  rounded-3xl py-5 px-5 '>
        <div
          className={`fixed top-28 z-10 transform duration-300 transition-all ${
            copied ? 'right-5' : '-right-full'
          }`}
        >
          <Alert severity='success'>Wallet Address Copied to clipboard</Alert>
        </div>
        <div
          onClick={() => router.push(`/profile/${targetUserDetails.username}`)}
          className='flex cursor-pointer gap-2 text-black'
        >
          <Image
            src={
              targetUserDetails?.profile_photo ||
              require('@/assets/images/profile-image.png')
            }
            width={1920}
            height={1080}
            className='w-20 rounded-lg h-20 object-cover'
            alt='profile image'
          />
          <div className='mt-2'>
            <p>
              {targetUserDetails?.display_name.length &&
              targetUserDetails?.display_name.length > 15
                ? targetUserDetails?.display_name.substring(0, 15) + '...'
                : targetUserDetails?.display_name}
            </p>
            <p className='text-sm text-text-aux-colour'>Private hire</p>
          </div>
        </div>
        <div className='mt-5 text-sm text-black'>
          <p>PROFILE</p>
          <div className='mt-5 w-[80%] space-y-3'>
            <div className='flex w-full justify-between '>
              <p className='flex items-center gap-2'>
                <BiBuildings className='text-text-aux-colour' size={20} />
                Company:
              </p>
              <p>Ethereum Network</p>
            </div>
            <div className='flex w-full justify-between '>
              <p className='flex items-center gap-2'>
                <SlWallet
                  className='text-text-aux-colour rotate-180'
                  size={18}
                />
                Wallet
              </p>
              <p className='flex items-center gap-1'>
                {targetUserDetails?.web3_address?.substring(0, 7) +
                  '...' +
                  targetUserDetails?.web3_address?.substring(
                    targetUserDetails?.web3_address.length - 3,
                    targetUserDetails?.web3_address.length
                  )}
                <IoCopyOutline
                  onClick={() => {
                    navigator.clipboard.writeText(
                      targetUserDetails?.web3_address
                    );
                    copyAddress();
                  }}
                  className='text-text-aux-colour cursor-pointer'
                  size={16}
                />
              </p>
            </div>
            <div className='flex w-full justify-between'>
              <p className='flex items-center gap-2'>
                <AiOutlineMail className='text-text-aux-colour' size={18} />
                Email:
              </p>
              <p>{targetUserDetails?.email}</p>
            </div>

            {targetUserDetails?.website && (
              <div className='flex w-full justify-between '>
                <p className='flex items-center gap-2'>
                  <TfiWorld className='text-text-aux-colour' size={18} />
                  Link:
                </p>
                <p>{targetUserDetails?.website}</p>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className='h-[1px] bg-gray-400 text-text-aux-colour  my-5' />
          <div className='flex'>
            <p className='uppercase text-sm'>Shared Attachments</p>
          </div>
          <div className='flex flex-wrap mt-5 gap-2'>
            {Attachments.Images?.map(
              (item) =>
                item.image_url && (
                  <Image
                    onClick={() => setClick(String(item.image_url))}
                    className='w-[90px] cursor-pointer h-[90px] object-cover rounded-lg'
                    key={item.image_url}
                    src={item.image_url}
                    width={600}
                    height={500}
                    alt='attchments'
                  />
                )
            )}
          </div>
          <div className='mt-7'>
            <p className='uppercase text-sm mb-5'>Past Briefs</p>
            {Attachments.File.map(
              (item: any) =>
                item.image_url && (
                  <div
                    className='flex items-center my-2 justify-between text-black'
                    key={item.image_url}
                  >
                    <p className='text-black'>{item.name}</p>
                    <div className='flex items-center gap-2'>
                      <a href={item.image_url}>
                        <FiDownload size={17} />
                      </a>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
