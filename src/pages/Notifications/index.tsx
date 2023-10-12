import {
  FlatFeed,
  NotificationDropdown,
  StatusUpdateForm,
  StreamApp,
} from 'react-activity-feed';

export default function Notification() {
  return (
    <div>
      <StreamApp
        options={{ keepAlive: true }}
        apiKey='cvmy2kcxetnm'
        token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNiJ9.mIh9Q65snXUUfaylCaxPPX-CfRRMIFSd8aa5Qzlw5jc'
        appId='1238336'
      >
        <NotificationDropdown />
        <div className='bg-white text-black'>
          <FlatFeed
            notify={true}
            feedGroup='notification'
            options={{
              limit: 5,
              offset: 20,
              withOwnChildren: true,
              withRecentReactions: true,
            }}
            Activity={({ activity }) => (
              <div className='flex py-4 px-5'>
                <div className='w-9 h-9 mr-3'>
                  {/* <Image
                  className='rounded-full w-9 h-9 object-cover'
                  src={activity.data?.sender.profile_photo}
                  height={20}
                  width={30}
                  alt='yo'
                /> */}
                </div>
                <div>
                  <p className='text-base font-semibold'>p </p>
                  <p>
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
