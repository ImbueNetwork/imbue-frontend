import { Badge, Menu } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { getNotification, updateLastNotification } from '@/utils';

import NotificationsModal from '../NotificationsModal/NotificationsModal';

export default function NotificationIcon() {
  const [unreadNotification, setNotificationCount] = useState(0);
  const [modal, setModal] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

  const handleOpenModal = (e: any) => {
    setModal((val) => !val);
    setAnchorEl(e.target);
    if (unreadNotification > 0) {
      setNotificationCount(0);
      if (lastNotification !== undefined) {
        updateFun();
      }
    }
  };
  const handleCloseModal = () => {
    setAnchorEl(null);
    setModal(false);
  };
  return (
    <div>
      <Badge badgeContent={unreadNotification} color='error'>
        <Image
          onClick={handleOpenModal}
          src='/bell-01.svg'
          width={23}
          height={20}
          className='cursor-pointer '
          alt='notifications'
        />
      </Badge>
      <Menu
        disableScrollLock={true}
        id='basic-menu'
        anchorEl={anchorEl}
        open={modal}
        onClose={handleCloseModal}
        className='mt-7 '
      >
        <NotificationsModal />
      </Menu>
    </div>
  );
}
