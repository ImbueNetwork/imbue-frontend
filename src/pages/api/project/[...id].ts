import Filter from 'bad-words';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import passport from 'passport';

import * as models from '@/lib/models';
import { initPolkadotJSAPI } from '@/utils/polkadot';

import db from '@/db';
import { OffchainProjectState } from '@/model';
import ChainService from '@/redux/services/chainService';

import { authenticate, verifyUserIdFromJwt } from '../auth/common';

type ProjectPkg = models.Project & {
  milestones: models.Milestone[];
  approvers?: string[];
};

export default nextConnect()
  .use(passport.initialize())
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const projectId = id ? id[0] : '';
    const briefId = id ? id[1] : '';
    if (!projectId) return res.status(404).end();
    db.transaction(async (tx) => {
      try {
        let project;

        if (briefId)
          project = await models.fetchBriefProject(projectId, briefId)(tx);
        else project = await models.fetchProjectById(projectId)(tx);

        if (!project) {
          return res.status(404).end();
        }

        const milestones = await models.fetchProjectMilestones(projectId)(tx);
        const approvers = await models.fetchProjectApprovers(projectId)(tx);

        const attachmentPromises: Promise<any>[] = [];

        milestones.forEach((milestone) => {
          attachmentPromises.push(
            tx('milestone_attachments').select('*').where({
              project_id: projectId,
              milestone_index: milestone.milestone_index,
            })
          );
        });

        const attachments = await Promise.all(attachmentPromises);

        const pkg: ProjectPkg = {
          ...project,
          milestones: milestones.map((milestone, index) => ({
            ...milestone,
            attachments: attachments[index],
          })),
          approvers: approvers.map(({ approver }: any) => approver),
        };

        const updatedProject = await syncProject(pkg, tx);
        return res.status(200).send(updatedProject);
        // return res.status(200).send(pkg);
      } catch (e) {
        return res.status(404).end();
        new Error(`Failed to fetch project by id: ${id}`, {
          cause: e as Error,
        });
      }
    });
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { query, body } = req;
    const projectId = query?.id ? query.id[0] : null;
    // const brief_id: any = query.brief_id as string[];

    if (projectId === null) return res.status(404).end();
    const userAuth: Partial<models.User> | any = await authenticate(
      'jwt',
      req,
      res
    );

    db.transaction(async (tx) => {
      try {
        const projectApproverIds = await models.fetchProjectApproverUserIds(
          projectId
        )(tx);
        verifyUserIdFromJwt(req, res, [userAuth.id, ...projectApproverIds]);

        const {
          name,
          logo,
          description,
          website,
          category,
          required_funds,
          currency_id,
          chain_project_id,
          owner,
          milestones,
          total_cost_without_fee,
          imbue_fee,
          user_id,
          escrow_address,
          duration_id,
          status_id,
          project_in_voting_of_no_confidence,
          first_pending_milestone,
          project_in_milestone_voting,
          payment_address,
        } = body;

        // ensure the project exists first
        const exists = await models.fetchProjectById(projectId)(tx);

        if (!exists) {
          return res.status(404).end();
        }

        if (exists.user_id !== user_id) {
          return res.status(403).end();
        }

        const newProject: any = {
          name,
          logo,
          description,
          website,
          category,
          chain_project_id,
          required_funds,
          currency_id,
          owner,
          total_cost_without_fee,
          imbue_fee,
          escrow_address,
          // project_type: exists.project_type,
          duration_id,
          status_id,
          completed: status_id === OffchainProjectState.Completed,
          project_in_voting_of_no_confidence,
          first_pending_milestone,
          project_in_milestone_voting,
          payment_address,
        };

        // if (first_pending_milestone)
        //   newProject.first_pending_milestone = first_pending_milestone;

        // if (project_in_milestone_voting)
        //   newProject.project_in_milestone_voting = project_in_milestone_voting;

        const project = await models.updateProject(projectId, newProject)(tx);
        const filter = new Filter();

        if (!project.id) {
          return new Error('Cannot update milestones: `project_id` missing.');
        }

        // drop then recreate
        await models.deleteMilestones(projectId)(tx);

        //filtering milestones in back-end

        const filterdMileStone = milestones.map((item: any) => {
          return {
            ...item,
            name: filter.clean(item.name),
            description: filter.clean(item.description),
          };
        });

        const pkg: ProjectPkg = {
          ...project,
          milestones: await models.insertMilestones(
            filterdMileStone,
            project.id
          )(tx),
        };

        return res.status(200).send(pkg);
      } catch (cause) {
        return res.status(500).json({ error: cause });
      }
    });
  });

