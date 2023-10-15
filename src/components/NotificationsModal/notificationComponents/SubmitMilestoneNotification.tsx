import Image from 'next/image';
import { useRouter } from 'next/router';

export default function SubmitMilestoneNotification(activity: any) {
  const router = useRouter();
  console.log(activity);
  return (
    <div
      onClick={() => router.push(`/projects/${activity.data.briefId}`)}
      className='flex  hover:bg-imbue-light-purple-three cursor-pointer py-2 border-t border-b px-5'
    >
      <div className='w-9 flex flex-shrink-0 h-9 mr-3'>
        <Image
          className='rounded-full w-9 h-9 object-cover'
          src={activity.data?.sender?.profile_photo || '/profile-image.png'}
          height={20}
          width={30}
          alt='user'
        />
      </div>
      <div className='text-left'>
        <p className='text-base font-semibold'>
          {activity.data.title || 'Title'}
        </p>
        <p className='text-sm mt-3'>
          {/* <span>{activity.data.sender.display_name}</span> has submitted the
          milestone {number_of_milestone} for the project{project_id}. Take a
          moment to review and provide your feedback. */}
        </p>
      </div>
    </div>
  );
}
