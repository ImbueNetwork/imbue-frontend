import * as config from "@/config";
import { dumyBriefs } from "@/config/briefs-data";
import { Brief, BriefSqlFilter } from "@/model";

const getAPIHeaders = {
  accept: "application/json",
};

const postAPIHeaders = {
  ...getAPIHeaders,
  "content-type": "application/json",
};

export const callSearchBriefs = async (filter: BriefSqlFilter) => {
  return [] as Array<Brief>;
  //:TODO implement api for callSearchBriefs
  // const resp = await fetch(`${config.apiBase}/briefs/search`, {
  //     headers: postAPIHeaders,
  //     method: "post",
  //     body: JSON.stringify(filter),
  // });
  // if (resp.ok) {
  //     return await resp.json() as Array<Brief>
  // } else {
  //     throw new Error('Failed to search briefs. status:' + resp.status);
  // }
};

export const getAllBriefs = async () => {
  return dumyBriefs as Array<Brief>;
  //:TODO implement api for getting briefs
  //   const resp = await fetch(`${config.apiBase}/briefs/`, {
  //     headers: postAPIHeaders,
  //     method: "get",
  //   });

  //   if (resp.ok) {
  //     return (await resp.json()) as Array<Brief>;
  //   } else {
  //     throw new Error("Failed to get all briefs. status:" + resp.status);
  //   }
};

export const getBrief = async (briefId: number | string) => {
  return dumyBriefs[0] as Brief;
  // const resp = await fetch(`${config.apiBase}/briefs/${briefId}`, {
  //   headers: postAPIHeaders,
  //   method: "get",
  // });

  // if (resp.ok) {
  //   return (await resp.json()) as Brief;
  // } else {
  //   throw new Error("Failed to get all briefs. status:" + resp.status);
  // }
};
