import Image from 'next/image';
import { useRouter } from 'next/router';
export default function AcceptBreifNotifications(activity: any) {
  const router = useRouter();
  const handleClick = (e: any) => {
    if (e.target.id === 'brief') {
      router.push(`/briefs/${activity.data.briefId}`);
    } else {
      router.push(
        `/briefs/${activity.data.briefId}/applications/${activity.data.applicationId}`
      );
    }
  };
  return (
    <div
      onClick={handleClick}
      className='flex hover:bg-imbue-light-purple-three cursor-pointer py-3 border-t border-b px-5'
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
      <div className='text-left pb-2'>
        <p className='text-base font-semibold'>
          {activity.data.title || 'Title'}
        </p>
        <p className='text-sm mt-3'>
          {`You're`} in! Your application for the{' '}
          <span id='brief' className='text-lg text-imbue-purple underline'>
            brief
          </span>{' '}
          has been accepted. {"Let's"} get started!
        </p>
      </div>
    </div>
  );
}
