import * as config from '@/config';
import { User } from '@/model';

import { ImbueChainEvent } from './chainService';

export const createProject = async (project: any) => {
  try {
    const resp = await fetch(`${config.apiBase}/project`, {
      headers: config.postAPIHeaders,
      method: 'post',
      body: JSON.stringify(project),
    });

    if (resp.status === 201 || resp.status === 200) {
      return await resp.json();
    } else {
      return {
        status: resp.status,
        message: 'Could not complete the application. Please try again',
      };
    }
  } catch (error) {
    return { status: 404, error };
  }
};

export const updateProject = async (
  application_id: number | string,
  project: any
) => {
  try {
    const resp = await fetch(`${config.apiBase}/project/${application_id}`, {
      headers: config.postAPIHeaders,
      method: 'put',
      body: JSON.stringify(project),
    });

    if (resp.status === 201 || resp.status === 200) {
      return await resp.json();
    } else {
      const data = await resp.json();
      return { status: resp.status, message: `${data.error.detail}` };
    }
  } catch (error: any) {
    return { message: `${error?.message}` };
  }
};

export const getUsersOngoingGrants = async (walletAddress: string) => {
  const resp = await fetch(
    `${config.apiBase}/project/getApproverProjects/${walletAddress}`,
    {
      headers: config.postAPIHeaders,
      method: 'get',
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to get all brief applications. status:' + resp.status,
    };
  }
};

export const getApproverProfiles = async (walletAddresses: string[]) => {
  const resp = await fetch(`${config.apiBase}/users/byList`, {
    headers: config.postAPIHeaders,
    method: 'post',
    body: JSON.stringify(walletAddresses),
  });

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to get all brief applications. status:' + resp.status,
    };
  }
};

export const getMilestoneAttachments = async (
  projectId: number | string,
  milestoneIndex: number
) => {
  const resp = await fetch(
    `${config.apiBase}project/submitMilestone?projectId=${projectId}&milestoneIndex=${milestoneIndex}`,
    {
      headers: config.postAPIHeaders,
      method: 'get',
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to get milestone attachments. status:' + resp.status,
    };
  }
};

export const completeMilestone = async (
  projectId: number,
  milestoneIndex: number
) => {
  const resp = await fetch(
    `${config.apiBase}/project/completeMilestone?projectId=${projectId}&milestoneIndex=${milestoneIndex}`,
    {
      headers: config.postAPIHeaders,
      method: 'put',
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to complete milestone. status:' + resp.status,
    };
  }
};

export const updateMilestone = async (
  projectId: number,
  milestoneIndex: number,
  approve: boolean
) => {
  const resp = await fetch(
    `${config.apiBase}/project/updateMilestone?projectId=${projectId}&milestoneIndex=${milestoneIndex}&approve=${approve}`,
    {
      headers: config.postAPIHeaders,
      method: 'put',
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to get all brief applications. status:' + resp.status,
    };
  }
};

export const uploadMilestoneAttachments = async (
  projectId: number | string,
  milestoneIndex: number,
  fileURLs: string[]
) => {
  const resp = await fetch(
    `${config.apiBase}/project/submitMilestone?projectId=${projectId}&milestoneIndex=${milestoneIndex}`,
    {
      headers: config.postAPIHeaders,
      method: 'post',
      body: JSON.stringify(fileURLs),
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to submit milestone attachments. status:' + resp.status,
    };
  }
};

export const submitMilestone = async (projectId: number) => {
  const resp = await fetch(
    `${config.apiBase}/project/submitMilestone?projectId=${projectId}`,
    {
      headers: config.postAPIHeaders,
      method: 'post',
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to update voting state. status:' + resp.status,
    };
  }
};

export const updateProjectVotingState = async (
  projectId: number,
  voting: boolean
) => {
  const resp = await fetch(
    `${config.apiBase}/project/setVoting?projectId=${projectId}&voting=${voting}`,
    {
      headers: config.postAPIHeaders,
      method: 'put',
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to update voting state. status:' + resp.status,
    };
  }
};

export const updateFirstPendingMilestone = async (
  projectId: number,
  milestoneIndex: number
) => {
  const resp = await fetch(
    `${config.apiBase}/project/updateMilestone?projectId=${projectId}&firstPendingMilestone=${milestoneIndex}`,
    {
      headers: config.postAPIHeaders,
      method: 'put',
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to update voting state. status:' + resp.status,
    };
  }
};

// Voting

