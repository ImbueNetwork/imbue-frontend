import { Freelancer, FreelancerSqlFilter, Project } from "@/model";
import { dummyDashboardApplications } from "@/config/briefs-data";
import { freelancerData } from "@/config/freelancer-data";

export async function createFreelancingProfile(freelancer: any) {
  //TODO: make api call here
  // Check that this user doesnt already have a freelancer profile.
  //   const resp = await fetch(`${config.apiBase}/freelancers/`, {
  //     headers: postAPIHeaders,
  //     method: "post",
  //     body: JSON.stringify({ freelancer }),
  //   });
  //   if (resp.ok) {
  //     // could be 200 or 201
  //     // Freelancer API successfully invoked
  //     console.log("Freelancer created successfully via Freelancer REST API");
  //   } else {
  //     throw new Error(
  //       "Failed to create freelancer profile. status:" + resp.status
  //     );
  //   }
}

export const getAllFreelancers = async () => {
  // TODO: make api call here
  //   const resp = await fetch(`${config.apiBase}/freelancers/`, {
  //     headers: postAPIHeaders,
  //     method: "get",
  //   });
  //   if (resp.ok) {
  //     return (await resp.json()) as Array<Freelancer>;
  //   } else {
  //     throw new Error("Failed to get all briefs. status:" + resp.status);
  //   }
};

export async function getFreelancerProfile(username: string) {
  return freelancerData;
  //TODO: implement api call
  // return {} as Freelancer;
  //   const resp = await fetch(`${config.apiBase}/freelancers/${username}`, {
  //     headers: getAPIHeaders,
  //     method: "get",
  //   });
  //   if (resp.ok) {
  //     return (await resp.json()) as Freelancer;
  //   }
}

export async function freelancerExists(username: string): Promise<boolean> {
  return false;
  //TODO: implement api call
  //   const resp = await fetch(`${config.apiBase}/freelancers/${username}`, {
  //     headers: getAPIHeaders,
  //     method: "get",
  //   });

  //   if (resp.ok) {
  //     return true;
  //   } else {
  //     return false;
  //   }
}

export async function updateFreelancer(freelancer: Freelancer) {
  return {} as Freelancer;
  // TODO: implement api call
  //   const resp = await fetch(
  //     `${config.apiBase}/freelancers/${freelancer.username}`,
  //     {
  //       headers: postAPIHeaders,
  //       method: "put",
  //       body: JSON.stringify({ freelancer }),
  //     }
  //   );

  //   if (resp.ok) {
  //     console.log("Freelancer updated successfully.");
  //     return (await resp.json()) as Freelancer;
  //   } else {
  //     throw new Error(
  //       "Failed to update freelancer profile. status:" + resp.status
  //     );
  //   }
}

export const callSearchFreelancers = async (filter: FreelancerSqlFilter) => {
  return [] as Array<Freelancer>;
  //TODO: implement api call
  //   const resp = await fetch(`${config.apiBase}/freelancers/search`, {
  //     headers: postAPIHeaders,
  //     method: "post",
  //     body: JSON.stringify(filter),
  //   });
  //   if (resp.ok) {
  //     return (await resp.json()) as Array<Freelancer>;
  //   } else {
  //     throw new Error("Failed to search freelancers. status:" + resp.status);
  //   }
};

export const getFreelancerApplications = async (userId: number) => {
  // return dummyDashboardApplications;
  return [] as Array<Project>;
  // const resp = await fetch(
  //   `${config.apiBase}/freelancers/${userId}/applications`,
  //   {
  //     headers: postAPIHeaders,
  //     method: "get",
  //   }
  // );

  // if (resp.ok) {
  //   return (await resp.json()) as Array<Project>;
  // } else {
  //   throw new Error(
  //     "Failed to get all freelancer applications. status:" + resp.status
  //   );
  // }
};
