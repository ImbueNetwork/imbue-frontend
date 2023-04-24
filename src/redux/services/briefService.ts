import * as config from "@/config";
import {
  dummyDashboardBriefApplications,
  dumyBriefs,
} from "@/config/briefs-data";
import { Brief, BriefSqlFilter, OffchainProjectState } from "@/model";
import { checkEnvironment } from "@/utils";

const getAPIHeaders = {
  accept: "application/json",
};

const postAPIHeaders = {
  ...getAPIHeaders,
  "content-type": "application/json",
};

export const callSearchBriefs = async (filter: BriefSqlFilter) => {
  // return [] as Array<Brief>;
  //:TODO implement api for callSearchBriefs
  const resp = await fetch(`${config.apiBase}/briefs/search`, {
    headers: postAPIHeaders,
    method: "post",
    body: JSON.stringify(filter),
  });
  if (resp.ok) {
    return (await resp.json()) as Array<Brief>;
  } else {
    throw new Error("Failed to search briefs. status:" + resp.status);
  }
};

export const getAllBriefs = async () => {
  // return dumyBriefs as Array<Brief>;
  //:TODO implement api for getting briefs
  const resp = await fetch(
    checkEnvironment().concat(`${config.apiBase}/briefs/`),
    {
      headers: postAPIHeaders,
      method: "get",
    }
  );

  if (resp.ok) {
    return (await resp.json()) as Array<Brief>;
  } else {
    throw new Error("Failed to get all briefs. status:" + resp.status);
  }
};

export const getBrief = async (briefId: number | string | string[]) => {
  try {
    const resp = await fetch(`${config.apiBase}/briefs/${briefId}`, {
      headers: postAPIHeaders,
      method: "get",
    });

    if (resp.ok) {
      return (await resp.json()) as Brief;
    } else {
      throw new Error("Failed to get all briefs. status:" + resp.status);
    }
  } catch (error) {
    console.log(error);
  }
};

export const getUserBriefs = async (user_id: string | number) => {
  const resp = await fetch(`${config.apiBase}/users/${user_id}/briefs/`, {
    headers: postAPIHeaders,
    method: "get",
  });
  if (resp.ok) {
    return await resp.json();
  } else {
    const error = new Error(
      `Failed to get all briefs for user ${user_id}. status: ${resp.status}`
    );
    console.log(error);
    return [];
  }
};

export const getBriefApplications = async (brifId: string | number) => {
  const resp = await fetch(
    checkEnvironment().concat(`${config.apiBase}briefs/${brifId}/applications`),
    {
      headers: postAPIHeaders,
      method: "get",
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    throw new Error(
      "Failed to get all brief applications. status:" + resp.status
    );
  }
};

export const changeBriefApplicationStatus = async (
  briefId: string | number,
  projectId: number,
  status_id: OffchainProjectState
) => {
  const resp = await fetch(`${config.apiBase}/briefs/${briefId}/status`, {
    headers: postAPIHeaders,
    method: "put",
    body: JSON.stringify({
      project_id: projectId,
      status_id,
    }),
  });

  if (resp.ok) {
    return await resp.json();
  } else {
    throw new Error(
      `Failed to hire for briefId ${briefId} . status: ${resp.status}`
    );
  }
};

export const getUserBrief = async (userId: number, briefId: number) => {
  return null;
  // const resp = await fetch(
  //   `${config.apiBase}/users/${userId}/briefs/${briefId}`
  // );
  // if (resp.ok) {
  //   return resp.json();
  // }
  // return null;
};

export const getProjectById = async (projectId: string | number) => {
  const resp = await fetch(
    checkEnvironment().concat(`${config.apiBase}project/${projectId}`),
    {
      headers: postAPIHeaders,
      method: "get",
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    throw new Error("Failed to get project. status:" + resp.status);
  }
};
