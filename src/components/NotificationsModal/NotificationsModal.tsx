import classNames from 'classnames';
import { FlatFeed, StreamApp } from 'react-activity-feed';
import { useSelector } from 'react-redux';

import { RootState } from '@/redux/store/store';

import AcceptBreifNotifications from './notificationComponents/AcceptBreifNotifications';
import ApplyBreifNotification from './notificationComponents/ApplyBreifNotifications';
import GrantApproversNotifications from './notificationComponents/GrantApproversNotifications';
import MilestoneApprovedNotifications from './notificationComponents/MilestoneApprovedNotifications';
import RefundNotification from './notificationComponents/RefundNotification';
import SubmitMilestoneNotification from './notificationComponents/SubmitMilestoneNotification';
import NotificationsLoader from './NotificationsLoader.tsx';

export default function NotificationsModal({ onClose }: { onClose: any }) {
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
            feedGroup='user'
            options={{
              limit: 7,
              withOwnChildren: true,
              withRecentReactions: true,
            }}
            LoadingIndicator={NotificationsLoader}
            Activity={({ activity }) => (
              <div
                key={'notifications' + activity.id}
                onClick={() => onClose(false)}
              >
                {activity.object === 'approved_Milestone.testing' && (
                  <MilestoneApprovedNotifications {...activity} />
                )}
                {activity.object === 'submit_Milestone.testing' && (
                  <SubmitMilestoneNotification {...activity} />
                )}
                {activity.object === 'application.accepted.testing' && (
                  <AcceptBreifNotifications {...activity} />
                )}
                {activity.object === 'breif.test.applied' && (
                  <ApplyBreifNotification {...activity} />
                )}
                {activity.object === 'AddApprovers.testing' && (
                  <GrantApproversNotifications {...activity} />
                )}
                {
                  (
                    activity.object === "refund.initiated" ||
                    activity.object === "refund.complete" ||
                    activity.object === "refund_initialed.testing" ||
                    activity.object === "milestone.rejected"
                  ) && (
                    <RefundNotification {...activity} />
                  )}
              </div>
            )}
          />
        </div>
      </StreamApp>
    </div>
  );
}
