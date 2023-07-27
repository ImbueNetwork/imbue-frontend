/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import FullScreenLoader from '@/components/FullScreenLoader';
import Login from '@/components/Login';

import { RootState } from '@/redux/store/store';

export default function Home() {
  const router = useRouter();
  const [loginModal, setLoginModal] = useState<boolean>(false);

  const { user, loading } = useSelector((state: RootState) => state.userState);

  useEffect(() => {
    !loading && getLogedInUser();
  }, [user, loading]);

  useEffect(() => {
    // Fetch the data from the GitHub URL
    fetch(
      'https://raw.githubusercontent.com/varadchoudhari/LinkedIn-Skills-Crawler/master/output/all_skills.txt'
    )
      .then((response) => response.text())
      .then((textData) => {
        const dataArray = textData.split('\n');
        const skills = dataArray.map((skill) => skill.trim());

        // Make a request to the server-side route to insert the data
        fetch('/api/briefs/skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(skills),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data.message);
          })
          .catch((error) => {
            console.error('Error inserting data:', error);
          });
      })
      .catch((error) => {
        console.error('Failed to fetch data:', error);
      });
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
