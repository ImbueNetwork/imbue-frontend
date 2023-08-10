import { Freelancer, Project } from '@/model';

import Applications from './Applications/Applications';
import Grants from './Grants/Grants';
import Projects from './Projects/Projects';

interface ClientViewProps {
  GoBack: () => void;
  briefId: string | string[] | undefined;
  briefs: any;
  handleMessageBoxClick: (_userId: number, _freelander: Freelancer) => void;
  redirectToBriefApplications: (_applicationId: string) => void;
  briefApplications: Project[];
  ongoingGrants: Project[];
  loadingApplications: boolean;
}

export default function ClientView({
  GoBack,
  briefId,
  briefs,
  handleMessageBoxClick,
  redirectToBriefApplications,
  briefApplications,
  ongoingGrants,
  loadingApplications,
}: ClientViewProps) {
  return (
    <div>
      <p>briefs</p>
      <Applications
        briefId={briefId}
        goBack={GoBack}
        briefs={briefs}
        briefApplications={briefApplications}
        loadingApplications={loadingApplications}
        handleMessageBoxClick={handleMessageBoxClick}
        redirectToBriefApplications={redirectToBriefApplications}
      />
      <p>projects</p>
      <Projects briefs={briefs} />
      <Grants ongoingGrants={ongoingGrants} />
    </div>
  );
}
