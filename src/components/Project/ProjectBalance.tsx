import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Menu, MenuItem } from '@mui/material';
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
    const { balance, project, user, handlePopUpForUser, setBalance } = props;
    const [balanceLoading, setBalanceLoading] = useState(true)
    const [currency_id, setCurrency_id] = useState<number>(project?.currency_id || 0)

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const showOptions = Boolean(anchorEl);

    useEffect(() => {
        const getAndSetBalace = async () => {
            if (
                !project?.escrow_address ||
                currency_id === undefined ||
                !user.id
            ) return
            setBalanceLoading(true)
            try {
                const balance = await getBalance(
                    project?.escrow_address,
                    currency_id,
                    user,
                    Number(project.id)
                );

                if (!balance && project.status_id !== OffchainProjectState.Completed) {
                    handlePopUpForUser();
                }
                setBalance(balance || 0);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            } finally {
                setBalanceLoading(false)
            }
        }

        getAndSetBalace()
        setCurrency_id(project.currency_id);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency_id, project?.escrow_address, project.status_id, user.id])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const selectCurrency = (currencyID: number) => {
        setCurrency_id(currencyID)
        setAnchorEl(null);
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