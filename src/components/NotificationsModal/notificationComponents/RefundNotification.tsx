import Image from 'next/image';
import { useRouter } from 'next/router';

export default function RefundNotification(activity: any) {
    const router = useRouter();
    const handleClick = (e: any) => {
        if (e.target.id === 'user') {
            router.push(`/profile/${activity.data.sender.username}`);
        } else router.push(`/projects/${activity.data.briefId}`);
    };

    return (
        <div
            onClick={handleClick}
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
                    {activity.data.title || 'You have a notification'}
                </p>
                <p className='text-sm mt-3'>
                    <p dangerouslySetInnerHTML={{ __html: activity.data.text }} ></p>
                </p>
            </div>
        </div>
    );
}
