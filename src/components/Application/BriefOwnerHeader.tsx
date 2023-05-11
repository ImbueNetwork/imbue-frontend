import Image from 'next/image';
import React, { useState } from 'react';
import { Brief, Freelancer, Project, OffchainProjectState} from '@/model';
import { Badge, Menu, MenuItem, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/router';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { HirePopup } from '../HirePopup';

interface MilestoneItem {
    name: string;
    amount: number | undefined;
}

type BriefOwnerHeaderProps = {
    brief: Brief;
    freelancer: Freelancer;
    application: Project | any;
    handleMessageBoxClick: (user_id: number, freelancer: any) => void;
    updateApplicationState: (application: any, projectStatus: OffchainProjectState) => void;
    milestones: MilestoneItem[];
    totalCostWithoutFee: number;
    imbueFee: number;
    totalCost: number;
    setLoading: Function;
}

const BriefOwnerHeader = (props: BriefOwnerHeaderProps) => {
    const {
        brief,
        freelancer,
        application,
        handleMessageBoxClick,
        updateApplicationState,
        milestones,
        totalCostWithoutFee,
        imbueFee,
        totalCost,
        setLoading,
    } = props

    const [openPopup, setOpenPopup] = useState<boolean>(false);
    const router = useRouter();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleOptionsClose = () => {
        setAnchorEl(null);
    };

    const mobileView = useMediaQuery('(max-width:480px)');


    return (
        <div className="flex items-center w-full md:justify-between lg:px-10 flex-wrap gap-4">
            <div className="flex gap-5 items-center">
                <Image className="w-16 h-16 rounded-full object-cover cursor-pointer"
                    src={require('@/assets/images/profile-image.png')}
                    priority
                    alt="profileImage" />
                <Badge badgeContent={"Hired"} color="primary" invisible={!(application?.status_id === OffchainProjectState.Accepted)}>
                    <p className="text-2xl font-bold">{freelancer?.display_name}</p>
                </Badge>
            </div>
            {
                <p className="text-base text-primary max-w-[50%] break-words">@
                    {(mobileView && freelancer?.username?.length > 16)
                        ? `${freelancer?.username.substr(0, 16)}...`
                        : freelancer?.username
                    }
                </p>
            }


            <div className='relative flex gap-3'>

                <button
                    className="Pending Review-btn in-dark text-xs lg:text-base rounded-full py-3 px-6 lg:px-6 lg:py-[14px]"
                    onClick={() => application.user_id && handleMessageBoxClick(application?.user_id, freelancer?.username)}>
                    Message
                </button>

                <button
                    id="demo-customized-button"
                    aria-controls={open ? 'demo-customized-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleOptionsClick}
                    className='primary-btn in-dark w-button !text-xs lg:!text-base'
                >
                    Options
                    <KeyboardArrowDownIcon fontSize='small' className='ml-2' />
                </button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleOptionsClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={() => {
                        handleOptionsClose()
                        router.push(`/freelancers/${freelancer?.username}/`)
                    }}>
                        Freelancer Profile
                    </MenuItem>
                    {application?.status_id == OffchainProjectState.PendingReview && (
                        <div>
                            <MenuItem onClick={() => {
                                handleOptionsClose()
                                setOpenPopup(true)
                            }}>
                                Hire
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleOptionsClose()
                                    updateApplicationState(application, OffchainProjectState.ChangesRequested);
                                }}>
                                Request Changes
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleOptionsClose()
                                    updateApplicationState(application, OffchainProjectState.Rejected);
                                }}>
                                Reject
                            </MenuItem>

                        </div>
                    )}
                </Menu>
            </div>

            <HirePopup
                {...{
                    openPopup,
                    setOpenPopup,
                    brief,
                    freelancer,
                    application,
                    milestones,
                    totalCostWithoutFee,
                    imbueFee,
                    totalCost,
                    setLoading,
                }}
            />
        </div>
    );
};

export default BriefOwnerHeader;