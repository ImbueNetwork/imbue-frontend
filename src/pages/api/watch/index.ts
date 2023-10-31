// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import config from '@/lib/config';
import { initChainApis, initPolkadotJSAPI } from '@/utils/polkadot';
import ChainService, { ImbueChainEvent } from '@/redux/services/chainService';
import { ImbueChainPollResult } from '@/model';
import { deleteMilestones, fetchProjectMilestones, insertMilestones, updateMilestoneWithdrawStatus } from '@/lib/models';
import db from '@/db';

export default nextConnect()
    .post(async (req: NextApiRequest, res: NextApiResponse) => {
        const { address, imbueChainEvent, projectId, milestoneId } = req.body;
        const imbueApi = await initPolkadotJSAPI(process.env.IMBUE_NETWORK_WEBSOCK_ADDR!);
        const relayChainApi = await initPolkadotJSAPI(process.env.RELAY_CHAIN_WEBSOCK_ADDR!);
        const allApis = {
            imbue: imbueApi,
            relayChain: relayChainApi,
        };

        console.log("**** posting");
        console.log(address);
        console.log(imbueChainEvent);
        console.log(projectId);
        console.log(milestoneId);

        const chainService = new ChainService(allApis);
        const pollResult: ImbueChainPollResult = await chainService.pollChainMessage(
            imbueChainEvent,
            address
        ) as ImbueChainPollResult;

        while (pollResult == ImbueChainPollResult.Pending) {
            console.log("***** poll result is ");
            console.log(pollResult);
            await new Promise((f) => setTimeout(f, 1000));
        }

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
                        console.log("***** updating approve milestone");
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
                            console.log("***** updatedMilestones is");
                            console.log(updatedMilestones);
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
                        console.log("***** updating withdraw milestone");
                        const milestones = await fetchProjectMilestones(projectId)(tx);
                        const allApprovedMilestoneIds: number[] = milestones.filter((milestone) => milestone.is_approved).map(milestone => milestone.milestone_index);
                        console.log("***** allApprovedMilestoneIds is");
                        console.log(allApprovedMilestoneIds);
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


                        console.log("***** updatedMilestones is");
                        console.log(updatedMilestones);
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
