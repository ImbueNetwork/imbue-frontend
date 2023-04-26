import { NextApiRequest, NextApiResponse } from "next";
import db from "../../db";
import {
  Brief,
  fetchBrief,
  fetchUser,
  User,
  fetchProject,
  updateProject,
  acceptBriefApplication,
} from "../../models";
import { verifyUserIdFromJwt } from "../../auth/common";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, method } = req;
  const { id }: any = req.query;

  const projectId = body?.project_id;
  const status_id = body?.status_id;

  if (method === "PUT") {
    db.transaction(async (tx) => {
      try {
        let brief: Brief = await fetchBrief(id)(tx);
        if (!brief) {
          return new Error("Brief does not exist.");
        }
        let briefOwner = (await fetchUser(brief.user_id)(tx)) as User;
        verifyUserIdFromJwt(req, res, briefOwner?.id);
        let project = await fetchProject(projectId)(tx);
        if (!project) {
          return new Error("Project does not exist.");
        }
        project.status_id = status_id;
        await updateProject(project.id!, project)(tx);

        let updatedBrief = await acceptBriefApplication(id, projectId)(tx);
        return res.send(updatedBrief);
      } catch (e: any) {
        return new Error(`Failed to accept brief application: ${e.message}`);
      }
    });
  }
}
