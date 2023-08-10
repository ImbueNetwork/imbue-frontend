import { BriefLists } from '@/components/Briefs/BriefsList';

export default function Projects({ briefs }: { briefs: any }) {
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
