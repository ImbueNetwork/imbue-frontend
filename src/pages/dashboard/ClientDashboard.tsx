import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { BiChevronDown } from 'react-icons/bi';
import { BsFilter } from 'react-icons/bs';
import { IoIosArrowBack } from 'react-icons/io';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { VscNewFile } from 'react-icons/vsc';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
// Import Swiper React components
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import { fetchUser } from '@/utils';

import ChatPopup from '@/components/ChatPopup';
import FreelancerCard from '@/components/FreelancerCard/FreelancerCard';
import FullScreenLoader from '@/components/FullScreenLoader';

import { Freelancer, User } from '@/model';
import { getUserBriefs } from '@/redux/services/briefService';
import { getAllFreelancers } from '@/redux/services/freelancerService';
import { getUsersOngoingGrants } from '@/redux/services/projectServices';
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
    <div className='flex gap-5 items-center text-xs w-full'>
      <p className='min-w-fit'>Recommended for you ✨</p>
      <hr className='w-full mt-1' />
      <p className='min-w-fit cursor-pointer flex items-center'>
        Discover More{' '}
        <IoIosArrowBack
          onClick={handleBackward}
          className={classNames(
            'w-4 h-4 lg:w-6 lg:h-6',
            sp.isBeginning ? 'text-text-aux-colour' : 'block'
          )}
          size={22}
        />
        <IoIosArrowBack
          onClick={handleForward}
          className={classNames(
            'rotate-180 w-4 h-4 lg:w-6 lg:h-6',
            sp.isEnd ? 'text-text-aux-colour' : 'block'
          )}
          size={22}
        />
      </p>
    </div>
  );
}

const options = [
  { name: 'Accepted', bg: 'bg-[#90DB00]', status_id: 4 },
  { name: 'Pending', bg: 'bg-[#FF7A00]', status_id: 1 },
  { name: 'Completed', bg: 'bg-[#3B27C1]', status_id: 6 },
  { name: 'Refunded', bg: 'bg-[#FF7A00]', status_id: 5 },
];

