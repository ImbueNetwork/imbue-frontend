import React, { useEffect, useState } from 'react';

import { getBalance } from '@/utils/helper';

import { Currency, OffchainProjectState, Project, User } from '@/model';

type ProjectBalanceType = {
    balance: number;
    project: Project;
    user: User;
    handlePopUpForUser: () => void;
    setBalance: (_balance: number) => void;
}

const ProjectBalance = (props: ProjectBalanceType) => {
    const { balance, project, user, handlePopUpForUser, setBalance } = props;
    const [chainLoading, setChainLoading] = useState(true)

    useEffect(() => {
        const getAndSetBalace = async () => {
            try {
                const balance = await getBalance(
                    project?.escrow_address,
                    project?.currency_id || 0,
                    user
                );

                if (!balance && project.status_id !== OffchainProjectState.Completed) {
                    handlePopUpForUser();
                }
                setBalance(balance || 0);
            } catch (error) {
                console.error(error);
            } finally {
                setChainLoading(false)
            }
        }

        getAndSetBalace()

    }, [handlePopUpForUser, project?.currency_id, project?.escrow_address, project.status_id, setBalance, user])

    return (
        <div className='text-[1rem] text-imbue-light-purple-two mt-2'>
            {chainLoading && (
                <p className='text-xs font-semibold'> Loading Balance...</p>
            )}
            {!chainLoading && (
                <p>
                    Balance : {balance} ${Currency[project?.currency_id || 0]}
                </p>
            )}
        </div>
    );
};

export default ProjectBalance;