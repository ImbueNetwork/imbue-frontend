import * as config from "@/config";
import {
  dummyDashboardBriefApplications,
  dumyBriefs,
} from "@/config/briefs-data";
import { Brief, BriefSqlFilter, OffchainProjectState } from "@/model";
import { BriefInfo, PaginatedResponse } from "@/types/briefTypes";
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
  const resp = await fetch(
    checkEnvironment().concat(`${config.apiBase}briefs/search`),
    {
      headers: postAPIHeaders,
      method: "post",
      body: JSON.stringify(filter),
    }
  );
  if (resp.ok) {
    return (await resp.json()) as PaginatedResponse;
  } else {
    throw new Error("Failed to search briefs. status:" + resp.status);
  }
};

export const getAllBriefs = async (
  itemsPerPage: number,
  currentPage: number
) => {
  // return dumyBriefs as Array<Brief>;
  //:TODO implement api for getting briefs
  const resp = await fetch(
    checkEnvironment().concat(
      `${config.apiBase}briefs?items_per_page=${itemsPerPage}&page=${currentPage}`
    ),
    {
      headers: postAPIHeaders,
      method: "get",
    }
  );

  if (resp.ok) {
    return (await resp.json()) as PaginatedResponse;
  } else {
    throw new Error("Failed to get all briefs. status:" + resp.status);
  }
};

export const getAllSavedBriefs = async (
  itemsPerPage: number,
  currentPage: number,
  user_id: string | number
) => {
  // return dumyBriefs as Array<Brief>;
  //:TODO implement api for getting briefs
  const resp = await fetch(
    checkEnvironment().concat(
      `${config.apiBase}briefs/save?items_per_page=${itemsPerPage}&page=${currentPage}&user_id=${user_id}`
    ),
    {
      headers: postAPIHeaders,
      method: "get",
    }
  );

  if (resp.ok) {
    return (await resp.json()) as PaginatedResponse;
  } else {
    throw new Error("Failed to get all briefs. status:" + resp.status);
  }
};

export const checkIfBriefSaved = async (
  briefId: string | number,
  userId: string
) => {
  const resp = await fetch(
    checkEnvironment().concat(
      `${config.apiBase}briefs/save/${briefId}?user_id=${userId}`
    ),
    {
      headers: postAPIHeaders,
      method: "get",
    }
  );
  if (resp.ok) {
    return (await resp.json()) as { isSaved: boolean };
  } else {
    throw new Error("Failed to get saved brief status:" + resp.status);
  }
};

export const getBrief = async (briefId: number | string | string[]) => {
  try {
    const resp = await fetch(
      checkEnvironment().concat(`${config.apiBase}briefs/${briefId}`),
      {
        headers: postAPIHeaders,
        method: "get",
      }
    );

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
  const resp = await fetch(
    checkEnvironment().concat(`${config.apiBase}users/${user_id}/briefs/`),
    {
      headers: postAPIHeaders,
      method: "get",
    }
  );
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
  const resp = await fetch(
    checkEnvironment().concat(`${config.apiBase}briefs/${briefId}/status`),
    {
      headers: postAPIHeaders,
      method: "put",
      body: JSON.stringify({
        project_id: projectId,
        status_id,
      }),
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    throw new Error(
      `Failed to hire for briefId ${briefId} . status: ${resp.status}`
    );
  }
};

export const getFreelancerBrief = async (userId: number, briefId: number) => {
  const resp = await fetch(
    checkEnvironment().concat(
      `${config.apiBase}users/${userId}/briefs/${briefId}`
    ),
    {
      headers: postAPIHeaders,
      method: "get",
    }
  );
  if (resp.ok) {
    return resp.json();
  }
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
    new Error("Failed to get project. status:" + resp.status);
  }
};

export const updateBriefById = async (params: BriefInfo) => {
  try {
    const resp = await fetch(`${config.apiBase}/briefs/`, {
      headers: postAPIHeaders,
      method: "put",
      body: JSON.stringify({
        headline: params.headline,
        industries: params.industries,
        description: params.description,
        scope_id: params.scope_id,
        experience_id: params.experience_id,
        duration_id: params.duration_id,
        skills: params.skills,
        budget: params.budget,
        id: params.brief_id,
      }),
    });
    if (resp.ok) {
      // could be 200 or 201
      // Brief update API successfully invoked
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const saveBriefData = async (brief: Brief) => {
  const resp = await fetch(
    checkEnvironment().concat(`${config.apiBase}briefs/save`),
    {
      headers: postAPIHeaders,
      method: "post",
      body: JSON.stringify(brief),
    }
  );
  if (resp.ok) {
    return (await resp.json()) as {
      status: string;
      brief_id?: number;
      message?: string;
    };
  } else {
    throw new Error("Failed to save briefs ..... status:" + resp.status);
  }
};
