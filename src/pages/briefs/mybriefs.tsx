import { useRouter } from 'next/router';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { fetchUser } from '@/utils';

import ChatPopup from '@/components/ChatPopup';
import MyClientBriefsView from '@/components/Dashboard/MyClientBriefsView';

import { User } from '@/model';
import { RootState } from '@/redux/store/store';

export default function MyBriefs() {
  const { user } = useSelector((state: RootState) => state.userState);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const router = useRouter();
  const { briefId } = router.query;
  const handleMessageBoxClick = async (user_id: number) => {
    if (user_id) {
      setShowMessageBox(true);
      setTargetUser(await fetchUser(user_id));
    } else {
      //TODO: check if user is logged in
      // redirect("login", `/dapp/freelancers/${freelancer?.username}/`);
    }
  };

  const redirectToBriefApplications = (applicationId: string) => {
    router.push(`/briefs/${briefId}/applications/${applicationId}`);
  };
  return (
    <div className='bg-white py-5 rounded-3xl'>
      <MyClientBriefsView
        {...{
          user,
          briefId,
          handleMessageBoxClick,
          redirectToBriefApplications,
        }}
      />
      {user && showMessageBox && (
        <ChatPopup
          showMessageBox={showMessageBox}
          setShowMessageBox={setShowMessageBox}
          targetUser={targetUser}
          browsingUser={user}
          showFreelancerProfile={true}
        />
      )}
    </div>
  );
}
