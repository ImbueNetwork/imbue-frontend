import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import React, { useState } from 'react';

import FreelancerView from '@/components/FreelacerView/FreelancerView';

TimeAgo.addLocale(en);

type FreelancerApplicationsType = {
  myApplications: any;
};

const MyFreelancerApplications = ({
  myApplications,
}: FreelancerApplicationsType): JSX.Element => {
  const ongoingBriefs = myApplications?.filter(
    (application: any) => !application?.chain_project_id
  );
  const cuttentBriefs = myApplications?.filter(
    (application: any) => application?.chain_project_id
  );
  const [appliedBriefs] = useState<any>(ongoingBriefs);
  const [currentProject] = useState<any>(cuttentBriefs);

  return (
    <>
      <FreelancerView
        myApplications={appliedBriefs}
        currentProject={currentProject}
      />
    </>
  );
};

export default MyFreelancerApplications;
