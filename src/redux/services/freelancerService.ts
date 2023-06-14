import {
  Freelancer,
  FreelancerResponse,
  FreelancerSqlFilter,
  Project,
} from "@/model";
import * as config from "@/config";
import { checkEnvironment } from "@/utils";

export async function createFreelancingProfile(freelancer: any) {
  // Check that this user doesnt already have a freelancer profile.
  try {
    const resp = await fetch(
      `${config.apiBase}freelancers/`,
      {
        headers: config.postAPIHeaders,
        method: "put",
        body: JSON.stringify({ freelancer }),
      }
    );

    return resp;
  } catch (error) {
    console.log(error);
  }
}

export const getAllFreelancers = async (
  itemsPerPage: number,
  currentPage: number
): Promise<FreelancerResponse> => {
  const resp = await fetch(`${config.apiBase}freelancers?items_per_page=${itemsPerPage}&page=${currentPage}`,
    {
      headers: config.postAPIHeaders,
      method: "get",
    }
  );
  if (resp.ok) {
    return (await resp.json()) as FreelancerResponse;
  } else {
    // TODO:
    // console.log(new Error("Failed to get all briefs. status:" + resp.status));
    return { currentData: [], totalFreelancers: 0 };
  }
};

export async function getFreelancerProfile(
  username: string
): Promise<Freelancer | undefined> {
  const resp = await fetch(
    checkEnvironment().concat(`${config.apiBase}freelancers/${username}`),
    {
      headers: config.getAPIHeaders,
      method: "get",
    }
  );

  if (resp.status === 200) {
    const res = await resp.json();
    return res as Freelancer;
  } else {
    return undefined;
  }
}

export async function freelancerExists(username: string): Promise<boolean> {
  const resp = await fetch(
    `${config.apiBase}freelancers/${username}`,
    {
      headers: config.getAPIHeaders,
      method: "get",
    }
  );

  if (resp.ok) {
    return true;
  } else {
    return false;
  }
}

export async function updateFreelancer(freelancer: Freelancer) {
  const resp = await fetch(
    `${config.apiBase}freelancers/${freelancer.username}`,
    {
      headers: config.postAPIHeaders,
      method: "put",
      body: JSON.stringify({ freelancer }),
    }
  );

  if (resp.ok) {
    return (await resp.json()) as Freelancer;
  } else {
    // TODO: 
    // console.log("Failed to update freelancer profile. status:" + resp.status);
  }
}

export const callSearchFreelancers = async (
  filter: FreelancerSqlFilter
): Promise<FreelancerResponse> => {
  const resp = await fetch(
    `${config.apiBase}freelancers/search`,
    {
      headers: config.postAPIHeaders,
      method: "post",
      body: JSON.stringify(filter),
    }
  );
  if (resp.ok) {
    const data: FreelancerResponse = await resp.json();
    return data;
  } else {
    throw new Error("Failed to search freelancers. status:" + resp.status);
  }
};

export const getFreelancerApplications = async (userId: number) => {
  const resp = await fetch(
    checkEnvironment().concat(`${config.apiBase}freelancers/${userId}/applications`),
    {
      headers: config.postAPIHeaders,
      method: "get",
    }
  );

  if (resp.ok) {
    return (await resp.json()) as Array<Project>;
  } else {
    throw new Error(
      "Failed to get all freelancer applications. status:" + resp.status
    );
  }
};
