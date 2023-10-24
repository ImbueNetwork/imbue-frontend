import { Skeleton } from '@mui/material';

export default function NotificationsLoader() {
  return (
    <div>
      <div className='flex  hover:bg-imbue-light-purple-three cursor-pointer py-2 border-t border-b px-5'>
        <div className='w-9 flex flex-shrink-0 h-9 mr-3'>
          <Skeleton variant='circular' className='w-9 h-9' />
        </div>
        <div className='text-left w-full'>
          <Skeleton variant='text' sx={{ fontSize: '1.2rem' }} />
          <Skeleton variant='rounded' className='h-14 mt-3' />
        </div>
      </div>
      <div className='flex  hover:bg-imbue-light-purple-three cursor-pointer py-2 border-t border-b px-5'>
        <div className='w-9 flex flex-shrink-0 h-9 mr-3'>
          <Skeleton variant='circular' className='w-9 h-9' />
        </div>
        <div className='text-left w-full'>
          <Skeleton variant='text' sx={{ fontSize: '1.2rem' }} />
          <Skeleton variant='rounded' className='h-14 mt-3' />
        </div>
      </div>
      <div className='flex  hover:bg-imbue-light-purple-three cursor-pointer py-2 border-t border-b px-5'>
        <div className='w-9 flex flex-shrink-0 h-9 mr-3'>
          <Skeleton variant='circular' className='w-9 h-9' />
        </div>
        <div className='text-left w-full'>
          <Skeleton variant='text' sx={{ fontSize: '1.2rem' }} />
          <Skeleton variant='rounded' className='h-14 mt-3' />
        </div>
      </div>
      <div className='flex  hover:bg-imbue-light-purple-three cursor-pointer py-2 border-t border-b px-5'>
        <div className='w-9 flex flex-shrink-0 h-9 mr-3'>
          <Skeleton variant='circular' className='w-9 h-9' />
        </div>
        <div className='text-left w-full'>
          <Skeleton variant='text' sx={{ fontSize: '1.2rem' }} />
          <Skeleton variant='rounded' className='h-14 mt-3' />
        </div>
      </div>
    </div>
  );
}
