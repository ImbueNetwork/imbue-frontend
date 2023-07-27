/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import FullScreenLoader from '@/components/FullScreenLoader';
import Login from '@/components/Login';

import { FETCHED_SKILLS } from '@/constants/constants';
import { getLinkedInSkills } from '@/redux/services/briefService';
import { RootState } from '@/redux/store/store';

export default function Home() {
  const router = useRouter();
  const [loginModal, setLoginModal] = useState<boolean>(false);

  const { user, loading } = useSelector((state: RootState) => state.userState);

  useEffect(() => {
    !loading && getLogedInUser();
  }, [user, loading]);

  useEffect(() => {
    const storedState = localStorage.getItem(FETCHED_SKILLS);

    console.log({ storedState });

    if (user?.username && !loading && !storedState) {
      getLinkedInSkills();
    }
  }, []);

  const getLogedInUser = async () => {
    try {
      if (user?.username) {
        // FIXME:
        // const userAuth = {
        //   isAuthenticated: true,
        //   user: userResponse,
        // };
        // localStorage.setItem("userAuth", JSON.stringify(userAuth));
        router.push('/dashboard');
      } else {
        setLoginModal(true);
      }
    } catch (error) {
      // TODO: show error
      console.log(error);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <Login
      visible={loginModal && !loading}
      setVisible={(val) => {
        setLoginModal(val);
      }}
      redirectUrl={'/dashboard'}
    />
  );
}
