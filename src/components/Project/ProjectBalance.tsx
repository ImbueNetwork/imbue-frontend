import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';

import { getBalance } from '@/utils/helper';

import { Currency, Project, User } from '@/model';

type ProjectBalanceType = {
    balance: number | undefined;
    project: Project;
    user: User;
    handlePopUpForUser: () => void;
    setBalanceLoading: (_loading: boolean) => void;
    balanceLoading: boolean;
    setBalance: (_balance: number) => void;
}

const Currencies = [
    {
        name: "IMBU",
        currencyId: 0
    },
    {
        name: "KSM",
        currencyId: 1
    },
    {
        name: "MGX",
        currencyId: 4
    },

    // Anything over 100 should be multichain 
    {
        name: "ETH",
        currencyId: 100
    },
    {
        name: "USDT",
        currencyId: 101
    },
]

const ProjectBalance = (props: ProjectBalanceType) => {
    const { balance, project, user, balanceLoading, setBalanceLoading, setBalance } = props;
    const [currency_id, setCurrency_id] = useState<number>(project.currency_id || 0);
    // const [firstLoad, setFirstLoad] = useState<boolean>(true);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const showOptions = Boolean(anchorEl);

    const getAndSetBalace = async (currencyID: number) => {
        if (!project?.escrow_address) return;

        setBalanceLoading(true)

        try {

            // if (!balance && project.status_id !== OffchainProjectState.Completed) {
            //     handlePopUpForUser();
            // }

            const newBalance = await getBalance(
                currencyID,
                user,
                currencyID < 100 ? project?.escrow_address : undefined,
                Number(project.id)
            );

            setBalance(newBalance || 0)

            // if (firstLoad)
            //     setFirstLoad(false)

        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        } finally {
            setBalanceLoading(false)
        }
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const selectCurrency = async (currencyID: number) => {
        setCurrency_id(currencyID)
        setAnchorEl(null);
        await getAndSetBalace(currencyID);
    };

    return (
        <div className='text-sm text-[#868686] mt-2'>
            {balanceLoading
                ? (
                    <p className='text-xs font-semibold'> Loading Balance...</p>)
                : (
                    <div className='flex justify-between items-center w-full'>
                        <div>
                            <button
                                className='border rounded-xl px-[10px] py-1 text-xs flex items-start gap-1'
                                onClick={(e) => handleClick(e)}
                            >
                                {Currency[currency_id || 0]}
                                <KeyboardArrowDownIcon className='text-sm' />
                            </button>
                            <Menu
                                id="basic-menu"
                                anchorEl={anchorEl}
                                open={showOptions}
                                onClose={handleClose}
                                MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                }}
                            >
                                {
                                    Currencies.map((currency) => (
                                        <MenuItem
                                            key={currency.currencyId}
                                            onClick={() => selectCurrency(currency.currencyId)}
                                        >
                                            {currency.name}
                                        </MenuItem>
                                    ))
                                }
                            </Menu>
                        </div>
                        <p>
                            Balance: {balance} ${Currency[currency_id || 0]}
                        </p>
                    </div>
                )
            }
        </div>
    );
};

export default ProjectBalance;