export const getMilestoneVotes = async (
  projectId: number,
  milestoneIndex: number
) => {
  try {
    const resp = await fetch(
      `${config.apiBase}/project/vote?projectId=${projectId}&milestoneIndex=${milestoneIndex}`,
      {
        headers: config.postAPIHeaders,
        method: 'get',
      }
    );

    return resp.json();
  } catch (error) {
    return {
      message: 'Failed to get voters. status:' + error,
    };
  }
};

export const voteOnMilestone = async (
  userId: number | string | null,
  voterAddress: string,
  milestoneIndex: number,
  vote: boolean,
  projectId: number | string
) => {
  try {
    const resp = await fetch(`${config.apiBase}project/vote`, {
      headers: config.getAPIHeaders,
      method: 'post',
      body: JSON.stringify({
        projectId: projectId,
        milestoneIndex,
        userId,
        voterAddress,
        vote,
      }),
    });

    return await resp.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return { message: 'Something went wrong' + error };
  }
};

export const syncProjectVotes = async (
  projectID: string | number,
  milestoneIndex: string | number,
  chainVotes: any
) => {
  const resp = await fetch(`${config.apiBase}project/vote/sync`, {
    headers: config.getAPIHeaders,
    method: 'post',
    body: JSON.stringify({ projectID, milestoneIndex, chainVotes }),
  });
  console.log(
    '🚀 ~ file: projectServices.ts:197 ~ syncProjectVotes ~ resp:',
    resp
  );
};

// no confidece votes

export const getProjectNoConfidenceVoters = async (
  projectId: number | string
) => {
  const resp = await fetch(
    `${config.apiBase}/project/noConfidenceVote/getVoters?projectId=${projectId}`,
    {
      headers: config.postAPIHeaders,
      method: 'get',
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to get voters. status:' + resp.status,
    };
  }
};

export const insertNoConfidenceVote = async (
  projectId: number | string,
  voteData: { voter: User; vote: boolean }
) => {
  const resp = await fetch(
    `${config.apiBase}/project/noConfidenceVote?projectId=${projectId}`,
    {
      headers: config.postAPIHeaders,
      method: 'post',
      body: JSON.stringify(voteData),
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return {
      message: 'Failed to update voting state. status:' + resp.status,
    };
  }
};

// Multichain
export const getProjectBalance = async (projectId: number) => {
  try {
    const resp = await fetch(
      `${config.apiBase}/payments/${projectId}/balance`,
      {
        headers: config.postAPIHeaders,
        method: 'get',
      }
    );

    return resp.json();
  } catch (error) {
    return {
      message: 'Failed to get voters. status:' + error,
    };
  }
};

export const getProjectEscrowAddress = async (projectId: number) => {
  try {
    const resp = await fetch(
      `${config.apiBase}/payments/${projectId}/address`,
      {
        headers: config.postAPIHeaders,
        method: 'get',
      }
    );

    return resp.json();
  } catch (error) {
    return {
      message: 'Failed to get voters. status:' + error,
    };
  }
};

export const withdrawOffchain = async (projectId: number | string) => {
  try {
    const resp = await fetch(
      `${config.apiBase}/payments/${projectId}/withdraw`,
      {
        headers: config.postAPIHeaders,
        method: 'POST',
      }
    );

    if (resp.ok) {
      return {
        txError: false,
        withdrawn: await resp.json(),
      };
    } else {
      return {
        txError: true,
        errorMessage: await resp.json(),
      };
    }
  } catch (error) {
    return {
      txError: true,
      errorMessage: 'Failed to withdraw chains offchain' + error,
    };
  }
};

export const watchChain = async (
  imbueChainEvent: ImbueChainEvent,
  address: string,
  projectId: number | string,
  milestoneId?: number | string
) => {
  const resp = await fetch(`${config.apiBase}/watch`, {
    headers: config.postAPIHeaders,
    method: 'POST',
    body: JSON.stringify({ imbueChainEvent, address, projectId, milestoneId }),
  });
  return await resp.json();
};

export const getOffchainEscrowAddress = async (projectId: string | number) => {
  const resp = await fetch(`${config.apiBase}/payments/${projectId}/address`, {
    headers: config.postAPIHeaders,
    method: 'GET',
  });
  return await resp.json();
};

export const getOffchainEscrowBalance = async (projectId: string | number) => {
  const resp = await fetch(`${config.apiBase}/payments/${projectId}/balance`, {
    headers: config.postAPIHeaders,
    method: 'GET',
  });
  return await resp.json();
};

export const mintTokens = async (
  projectId: string | number,
  beneficiary: string
) => {
  const resp = await fetch(`${config.apiBase}/payments/${projectId}/mint`, {
    headers: config.postAPIHeaders,
    method: 'POST',
    body: JSON.stringify({ beneficiary }),
  });
  return await resp.json();
};
