import classNames from 'classnames';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { AiOutlineArrowUp } from 'react-icons/ai';
import { useSelector } from 'react-redux';

import { RootState } from '@/redux/store/store';

export default function WelcomForNewUser({
  handleClose,
}: {
  handleClose: any;
}) {
  const { user } = useSelector((state: RootState) => state.userState);
  const [select, setSelected] = useState('work');
  const router = useRouter();
  const handleDirection = () => {
    if (select === 'work') {
      router.push('/freelancers/new');
    }
    handleClose(false);
  };

  return (
    <div className='w-[41.75rem] rounded-2xl bg-white px-7 py-7'>
      <div>
        <p className='text-2xl'>
          Welcome to imbue, {user.display_name.split(' ')[0]} 👋
        </p>
        <p className='text-sm text-text-aux-colour'>Glad to have you join</p>
        <div className='flex gap-5 py-5 '>
          <div className='w-[50%] px-2 rounded-xl py-5 flex flex-col border'>
            <div className='space-y-5 px-5 '>
              <p className='flex items-center gap-3'>
                <Image
                  src='/Onboard/bank-note-01.svg'
                  width={20}
                  height={20}
                  alt='icons'
                />
                Get paid securely
              </p>
              <p className='flex items-center gap-3'>
                <Image
                  src='/Onboard/hearts.svg'
                  width={20}
                  height={20}
                  alt='icons'
                />
                Work on what you love
              </p>
              <p className='flex items-center gap-3'>
                <Image
                  src='/Onboard/building-02.svg'
                  width={20}
                  height={20}
                  alt='icons'
                />
                Build your dream team
              </p>
            </div>
            <button
              onClick={() => setSelected('work')}
              className={classNames(
                'py-5 mt-16 rounded-lg w-full',
                select == 'work' ? 'bg-imbue-light-grey' : 'border'
              )}
            >
              I am here to work
            </button>
          </div>
          <div className='w-[50%] py-5 px-2 flex rounded-xl flex-col  border'>
            <div className='space-y-5 px-5 '>
              <p className='flex items-center gap-3'>
                <Image
                  src='/Onboard/zap-square.svg'
                  width={20}
                  height={20}
                  alt='icons'
                />
                Build,Ship,Launch Fast!
              </p>
              <p className='flex items-center gap-3'>
                <Image
                  src='/Onboard/safe.svg'
                  width={20}
                  height={20}
                  alt='icons'
                />
                Saftey & Transparency
              </p>
              <p className='flex items-center gap-3'>
                <Image
                  src='/Onboard/globe-05.svg'
                  width={20}
                  height={20}
                  alt='icons'
                />
                Get a world-class teams
              </p>
            </div>
            <button
              onClick={() => setSelected('hire')}
              className={classNames(
                'py-5 mt-16 rounded-lg w-full',
                select == 'hire' ? 'bg-imbue-light-grey' : 'border'
              )}
            >
              I am here to hire Freelancers
            </button>
          </div>
        </div>
        <p className='bg-[#FFE8E7] text-imbue-coral px-7 rounded-md py-1.5'>
          You can always switch/create a hirer or freelancer profile after you
          sign up
        </p>
      </div>
      <button
        onClick={handleDirection}
        className='bg-imbue-purple flex items-center gap-1 text-white px-9 py-2 rounded-full mt-7'
      >
        Continue
        <AiOutlineArrowUp className='rotate-90 text-imbue-lime' size={18} />
      </button>
    </div>
  );
}
