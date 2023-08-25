import * as config from '@/config';

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

export const updateProject = async (application_id: number, project: any) => {
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

export const updateMilestone = async (projectId: number, milestoneIndex:number, approve:boolean) => {
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
}

export const updateProjectVotingState = async (projectId: number, voting:boolean) => {
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
}
