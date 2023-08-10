import OngoingProject from '@/components/Dashboard/FreelacerView/OngoingProject/OngoinProject';

import { Project } from '@/model';

export default function Grants({
  ongoingGrants,
}: {
  ongoingGrants: Project[];
}) {
  return (
    <div>
      {ongoingGrants?.length && (
        <>
          <p className='text-imbue-purple-dark text-base lg:text-xl mb-3 mt-4 lg:mt-10'>
            Ongoing Grants
          </p>
          <div className='bg-background rounded-xl overflow-hidden'>
            <OngoingProject projects={ongoingGrants} />
          </div>
        </>
      )}
    </div>
  );
}
