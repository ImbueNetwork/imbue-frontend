import { useRouter } from 'next/router';

import OngoingProject from '@/components/Dashboard/FreelacerView/OngoingProject/OngoinProject';

import { Project } from '@/model';

export default function Grants({
  ongoingGrants,
}: {
  ongoingGrants: Project[];
}) {
  const router = useRouter();
  const redirectToNewBrief = () => {
    router.push('/grants/new');
  };
  if (ongoingGrants?.length === 0) {
    return (
      <div className='flex justify-center w-full my-5'>
        <button
          onClick={() => {
            redirectToNewBrief();
          }}
          className='primary-btn in-dark w-button lg:w-1/3'
          style={{ textAlign: 'center' }}
        >
          submit a grant
        </button>
      </div>
    );
  }
  return (
    <div>
      {ongoingGrants?.length && (
        <>
          <div className='bg-background rounded-xl'>
            <OngoingProject projects={ongoingGrants} />
          </div>
        </>
      )}
    </div>
  );
}
