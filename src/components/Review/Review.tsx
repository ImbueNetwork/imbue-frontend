import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { FaStar } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import { ReviewType } from '@/lib/queryServices/reviewQueries';

import { RootState } from '@/redux/store/store';

import ReviewFormModal from './ReviewModal';
import ErrorScreen from '../ErrorScreen';
import { findFlag } from '../Profile/CountrySelector';
import SuccessScreen from '../SuccessScreen';

interface ReviewProps {
    review: ReviewType;
}

const Review = ({ review }: ReviewProps) => {
    const { user: browsingUser, loading } = useSelector((state: RootState) => state.userState)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [expanded, setExpanded] = useState<boolean>(false)

    const showExpandButton = review.description.length > 500 && !expanded

    const router = useRouter()

    const handleEdit = async () => {
        setOpenReviewForm(true)
    }

    const [openReviewForm, setOpenReviewForm] = useState<boolean>(false)
    const [error, setError] = useState<any>()
    const [success, setSuccess] = useState<boolean>(false)
    const [successTitle, setSuccessTitle] = useState<string>("")

    return (
        <div
            className='flex flex-col gap-2 pt-2 pb-5 border-b last:border-b-0 border-b-imbue-light-purple text-imbue-purple-dark relative'
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
                            <MenuItem onClick={handleEdit}>
                                Edit
                            </MenuItem>
                            <MenuItem onClick={handleClose}>
                                Delete
                            </MenuItem>
                        </Menu>
                    </div>
                )
            }

            <div className='flex gap-3'>
                <div className='h-[46px] w-[46px] rounded-full overflow-hidden relative'>
                    <Image
                        sizes='24'
                        className='object-cover cursor-pointer'
                        src={review.profile_photo || require('../../assets/images/profile-image.png')}
                        fill
                        alt='user'
                        onClick={() => router.push(`/profile/${review.username}`)}
                    />
                </div>
                <div>
                    <p>
                        {review.display_name.length > 50
                            ? `${review.display_name.substring(0, 50)}...`
                            : review.display_name}
                    </p>
                    {
                        review?.country && (
                            <div className='flex gap-2 items-center'>
                                <ReactCountryFlag
                                    className='text-imbue-purple-dark font-bold'
                                    countryCode={findFlag(review.country) || 'TR'}
                                />
                                <span>{review.country}</span>
                            </div>
                        )
                    }
                </div>
            </div>

            <div className='flex items-center'>
                {[...Array(5)].map((_r, ri) => (
                    <FaStar
                        className='lg:h-[16px] lg:w-[16px]'
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
            <p className='mt-2 text-lg text-content break-all'>
                {review?.title}
            </p>
            <p className='break-all whitespace-pre-wrap'>
                {review.description.length > 500 && !expanded
                    ? `${review.description.substring(0, 500)}...`
                    : review.description}

                {
                    review.description.length > 500 && (
                        <span
                            className='text-sm text-imbue-purple underline ml-1 cursor-pointer'
                            onClick={() => {
                                if (showExpandButton)
                                    setExpanded(true)
                                else
                                    setExpanded(false)
                            }}
                        >
                            {
                                showExpandButton
                                    ? "See Full Review"
                                    : "See Less"
                            }
                        </span>
                    )
                }
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
            <ReviewFormModal
                openMain={openReviewForm}
                setOpenMain={setOpenReviewForm}
                targetUser={browsingUser}
                review={review}
                {...{
                    setSuccess,
                    setSuccessTitle,
                    setError
                }}
            />

            <ErrorScreen {...{ error, setError }}>
                <div className='flex flex-col gap-4 w-1/2'>
                    <button
                        onClick={() => setError(null)}
                        className='primary-btn in-dark w-button w-full !m-0'
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push(`/dashboard`)}
                        className='underline text-xs lg:text-base font-bold'
                    >
                        Go to Dashboard
                    </button>
                </div>
            </ErrorScreen>
            <SuccessScreen
                noRetry={false}
                title={successTitle}
                open={success}
                setOpen={setSuccess}
            >
                <div className='flex flex-col gap-4 w-1/2'>
                    <button
                        onClick={() => {
                            setSuccess(false);
                        }}
                        className='primary-btn in-dark w-button w-full !m-0'
                    >
                        Continue
                    </button>
                    <button
                        onClick={() => router.push(`/dashboard`)}
                        className='underline text-xs lg:text-base font-bold'
                    >
                        Go to dashboard
                    </button>
                </div>
            </SuccessScreen>
        </div>
    );
};

export default Review;