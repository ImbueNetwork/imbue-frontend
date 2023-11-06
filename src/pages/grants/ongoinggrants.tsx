import ArrowBackIcon from '@mui/icons-material/ChevronLeft';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Grants from '@/components/ClientView/Grants/Grants';
import FullScreenLoader from '@/components/FullScreenLoader';

import { applicationStatusId } from '@/model';
import { getUsersOngoingGrants } from '@/redux/services/projectServices';
import { RootState } from '@/redux/store/store';

export default function Ongoinggrants() {
  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [grants, setGrants] = useState<any[]>([]);
  const router = useRouter();
  const status_id = router.query.statusId;
  useEffect(() => {
    const setUserBriefs = async () => {
      const resPonse = await getUsersOngoingGrants(
        user?.web3_address as string
      );

      const filterGrant = resPonse.filter(
        (item: any) => item.status_id === Number(status_id)
      );
      setGrants(filterGrant);
    };
    setUserBriefs();
  }, [status_id, user, user?.id, user?.web3_address]);

  if (loadingUser) {
    return <FullScreenLoader />;
  }

  return (
    <div className='bg-white rounded-3xl pt-5 overflow-hidden relative'>
      <div
        onClick={() => router.back()}
        className='border border-content group hover:bg-content rounded-full flex items-center justify-center cursor-pointer absolute left-5 top-10'
      >
        <ArrowBackIcon
          className='h-7 w-7 group-hover:text-white'
          color='secondary'
        />
      </div>
      <div className=' mx-2 border px-7 py-5 rounded-3xl'>
        <p className='text-2xl text-black ml-10'>
          {applicationStatusId[Number(status_id)]} Grants
        </p>
      </div>
      <div className='mt-5'>
        <Grants ongoingGrants={grants} />
      </div>
    </div>
  );
}
