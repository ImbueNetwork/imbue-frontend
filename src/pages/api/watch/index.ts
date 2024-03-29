// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import { deleteMilestones, fetchProjectMilestones, insertMilestones } from '@/lib/models';
import { initPolkadotJSAPI } from '@/utils/polkadot';

import db from '@/db';
import { ImbueChainPollResult } from '@/model';
import ChainService, { ImbueChainEvent } from '@/redux/services/chainService';

export default nextConnect()
    .post(async (req: NextApiRequest, res: NextApiResponse) => {
        const { address, imbueChainEvent, projectId, milestoneId } = req.body;
        const imbueApi = await initPolkadotJSAPI(process.env.IMBUE_NETWORK_WEBSOCK_ADDR!);
        const relayChainApi = await initPolkadotJSAPI(process.env.RELAY_CHAIN_WEBSOCK_ADDR!);
        const allApis = {
            imbue: imbueApi,
            relayChain: relayChainApi,
        };
        const chainService = new ChainService(allApis);
        const pollResult: any = await chainService.pollChainMessage(
            imbueChainEvent as ImbueChainEvent,
            address
        );

        if (pollResult == ImbueChainPollResult.EventFound) {
            switch (imbueChainEvent) {
                case ImbueChainEvent.SubmitMilestone: {
                    console.log("******** submit milestone");
                    break;
                }

                case ImbueChainEvent.VoteOnMilestone: {
                    console.log("******** vote on milestone");
                    break;
                }

                case ImbueChainEvent.ApproveMilestone: {
                    if (milestoneId) {
                        db.transaction(async (tx) => {
                            const milestones = await fetchProjectMilestones(projectId)(tx);
                            const updatedMilestones = milestones.map((item) => {
                                if(item.milestone_index == milestoneId) {
                                    return {
                                        ...item,
                                        is_approved: true,
                                    };
                                } else {
                                    return item
                                }
                            });
                            await deleteMilestones(projectId)(tx);
                            await insertMilestones(
                                updatedMilestones,
                                projectId
                            )(tx)
                        });
                    }
                    break;
                }
                case ImbueChainEvent.Withraw: {
                    db.transaction(async (tx) => {
                        const milestones = await fetchProjectMilestones(projectId)(tx);
                        const allApprovedMilestoneIds: number[] = milestones.filter((milestone) => milestone.is_approved).map(milestone => milestone.milestone_index);
                        const updatedMilestones = milestones.map((item) => {
                            if (allApprovedMilestoneIds.includes(item.milestone_index)) {
                                return {
                                    ...item,
                                    withdrawn_onchain: true,
                                };
                            } else {
                                return item
                            }

                        });
                        await deleteMilestones(projectId)(tx);
                        await insertMilestones(
                            updatedMilestones,
                            projectId
                        )(tx)

                    });
                    break;
                }
            }
        }
        return res.status(200);
    });
