import { Badge } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { getNotification, updateLastNotification } from '@/utils';

import NotificationsModal from '../NotificationsModal/NotificationsModal';

export default function NotificationIcon() {
  const [unreadNotification, setNotificationCount] = useState(0);
  const [isNotificationOn, setNotificationOn] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<
    string | undefined
  >();

  useEffect(() => {
    const notifications = async () => {
      const result = await getNotification();
      setNotificationCount(result.new_notification.length);
      if (result.new_notification.length > 0)
        setLastNotification(result.new_notification[0].id);
    };
    notifications();
    const timerId = setInterval(() => {
      notifications();
    }, 20000);

    return () => clearInterval(timerId);
  }, []);

  const updateFun = async () => {
    await updateLastNotification(lastNotification as string);
  };

  const handleOpenModal = () => {
    setModal((val) => !val);
    if (unreadNotification > 0) {
      setNotificationCount(0);
      if (lastNotification !== undefined) {
        updateFun();
      }
    }
  };

  return (
    <div>
      <Badge badgeContent={unreadNotification} color='error'>
        <Image
          onClick={() => {
            setNotificationOn(() => true);
            handleOpenModal();
          }}
          src='/bell-01.svg'
          width={23}
          height={20}
          className='cursor-pointer '
          alt='notifications'
        />
      </Badge>

      {isNotificationOn && <NotificationsModal isShown={modal} />}
    </div>
  );
}