const syncProject = async (project: any, tx: any) => {
  if (!project.chain_project_id) return project;
  let milestonesRequiresSync = false;

  try {
    // const filter = new Filter();
    const projectId = project.id;
    const imbueApi = await initPolkadotJSAPI(
      process.env.IMBUE_NETWORK_WEBSOCK_ADDR!
    );
    const relayChainApi = await initPolkadotJSAPI(
      process.env.RELAY_CHAIN_WEBSOCK_ADDR!
    );
    const allApis = {
      imbue: imbueApi,
      relayChain: relayChainApi,
    };

    const chainService = new ChainService(allApis);
    const onChainProjectRes = await chainService.convertToOnChainProject(
      project
    );
    if (onChainProjectRes) {
      onChainProjectRes.milestones.map((milestone, index) => {
        project.milestones[index].is_approved = milestone.is_approved;
      });
      milestonesRequiresSync = true;
    }

    if (onChainProjectRes?.id && project?.id) {
      const firstPendingMilestoneChain =
        await chainService.findFirstPendingMilestone(
          onChainProjectRes.milestones
        );

      if (
        firstPendingMilestoneChain === project.first_pending_milestone &&
        project.project_in_milestone_voting ===
        onChainProjectRes.projectInMilestoneVoting &&
        project.project_in_voting_of_no_confidence ===
        onChainProjectRes.projectInVotingOfNoConfidence &&
        !milestonesRequiresSync
      )
        return project;

      const newProject = {
        ...project,
        project_in_milestone_voting: onChainProjectRes.projectInMilestoneVoting,
        first_pending_milestone: firstPendingMilestoneChain,
        project_in_voting_of_no_confidence:
          onChainProjectRes.projectInVotingOfNoConfidence,
      };

      project.project_in_milestone_voting =
        onChainProjectRes.projectInMilestoneVoting;
      project.first_pending_milestone = firstPendingMilestoneChain;
      project.project_in_voting_of_no_confidence =
        onChainProjectRes.projectInVotingOfNoConfidence;

      delete newProject.milestones;
      delete newProject.approvers;
      const updatedProject = await models.updateProject(
        projectId,
        newProject
      )(tx);
      if (!updatedProject.id) {
        return new Error('Cannot update milestones: `project_id` missing.');
      }

      // // drop then recreate
      // await models.deleteMilestones(projectId)(tx);

      // //filtering milestones in back-end
      // const filterdMileStone = project.milestones.map((item: any) => {
      //   return {
      //     ...item,
      //     name: filter.clean(item.name),
      //     description: filter.clean(item.description),
      //   };
      // });

      // await models.insertMilestones(filterdMileStone, project.id)(tx);

      const pkg: ProjectPkg = {
        ...updatedProject,
        approvers: project.approvers,
        milestones: project.milestones,
      };

      return pkg;
    } else {
      const userCompletedProjects: number[] = (await imbueApi.api.query.imbueProposals.completedProjects(
        project.owner
      )).toJSON() as number[];
      const projectCompleted = userCompletedProjects.includes(project.chain_project_id);

      if (projectCompleted) {
        project.milestones.map(async (item: any) => {
          await models.updateMilestone(
            Number(projectId),
            Number(item.milestone_index),
            { withdrawn_onchain: true }
          )(tx);
        });

      }
      return project;
    }
  } catch (error) {
    console.log('**** error is ');
    console.log(error);
    return project;
  }
};
