/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { useDispatch, useSelector } from 'react-redux';
import {
  DefaultGenerics,
  FormatMessageResponse,
  StreamChat,
} from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';

import { fetchUser, getStreamChat } from '@/utils';

import ChatPopup from '@/components/ChatPopup';
import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
const LoginPopup = dynamic(() => import('@/components/LoginPopup/LoginPopup'));

// import LoginPopup from '@/components/LoginPopup/LoginPopup';

import { Badge } from '@mui/material';
import { BiChevronDown, BiRightArrowAlt } from 'react-icons/bi';
import { BsFilter } from 'react-icons/bs';
import { FiBookmark } from 'react-icons/fi';
import { MdOutlineAttachMoney } from 'react-icons/md';

import { strToIntRange } from '@/utils/helper';

import AreaGrah from '@/components/AreaGraph';
import BriefComponent from '@/components/BriefComponent';
import MessageComponent from '@/components/MessageComponent';

import { BriefSqlFilter, Freelancer, Project, User } from '@/model';
import { Brief } from '@/model';
import {
  callSearchBriefs,
  getAllBriefs,
  getAllSavedBriefs,
} from '@/redux/services/briefService';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { setUnreadMessage } from '@/redux/slices/userSlice';
import { RootState } from '@/redux/store/store';

export type DashboardProps = {
  user: User;
  isAuthenticated: boolean;
  myBriefs: Brief;
  myApplicationsResponse: Project[];
};

