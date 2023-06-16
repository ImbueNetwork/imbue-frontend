import { googleLogout } from '@react-oauth/google';
import { useEffect } from 'react';

import { redirect } from '@/utils';

import { postAPIHeaders } from '@/config';

const Logout = () => {
  const logout = async () => {
    await fetch(`/api/auth/logout`, {
      headers: postAPIHeaders,
      method: 'get',
    });
    googleLogout();
    await redirect('');
  };

  useEffect(() => {
    void logout();
  }, []);
};

export default Logout;
