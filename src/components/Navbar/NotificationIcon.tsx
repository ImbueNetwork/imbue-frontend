import { Badge } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useFeedContext } from 'react-activity-feed';

import NotificationsModal from '../NotificationsModal/NotificationsModal';

const Wrapper = (setNotificationCount: any) => {
  return function NotifyComponent(val: any) {
    const { hasDoneRequest, unread, unseen } = useFeedContext();
    useEffect(() => {
      if (!hasDoneRequest) return;
      if (val.adds.length > 0) {
        setNotificationCount(val.adds.length);
      } else setNotificationCount(0);
    }, [hasDoneRequest, unread, unseen, val]);
    return null;
  };
};

export default function NotificationIcon() {
  const [unreadNotification, setNotificationCount] = useState(0);
  const [isNotificationOn, setNotificationOn] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const showModalHandler = () => {
    setModal((val) => !val);
    setNotificationCount(0);
    window.localStorage.removeItem('notification');
  };

  const handleNotification = (num: number) => {
    setNotificationCount(num);
    window.localStorage.setItem('notification', unreadNotification.toString());
  };
  return (
    <div>
      <Badge badgeContent={unreadNotification} color='primary'>
        <Image
          onClick={() => {
            setNotificationOn((val) => true);
            showModalHandler();
          }}
          src='/bell-01.svg'
          width={23}
          height={20}
          className='cursor-pointer '
          alt='notifications'
        />
      </Badge>

      {isNotificationOn && (
        <NotificationsModal
          handleNotification={Wrapper(handleNotification)}
          isShown={modal}
        />
      )}
    </div>
  );
}
