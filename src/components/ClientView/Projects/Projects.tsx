import { useRouter } from 'next/router';

import { BriefLists } from '@/components/Briefs/BriefsList';

export default function Projects({ briefs }: { briefs: any }) {
  const router = useRouter();
  const redirectToNewBrief = () => {
    router.push('/briefs/new');
  };
  if (briefs?.acceptedBriefs?.length === 0) {
    return (
      <div className='flex justify-center w-full my-5'>
        <button
          onClick={() => {
            redirectToNewBrief();
          }}
          className='primary-btn in-dark w-button lg:w-1/3'
          style={{ textAlign: 'center' }}
        >
          Post a Brief
        </button>
      </div>
    );
  }
  return (
    <div>
      {briefs?.acceptedBriefs?.length && (
        <>
          <BriefLists
            briefs={briefs?.acceptedBriefs}
            areAcceptedBriefs={true}
          />
        </>
      )}
    </div>
  );
}
