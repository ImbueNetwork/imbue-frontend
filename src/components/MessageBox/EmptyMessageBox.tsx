import Image from 'next/image';

export default function EmptyMessageBox() {
  return (
    <div className='flex flex-col h-full justify-center items-center '>
      <Image
        className='w-[14.125rem]'
        src={'./messages.svg'}
        width={20}
        height={0}
        alt=''
      />
      <p className='text-black -mt-16'>No chats selected</p>
      <p className='text-text-aux-colour text-sm'>
        Click on a conversation to open
      </p>
    </div>
  );
}
