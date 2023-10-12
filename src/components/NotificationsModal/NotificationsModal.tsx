import classNames from 'classnames';
import Image from 'next/image';
import { FlatFeed, StreamApp } from 'react-activity-feed';
import { useSelector } from 'react-redux';

import { RootState } from '@/redux/store/store';

export default function NotificationsModal({
  isShown,
  handleNotification,
}: {
  isShown: boolean;
  handleNotification: any;
}) {
  const { user } = useSelector((state: RootState) => state.userState);
  return (
    <div
      className={classNames(
        'w-[29.375rem]  max-h-[85vh]  overflow-auto text-left bg-white -left-[28rem] top-10 rounded-3xl py-5 shadow-lg absolute',
        isShown ? 'block' : 'hidden'
      )}
    >
      <p className='text-xl text-black mb-3 mt-2 ml-6'>Notifications</p>
      <StreamApp
        options={{ keepAlive: true }}
        apiKey={process.env.GETSTREAM_API_KEY as string}
        token={user.getstream_token as string}
        appId={process.env.GETSTREAM_APP_ID as string}
      >
        <div className='bg-white text-center text-black'>
          <FlatFeed
            notify
            feedGroup='user'
            options={{
              limit: 7,
              withOwnChildren: true,
              withRecentReactions: true,
            }}
            Notifier={handleNotification}
            Activity={({ activity }) => (
              <div className='flex  hover:bg-imbue-light-purple-three py-2 border-t border-b px-5'>
                <div className='w-9 flex flex-shrink-0 h-9 mr-3'>
                  <Image
                    className='rounded-full w-9 h-9 object-cover'
                    src={
                      activity.data?.sender.profile_photo ||
                      '/profile-image.png'
                    }
                    height={20}
                    width={30}
                    alt='user'
                  />
                </div>
                <div className='text-left'>
                  <p className='text-base font-semibold'>
                    A New Milestone has been made
                  </p>
                  <p className='text-sm mt-3'>
                    “Web design”, a milestone on the @dbranddr’s Entrypal app
                    project just got marked as completed and needs your vote of
                    approval.
                  </p>
                  <button className='bg-imbue-purple text-white text-sm mt-5 px-7 py-2 rounded-full'>
                    Vote
                  </button>
                </div>
              </div>
            )}
          />
        </div>
      </StreamApp>
    </div>
  );
}
