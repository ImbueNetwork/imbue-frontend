import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BiRightArrowAlt } from 'react-icons/bi';
import { IoIosArrowBack } from 'react-icons/io';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { VscNewFile } from 'react-icons/vsc';
import { useSelector } from 'react-redux';
// Import Swiper React components
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';

import { fetchUser } from '@/utils';

import ChatPopup from '@/components/ChatPopup';
import FreelancerCard from '@/components/FreelancerCard/FreelancerCard';
import FullScreenLoader from '@/components/FullScreenLoader';

import { Freelancer, User } from '@/model';
import { getAllFreelancers } from '@/redux/services/freelancerService';
import { RootState } from '@/redux/store/store';

export function Controller() {
  const sp = useSwiper();
  const [click, setClick] = useState(false);
  const handleForward = () => {
    sp.slideNext();
    setClick(!click);
  };
  const handleBackward = () => {
    sp.slidePrev();
    setClick(!click);
  };

  return (
    <div className='flex gap-5 items-center  w-full '>
      <p className='min-w-fit'>Recommended for you ✨</p>
      <hr className='w-full mt-1' />
      <p className='min-w-fit cursor-pointer flex items-center'>
        Discover More{' '}
        <IoIosArrowBack
          onClick={handleBackward}
          className={classNames(
            '',
            sp.isBeginning ? 'text-text-aux-colour' : 'block'
          )}
          size={22}
        />
        <IoIosArrowBack
          onClick={handleForward}
          className={classNames(
            'rotate-180',
            sp.isEnd ? 'text-text-aux-colour' : 'block'
          )}
          size={22}
        />
      </p>
    </div>
  );
}

export default function ClientDashboard() {
  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [recomdedFreelancer, setRecomendedFreelancer] = useState<Freelancer[]>(
    []
  );

  const handleMessageBoxClick = async (user_id: number) => {
    if (user_id) {
      setShowMessageBox(true);
      setTargetUser(await fetchUser(user_id));
    } else {
      //TODO: check if user is logged in
      // redirect("login", `/dapp/freelancers/${freelancer?.username}/`);
    }
  };

  useEffect(() => {
    try {
      const getFreelancers = async () => {
        const data = await getAllFreelancers(12, 1);
        setRecomendedFreelancer(data?.currentData);
      };
      getFreelancers();
    } catch (err: any) {
      //eslint-disable-next-line no-console
      console.log(err);
    }
  }, []);

  const router = useRouter();
  if (loadingUser) return <FullScreenLoader />;
  return (
    <div className='bg-white  mt-2 py-7 px-5 rounded-3xl'>
      <div className='flex justify-between items-center'>
        <div>
          <p className='text-black text-[27px]'>
            Welcome, {user?.display_name?.split(' ')[0]} 👋
          </p>
          <p className='text-text-aux-colour text-sm'>
            Glad to have you on imbue
          </p>
        </div>
        <button
          onClick={() => router.push('/briefs/new')}
          className='text-imbue-purple flex items-center gap-1 py-2 text-sm px-7 border border-imbue-purple rounded-full'
        >
          Post Brief
          <VscNewFile size={18} />
        </button>
      </div>
      {/* starting of the box sections */}
      <div className='flex text-text-grey gap-7 mt-9'>
        <div className=' py-5 px-5 rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full'>
          <div className='flex justify-between'>
            <p>Projects</p>

            <p
              onClick={() => router.push('/briefs/mybriefs')}
              className='bg-imbue-purple px-7 py-2 text-white text-sm rounded-full cursor-pointer'
            >
              View all
            </p>
          </div>
          <div className='mt-5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1  rounded-full bg-imbue-coral' />
              <p className='text-sm min-w-fit '>Briefs</p>
              <hr className='w-full border-dashed mt-3  border-imbue-coral ' />
              <p className='text-[22px] font-semibold text-black'>0</p>
            </div>
          </div>
          <div className='mt-0.5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1 rounded-full bg-imbue-purple' />
              <p className='text-sm min-w-fit '>Projects</p>
              <hr className='w-full border-dashed mt-3  border-imbue-purple ' />
              <p className='text-[22px] font-semibold text-black'>0</p>
            </div>
          </div>
          <div className='mt-0.5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1 rounded-full bg-imbue-lemon' />
              <p className='text-sm min-w-fit '>Grants</p>
              <hr className='w-full border-dashed mt-3  border-imbue-lemon ' />
              <p className='text-[22px] font-semibold text-black'>0</p>
            </div>
          </div>
        </div>
        <div className='py-5 px-5 flex flex-col justify-between rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full '>
          <div className=' flex justify-between items-center'>
            <p>Grants</p>
            <p className='bg-imbue-purple px-7 py-2 text-white text-sm rounded-full cursor-pointer'>
              View all
            </p>
          </div>
          <div>
            <div className='mb-2 flex'>
              <p className='text-4xl font-semibold text-black'>1</p>
            </div>
          </div>
        </div>
        <div className=' py-5 px-5 flex flex-col rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full '>
          <div className='flex justify-between'>
            <p>Wallet</p>
            <div className='px-3 py-0.5 border text-black border-text-aux-colour rounded-full'>
              <BiRightArrowAlt size={22} className='-rotate-45' />
            </div>
          </div>
          <div className='text-black flex items-center justify-between mt-auto'>
            <div>
              <div className='flex'>
                <MdOutlineAttachMoney size={23} />
                <p className='text-4xl font-semibold'>0.00</p>
              </div>
              <p className='text-text-grey'>Payout Accounts</p>
            </div>
            <p className='bg-imbue-purple px-7 py-2 text-white text-sm rounded-full cursor-pointer'>
              Get Started
            </p>
          </div>
        </div>
      </div>
      {/* ending of the box sections */}
      <div className='text-text-grey mt-20'>
        {/* <div className='flex gap-5 items-center'>
          <p className='min-w-fit'>Recommended for you ✨</p>
          <hr className='w-full mt-1' />
          <p className='min-w-fit cursor-pointer flex items-center'>
            Discover More <IoIosArrowBack className='rotate-180' size={22} />
          </p>
        </div> */}
        {/* Freelancer recomendations */}
        <Swiper
          spaceBetween={50}
          slidesPerView={3}
          className=' !flex !flex-col-reverse   relative'
        >
          <div className='pb-16 '>
            <Controller />
          </div>
          {recomdedFreelancer.map((item) => (
            <SwiperSlide key={'freelancer' + item.id}>
              <FreelancerCard
                freelancer={item}
                handleMessage={handleMessageBoxClick}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {user && showMessageBox && (
        <ChatPopup
          showMessageBox={showMessageBox}
          setShowMessageBox={setShowMessageBox}
          targetUser={targetUser}
          browsingUser={user}
          showFreelancerProfile={true}
        />
      )}
    </div>
  );
}