export default function ClientDashboard() {
  const [openedOption, setOpenedOption] = useState<boolean>(false);
  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [recomdedFreelancer, setRecomendedFreelancer] = useState<Freelancer[]>(
    []
  );
  const [Briefs, _setBriefs] = useState<any>();
  const [Grants, setOngoingGrants] = useState<any[]>();
  const [filteredGrants, setFilteredGrants] = useState<any[]>([]);
  const [filterGrantoptions, setFilterGrantoptions] = useState<any>(options[0]);

  const router = useRouter();

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

  useEffect(() => {
    if (Grants?.length && Grants?.length > 0) {
      const filter: any[] = Grants.filter(
        (grant) => grant.status_id === filterGrantoptions.status_id
      );
      setFilteredGrants(filter);
    }
  }, [Grants, filterGrantoptions]);

  useEffect(() => {
    const setUserBriefs = async () => {
      if (user?.id) _setBriefs(await getUserBriefs(user?.id));
      setOngoingGrants(
        await getUsersOngoingGrants(user?.web3_address as string)
      );
    };
    setUserBriefs();
  }, [user, user?.id, user?.web3_address]);

  const totalSpent = useMemo(() => {
    const total = Briefs?.acceptedBriefs?.reduce(
      (acc: number, item: any) =>
        item.project.status_id === 6
          ? acc + Number(item.project.total_cost_without_fee)
          : acc + 0,
      0
    );
    return total;
  }, [Briefs]);

  const handleGrantRedirect = () => {
    router.push({
      pathname: '/grants/ongoinggrants',
      query: `statusId=${filterGrantoptions.status_id}`,
    });
  };

  const settings = {
    dots: true,
    infinite: false,
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    dotsClass: 'dashboard_slider',
    variableWidth: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        }
      },
    ]
  }

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

      <Slider className='w-full text-text-grey mt-9' {...settings}>
        <section className='pr-7 min-w-[300px]'>
          <div className='py-5 px-5 rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey w-full'>
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
                <div className='!w-1.5 !h-1  rounded-full bg-imbue-coral' />
                <p className='text-sm min-w-fit '>Briefs</p>
                <hr className='w-full border-dashed mt-3  border-imbue-coral ' />
                <p className='text-[22px] font-semibold text-black'>
                  {Briefs?.briefsUnderReview?.length || 0}
                </p>
              </div>
            </div>
            <div className='mt-0.5'>
              <div className='flex items-center gap-2'>
                <div className='w-1.5 !h-1 rounded-full bg-imbue-purple' />
                <p className='text-sm min-w-fit '>Projects</p>
                <hr className='w-full border-dashed mt-3  border-imbue-purple ' />
                <p className='text-[22px] font-semibold text-black'>
                  {Briefs?.acceptedBriefs?.length || 0}
                </p>
              </div>
            </div>
            <div className='mt-0.5'>
              <div className='flex items-center gap-2'>
                <div className='w-1.5 !h-1 rounded-full bg-imbue-lemon' />
                <p className='text-sm min-w-fit '>Grants</p>
                <hr className='w-full border-dashed mt-3  border-imbue-lemon ' />
                <p className='text-[22px] font-semibold text-black'>
                  {Grants?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className='py-5 px-5 flex flex-col justify-between rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full'>
          <div className=' flex justify-between items-center'>
            <p>Grants</p>
            <div className='relative lg:w-44 select-none'>
              <div
                className='flex bg-white p-2 rounded-md gap-1.5 items-center cursor-pointer'
                onClick={() => setOpenedOption((prev) => !prev)}
              >
                <div
                  className={`${filterGrantoptions.bg} w-1 h-1 rounded-full`}
                />{' '}
                <p className='text-black text-sm'>{filterGrantoptions.name}</p>
                <BiChevronDown
                  className={`ml-auto ${openedOption && 'rotate-180'} `}
                  color='black'
                  size={18}
                />
              </div>

              <div
                className={`${!openedOption && 'hidden'
                  } absolute z-[1] w-full rounded-md`}
              >
                {options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 cursor-pointer ${option.status_id === filterGrantoptions.status_id ? 'bg-imbue-light-purple': "bg-white"}`}
                    onClick={() => {
                      setFilterGrantoptions(option);
                      setOpenedOption(false);
                    }}
                  >
                    <div className={`${option.bg} w-1 h-1 rounded-full`}></div>
                    <p className='text-sm'>{option.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className='flex flex-col justify-between mt-6 gap-1'>
              <p className='text-4xl font-semibold  text-black'>
                {filteredGrants.length}
              </p>
              <div className='flex justify-between items-center gap-4'>
                <p>{filterGrantoptions.name} Grants</p>
                <p
                  onClick={handleGrantRedirect}
                  className='bg-imbue-purple px-4 lg:px-7 items-center py-1 lg:py-2 text-white text-sm rounded-full cursor-pointer'
                >
                  View all
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className='pl-7'>
          <div className=' py-5 px-5 flex flex-col rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full '>
            <div className='flex justify-between'>
              <p>Total Spent</p>
            </div>
            <div className='text-black flex flex-col justify-between mt-auto'>
              <div className='flex items-center'>
                <MdOutlineAttachMoney size={23} />
                <p className='text-4xl font-semibold'>{totalSpent} </p>
              </div>
              <div className='flex items-center gap-3'>
                <p className='text-text-grey'>Payout Accounts</p>
                <p
                  onClick={() => router.push('/relay')}
                  className='bg-imbue-purple px-4 lg:px-7 items-center py-1 lg:py-2 text-white text-sm rounded-full cursor-pointer'
                >
                  Get Started
                </p>
              </div>
            </div>
          </div>
        </section>
      </Slider>
      {/* ending of the box sections */}

      <div className='text-text-grey mt-20'>
        {/* Freelancer recomendations */}
        <Swiper
          spaceBetween={50}
          slidesPerView={1}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1280: {
              slidesPerView: 3,
            },
          }}
          className=' !flex !flex-col-reverse   relative'
        >
          <div className='pb-12'>
            <Controller />
          </div>

          {recomdedFreelancer?.map((item) => (
            <SwiperSlide key={'freelancer' + item.id}>
              <FreelancerCard
                freelancer={item}
                handleMessage={handleMessageBoxClick}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className='flex mt-3'>
          <div
            className='px-4 flex items-center gap-2 py-2 ml-auto mb-3 rounded-full border bg-imbue-light-grey border-imbue-light-grey cursor-pointer'
            onClick={() => router.push('/freelancers')}
          >
            <BsFilter size={20} color='black' />
            <p className='text-black'>view all</p>
          </div>
        </div>
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