const Dashboard = (): JSX.Element => {
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [client, setClient] = useState<StreamChat>();
  const {
    user,
    loading: loadingUser,
    error: userError,
  } = useSelector((state: RootState) => state.userState);
  const [unreadMessages, setUnreadMsg] = useState<number>(0);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [myApplications, _setMyApplications] = useState<Project[]>();
  const [loadingStreamChat, setLoadingStreamChat] = useState<boolean>(true);

  const [messageList, setMessageList] = useState<
    FormatMessageResponse<DefaultGenerics>[] | null
  >();

  const router = useRouter();
  const { briefId } = router.query;

  const [error, setError] = useState<any>(userError);

  const dispatch = useDispatch();

  const handleMessageBoxClick = async (
    user_id: number,
    _freelancer: Freelancer
  ) => {
    if (user_id) {
      setShowMessageBox(true);
      setTargetUser(await fetchUser(user_id));
    } else {
      //TODO: check if user is logged in
      // redirect("login", `/dapp/freelancers/${freelancer?.username}/`);
    }
  };

  const redirectToBriefApplications = (applicationId: string) => {
    router.push(`/briefs/${briefId}/applications/${applicationId}`);
  };

  useEffect(() => {
    const setupStreamChat = async () => {
      try {
        if (!user?.username && !loadingUser) return router.push('/');
        setClient(await getStreamChat());
        _setMyApplications(await getFreelancerApplications(user?.id));
      } catch (error) {
        setError({ message: error });
      } finally {
        setLoadingStreamChat(false);
      }
    };

    setupStreamChat();
  }, [user]);

  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [briefs_total, setBriefsTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // FIXME: setLoading
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const [pageInput, setPageInput] = useState<number>(1);

  useEffect(() => {
    const fetchAndSetBriefs = async () => {
      try {
        if (!Object.keys(router?.query).length) {
          const briefs_all: any = await getAllBriefs(itemsPerPage, currentPage);
          if (briefs_all.status === 200) {
            setBriefs(briefs_all?.currentData);
            setBriefsTotal(briefs_all?.totalBriefs);
          } else {
            setError({ message: 'Something went wrong. Please try again' });
          }
        } else {
          let filter: BriefSqlFilter = {
            experience_range: [],
            submitted_range: [],
            submitted_is_max: false,
            length_range: [],
            skills_range: [],
            length_is_max: false,
            search_input: '',
            items_per_page: itemsPerPage,
            page: currentPage,
            verified_only: false,
            non_verified: false,
          };

          const verifiedOnlyPropIndex = selectedFilterIds.indexOf('4-0');

          if (router.query.page) {
            const pageQuery = Number(router.query.page);
            filter.page = pageQuery;
            setCurrentPage(pageQuery);
            setPageInput(pageQuery);
          }

          if (router.query.non_verified) {
            filter.non_verified = true;
          }

          if (sizeProps) {
            filter.items_per_page = Number(sizeProps);
            setItemsPerPage(Number(sizeProps));
          }

          if (expRange) {
            const range = strToIntRange(expRange);
            range?.forEach?.((v: any) => {
              if (!selectedFilterIds.includes(`0-${v - 1}`))
                selectedFilterIds.push(`0-${v - 1}`);
            });

            filter = { ...filter, experience_range: strToIntRange(expRange) };
          }

          if (skillsProps) {
            const range = strToIntRange(skillsProps);
            range?.forEach?.((v: any) => {
              if (!selectedFilterIds.includes(`3-${v}`))
                selectedFilterIds.push(`3-${v}`);
            });

            filter = { ...filter, skills_range: range };
          }

          if (submitRange) {
            const range = strToIntRange(submitRange);
            range?.forEach?.((v: any) => {
              if (v > 0 && v < 5) selectedFilterIds.push(`1-${0}`);

              if (v >= 5 && v < 10) selectedFilterIds.push(`1-${1}`);

              if (v >= 10 && v < 15) selectedFilterIds.push(`1-${2}`);

              if (v > 15) selectedFilterIds.push(`1-${3}`);
            });
            filter = { ...filter, submitted_range: strToIntRange(submitRange) };
          }
          if (heading) {
            filter = { ...filter, search_input: heading };
            // const input = document.getElementById(
            //   'search-input'
            // ) as HTMLInputElement;
            // if (input) input.value = heading.toString();
            setSearchInput(heading.toString());
          }

          if (verifiedOnlyProp) {
            if (!selectedFilterIds.includes(`4-0`))
              selectedFilterIds.push(`4-0`);

            filter = { ...filter, verified_only: true };
          } else if (verifiedOnlyPropIndex !== -1) {
            // const newFileter = [...selectedFilterIds].filter((f) => f !== '4-0')
            // setSlectedFilterIds(newFileter)
            selectedFilterIds.splice(verifiedOnlyPropIndex, 1);
          }

          if (lengthRange) {
            const range = strToIntRange(lengthRange);
            range?.forEach?.((v: any) => {
              if (!selectedFilterIds.includes(`2-${v - 1}`))
                selectedFilterIds.push(`2-${v - 1}`);
            });
            filter = { ...filter, length_range: strToIntRange(lengthRange) };
          }

          let result: any = [];

          if (savedBriefsActive) {
            result = await getAllSavedBriefs(
              filter.items_per_page || itemsPerPage,
              currentPage,
              currentUser?.id
            );
          } else {
            result = await callSearchBriefs(filter);
          }

          if (result.status === 200 || result.totalBriefs !== undefined) {
            const totalPages = Math.ceil(
              result?.totalBriefs / (filter?.items_per_page || 6)
            );

            if (totalPages < filter.page && totalPages > 0) {
              router.query.page = totalPages.toString();
              router.push(router, undefined, { shallow: true });
              filter.page = totalPages;
            }

            setBriefs(result?.currentData);
            setBriefsTotal(result?.totalBriefs);
          } else {
            setError({ message: 'Something went wrong. Please try again' });
          }
        }
      } catch (error) {
        setError({ message: 'Something went wrong. Please try again' + error });
      } finally {
        setLoading(false);
      }
    };

    router.isReady && fetchAndSetBriefs();
  }, [router.isReady, currentPage, itemsPerPage]);

  useEffect(() => {
    if (client && user?.username && !loadingStreamChat) {
      client?.connectUser(
        {
          id: String(user.id),
          username: user.username,
          name: user.display_name,
        },
        user.getstream_token
      );
      const getUnreadMessageChannels = async () => {
        const result = await client.getUnreadCount();
        dispatch(setUnreadMessage({ message: result.channels.length }));
      };

      const getChannel = async () => {
        const filter = {
          type: 'messaging',
          members: { $in: [String(user.id)] },
        };
        const sort: any = { last_message_at: -1 };
        const channels = await client.queryChannels(filter, sort, {
          limit: 4,
          watch: true, // this is the default
          state: true,
        });
        const lastMessages: FormatMessageResponse<DefaultGenerics>[] = [];
        channels.map((channel) => {
          lastMessages.push(channel.lastMessage());
        });
        setMessageList(lastMessages);
      };
      getUnreadMessageChannels();
      getChannel();
      client.on((event) => {
        if (event.total_unread_count !== undefined) {
          getChannel();
          dispatch(setUnreadMessage({ message: event.unread_channels }));
          setUnreadMsg(event.total_unread_count);
        }
      });
    }
  }, [client, user?.getstream_token, user?.username, loadingStreamChat]);

  if (loadingStreamChat || loadingUser || loading) return <FullScreenLoader />;
  console.log(briefs);

  return client ? (
    <div className='bg-white  mt-2 py-7 px-5 rounded-3xl'>
      <>
        <p className='text-black text-[27px]'>
          Welcome , {user.display_name.split(' ')[0]} 👋
        </p>
        <p className='text-text-aux-colour text-sm'>
          Glad to have you on imbue
        </p>
      </>
      {/* starting of the box sections */}
      <div className='flex text-text-grey gap-7 mt-9'>
        <div className=' py-5 px-5 rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full'>
          <div className='flex justify-between'>
            <p>Projects</p>

            <p className='bg-imbue-purple px-7 py-2 text-white text-sm rounded-full'>
              View all
            </p>
          </div>
          <div className='mt-5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1  rounded-full bg-imbue-coral' />
              <p className='text-sm min-w-fit '>Completed Projects</p>
              <hr className='w-full border-dashed mt-3  border-imbue-coral ' />
              <p className='text-[22px] font-semibold text-black'>12</p>
            </div>
          </div>
          <div className='mt-0.5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1 rounded-full bg-imbue-purple' />
              <p className='text-sm min-w-fit '>Active Projects</p>
              <hr className='w-full border-dashed mt-3  border-imbue-purple ' />
              <p className='text-[22px] font-semibold text-black'>2</p>
            </div>
          </div>
          <div className='mt-0.5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1 rounded-full bg-imbue-coral' />
              <p className='text-sm min-w-fit'>Pending Projects</p>
              <hr className='w-full border-dashed mt-3  border-t-imbue-coral ' />
              <p className='text-[22px] font-semibold text-black'>4</p>
            </div>
          </div>
          <div className='mt-0.5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1 rounded-full bg-imbue-lemon' />
              <p className='text-sm min-w-fit '>Saved Projects</p>
              <hr className='w-full border-dashed mt-3  border-imbue-lemon ' />
              <p className='text-[22px] font-semibold text-black'>36</p>
            </div>
          </div>
        </div>
        <div className=' py-5 px-5 flex flex-col justify-between rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full '>
          <div className='flex justify-between'>
            <p>Brief</p>
            <p className='text-white bg-imbue-purple px-7 py-2 rounded-full text-sm'>
              Open Brief
            </p>
          </div>
          <div>
            <div className='mb-2 flex'>
              <p className='text-4xl font-semibold text-black'>3</p>
              <div className='flex ml-3'>
                <Image
                  className='rounded-full  w-9 h-9 object-cover'
                  src={'/slide_1.png'}
                  width={30}
                  height={20}
                  alt='image'
                />

                <Image
                  className='rounded-full -ml-2 w-9 h-9 object-cover'
                  src={'/slide_2.png'}
                  width={30}
                  height={30}
                  alt='image'
                />
                <Image
                  className='rounded-full -ml-2 w-9 h-9 object-cover'
                  src={'/slide_3.png'}
                  width={30}
                  height={30}
                  alt='image'
                />
              </div>
            </div>
            <div className='flex  justify-between'>
              <p>Approved brief</p>
              <div className='flex bg-white px-2 py-1.5 rounded-md gap-1.5 items-center'>
                <div className='w-1 h-1 rounded-full bg-imbue-coral' />{' '}
                <p className='text-black text-sm'>Approved</p>
                <BiChevronDown color='black' size={18} />
              </div>
            </div>
          </div>
        </div>
        <div className=' py-5 px-5 flex flex-col rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full '>
          <div className='flex justify-between'>
            <p>Total Earnings</p>
            <div className='px-3 py-0.5 border text-black border-text-aux-colour rounded-full'>
              <BiRightArrowAlt size={22} className='-rotate-45' />
            </div>
          </div>
          <div className='text-black mt-auto'>
            <div className='flex'>
              <MdOutlineAttachMoney size={23} />
              <p className='text-4xl font-semibold'>32,975.00</p>
            </div>
            <p className='text-text-grey'>Payout Accounts</p>
          </div>
        </div>
      </div>
      {/* ending of the box sections */}
      <div className='mt-9 flex w-full gap-7'>
        <div className='border-2 text-text-aux-colour max-w-[75%] rounded-2xl w-full border-imbue-light-grey'>
          <div className='justify-between py-2 border-b b items-center flex px-7'>
            <p className='text-[#747474]'>Recomended Briefs</p>
            <div className='flex gap-5 items-center'>
              <div className='flex group-focus:border-black active:border-black border border-imbue-light-grey py-2 px-3 rounded-full items-center'>
                <HiMagnifyingGlass size={20} color='black' />
                <input
                  className='text-base group text-black ml-2 focus:outline-none h-7'
                  type='text'
                />
              </div>
              <div className='px-4 flex items-center gap-2 py-2 rounded-full border border-imbue-light-grey'>
                <FiBookmark size={20} color='black' />
                <p className='text-black'>Saved jobs</p>
              </div>
              <div className='px-4 flex items-center gap-2 py-2 rounded-full border bg-imbue-light-grey border-imbue-light-grey'>
                <BsFilter size={20} color='black' />
                <p className='text-black'>Filter</p>
              </div>
            </div>
          </div>
          {/* ending of header nav */}
          {/* starting of briefs */}
          {briefs.map((brief) => (
            <BriefComponent key={brief.id} brief={brief} />
          ))}
          {/* ends of briefs */}
        </div>
        <div className='max-w-[25%] w-full rounded-md '>
          {/* Starting of graph */}
          <div className='bg-imbue-light-grey px-0.5 rounded-3xl pb-0.5 '>
            <div className='flex justify-between items-center py-7 px-7'>
              <p className='text-[#747474]'>Analytics</p>
              <BsFilter size={27} color='black' />
            </div>
            <div className='bg-white rounded-3xl relative '>
              <p className='text-black text-4xl font-semibold absolute bottom-28 left-6'>
                124
              </p>
              <AreaGrah />
            </div>
          </div>
          {/* End of graph */}
          <div className='bg-imbue-light-grey px-0.5 mt-14 rounded-3xl pb-0.5 '>
            <div className='flex justify-between items-center py-4 px-7'>
              <Badge badgeContent={unreadMessages} color='error'>
                <p className='text-[#747474]'>Messaging</p>
              </Badge>
              <BsFilter size={27} color='black' />
            </div>
            <div className='px-3 bg-white py-3 rounded-3xl'>
              {messageList?.map((item, index) => (
                <MessageComponent key={'message-component' + index} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p>GETSTREAM_API_KEY not found</p>
  );
};

export default Dashboard;
