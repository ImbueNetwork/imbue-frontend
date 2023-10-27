import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Image from 'next/image';
import { DefaultGenerics, FormatMessageResponse } from 'stream-chat';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

export default function MessageComponent({
  handleMessageClick,
  props,
}: {
  props: FormatMessageResponse<DefaultGenerics>;
  handleMessageClick: any;
}) {
  const handleClick = () => {
    // router.push({
    //   pathname: `/dashboard/messages`,
    //   query: `chat=${props.cid?.split(':')[1]}`,
    // });
    handleMessageClick(props?.user?.id);
  };

  return (
    <div
      onClick={handleClick}
      className='flex items-center hover:bg-imbue-light-purple-three px-4 py-1 rounded-sm cursor-pointer text-black gap-5 text-sm'
    >
      <Image
        className='w-14 h-14 mb-2 rounded-full'
        src={
          props.user?.profile_photo ||
          require('@/assets/images/profile-image.png')
        }
        width={40}
        height={40}
        alt='profile image'
      />
      <div className='flex border-b w-full pb-2 justify-between'>
        <div className=' space-y-1'>
          <p>{props.user?.name}</p>
          <p className='text-text-aux-colour'>{props.text}</p>
        </div>
        <p className='min-w-fit text-text-aux-colour'>
          {props.created_at && timeAgo.format(new Date(props.created_at))}
        </p>
      </div>
    </div>
  );
}
