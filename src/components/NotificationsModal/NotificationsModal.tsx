import classNames from 'classnames';
import { FlatFeed, StreamApp } from 'react-activity-feed';
import { useSelector } from 'react-redux';

import { RootState } from '@/redux/store/store';

import ApplyBreifNotification from './ApplyBreifNotifications';
import MilestoneVotingNotification from './MilestoneVotingNotification';

export default function NotificationsModal() {
  const { user } = useSelector((state: RootState) => state.userState);
  return (
    <div
      className={classNames(
        'w-[29.375rem]  max-h-[85vh]  overflow-auto text-left bg-white   py-5 '
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
            Activity={({ activity }) => (
              <>
                {(activity.object === 'approved_Milestone.testing' ||
                  activity.object === 'submit_Milestone.testing') && (
                  <MilestoneVotingNotification {...activity} />
                )}
                {(activity.object === 'breif.test.applied' ||
                  activity.object === 'application.accepted.testing' ||
                  activity.object === 'AddApprovers.testing') && (
                  <ApplyBreifNotification {...activity} />
                )}
              </>
            )}
          />
        </div>
      </StreamApp>
    </div>
  );
}
