import { ProjectOnChain, User } from '@/model';

type Vote = {
  id?: number;
  project_id: number | string;
  milestone_index: number | string;
  user_id?: number | string;
  voter_address: string;
  vote: boolean;
};

export const syncMilestoneVotes = async (
  onChainProjectRes: ProjectOnChain | undefined,
  project: any,
  firstPendingMilestoneChain: number,
  tx: any
) => {
  const milestoneVoteJson =
    onChainProjectRes?.projectVotes?.votes[firstPendingMilestoneChain];

  const milestoneVoteArray = Object.keys(milestoneVoteJson).map((k) => ({
    voter_address: k,
    vote: milestoneVoteJson[k],
  }));

  const votesOffchain: Vote[] = await tx('project_votes').select('*').where({
    project_id: project.id,
    milestone_index: firstPendingMilestoneChain,
  });

  const newVote: Vote[] = [];
  let votesNeedSync = false;

  const approvers: User[] = await tx('users')
    .select('*')
    .whereIn('web3_address', project.approvers);

  milestoneVoteArray.forEach((v) => {
    const match = votesOffchain.find(
      (vote) => vote.voter_address === v.voter_address
    );

    if (!match) {
      votesNeedSync = true;

      const user = approvers.find(
        (approver) => approver.web3_address === v.voter_address
      );

      newVote.push({
        ...v,
        project_id: project.id,
        milestone_index: firstPendingMilestoneChain,
        user_id: user?.id,
      });
    }
  });

  if (votesNeedSync) {
    await tx('project_votes').insert(newVote);
  }
};
