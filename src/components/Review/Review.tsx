import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import moment from 'moment';
import Image from 'next/image';
import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { FaStar } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import { ReviewType } from '@/lib/queryServices/reviewQueries';

import { RootState } from '@/redux/store/store';

import { findFlag } from '../Profile/CountrySelector';

interface ReviewProps {
    review: ReviewType;
}

const options = [
    'Edit',
    'Delete',
];

const Review = ({ review }: ReviewProps) => {
    const { user: browsingUser, loading } = useSelector((state: RootState) => state.userState)

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div
            className='flex flex-col gap-3 pt-2 pb-5 border-b last:border-b-0 border-b-imbue-light-purple text-imbue-purple-dark relative'
        >
            {
                !loading && browsingUser.id === review.reviewer_id && (
                    <div className='absolute right-0 top-0'>
                        <IconButton
                            aria-label="more"
                            id="long-button"
                            aria-controls={open ? 'long-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={handleClick}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="long-menu"
                            MenuListProps={{
                                'aria-labelledby': 'long-button',
                            }}
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                                style: {
                                    width: '20ch',
                                },
                            }}
                        >
                            {options.map((option) => (
                                <MenuItem key={option} selected={option === 'Pyxis'} onClick={handleClose}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Menu>
                    </div>
                )
            }

            <div className='flex gap-3'>
                <div className='h-[46px] w-[46px] rounded-full overflow-hidden relative'>
                    <Image
                        sizes='24'
                        className='object-cover'
                        src={review.profile_photo || require('../../assets/images/profile-image.png')}
                        fill
                        alt='user'
                    />
                </div>
                <div>
                    <p>
                        {review.display_name.length > 50
                            ? `${review.display_name.substring(0, 50)}...`
                            : review.display_name}
                    </p>
                    <div className='flex gap-2 items-center'>
                        <ReactCountryFlag
                            className='text-imbue-purple-dark font-bold'
                            countryCode={findFlag(review.country) || 'TR'}
                        />
                        <span>{review.country}</span>
                    </div>
                </div>
            </div>

            <div className='flex items-center'>
                {[...Array(5)].map((_r, ri) => (
                    <FaStar
                        className='lg:h-[24px] lg:w-[24px]'
                        key={ri}
                        color={
                            ri + 1 > review.ratings
                                ? 'var(--theme-purple-light)'
                                : 'var(--theme-primary)'
                        }
                    />
                ))}
                <span className='text-imbue-purple ml-3'>
                    | {moment(review.modified).format('MMMM Do, YYYY')}
                </span>
            </div>
            <p className='mt-2 break-all'>
                {review.description.length > 500
                    ? `${review.description.substring(0, 500)}...`
                    : review.description}
            </p>
            {/* <div className='flex gap-4'>
                            <p>Helpful?</p>
                            <div className='flex gap-3'>
                                <div className='cta-vote'>
                                    <FaRegThumbsUp />
                                    Yes
                                </div>
                                <div className='cta-vote'>
                                    <FaRegThumbsDown />
                                    No
                                </div>
                            </div>
                        </div> */}
        </div>
    );
};

export default Review;