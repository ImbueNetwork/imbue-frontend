import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Skeleton, StyledEngineProvider, TextField } from '@mui/material';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { ReviewType } from '@/lib/queryServices/reviewQueries';

import { getReviewService } from '@/redux/services/reviewServices';

import Review from './Review';

interface ReviewSectionProps {
    user_id?: string | number;
    reviewer_id?: string | number;
    setError?: (_error: any) => void;
}

const ReviewSection = ({ user_id, reviewer_id, setError }: ReviewSectionProps) => {

    const [sortReviews, setSortReviews] = useState<any>('relevant');
    const [reviews, setReviews] = useState<ReviewType[]>([])
    const [filteredReviews, setFilteredReviews] = useState<ReviewType[]>([])
    const [loading, setLoading] = useState<boolean>(true);

    const handleSort = (e: SelectChangeEvent<any>) => {
        const seletctedOption = e.target.value;

        setSortReviews(seletctedOption)

        switch (seletctedOption) {
            case "newest": {
                filteredReviews.sort((a, b) => {
                    return new Date(b.created).getTime() - new Date(a.created).getTime();
                })
                break
            }
            case "oldest": {
                filteredReviews.sort((a, b) => {
                    return new Date(a.created).getTime() - new Date(b.created).getTime();
                })
                break
            }
            case "best": {
                filteredReviews.sort((a, b) => {
                    return b.ratings - a.ratings
                })
                break
            }
            case "worst": {
                filteredReviews.sort((a, b) => {
                    return a.ratings - b.ratings
                })
                break
            }
            default:
                break;
        }
    }

    useEffect(() => {
        const getReviews = async () => {

            if (!user_id && !reviewer_id) return

            setLoading(true)

            const resp = await getReviewService(user_id, reviewer_id)

            if (resp?.length) {
                setReviews(resp)
                setFilteredReviews(resp)
            }
            else setError?.(resp.message)

            setLoading(false)
        }

        getReviews();

    }, [reviewer_id, setError, user_id])

    const handleSearch = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const input = e.target.value
        if (!input || !reviews?.length) return setFilteredReviews(reviews)

        const filteredReviews = reviews.filter(review => (
            review.display_name.toLowerCase().includes(input) ||
            review.title.toLowerCase().includes(input) ||
            review.description.toLowerCase().includes(input)
        ))
        setFilteredReviews(filteredReviews)
    }


    if (!loading && !reviews?.length) return <></>

    return (
        <div className='w-full'>
            {
                !loading && (
                    <StyledEngineProvider injectFirst>
                        <div className='flex flex-col'>
                            <TextField
                                onChange={handleSearch}
                                autoComplete='off'
                                color='secondary'
                                id='outlined-controlled'
                                label='Search'
                                sx={{ maxWidth: '350px' }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <FormControl
                                variant='standard'
                                sx={{ m: 1, minWidth: 180, maxWidth: '200px' }}
                            >
                                <InputLabel id='demo-simple-select-standard-label'>
                                    Sort by
                                </InputLabel>
                                <Select
                                    labelId='demo-simple-select-standard-label'
                                    id='demo-simple-select-standard'
                                    value={sortReviews}
                                    onChange={(e) => handleSort(e)}
                                    label='Sort by'
                                >
                                    <MenuItem value='newest'>Date (Newest First)</MenuItem>
                                    <MenuItem value='oldest'>Date (Oldest First)</MenuItem>
                                    <MenuItem value='best'>Rating (Best to worst)</MenuItem>
                                    <MenuItem value='worst'>Rating (Worst to best)</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </StyledEngineProvider>
                )
            }
            <hr className='separator' />

            {
                loading
                    ? (
                        <div className='flex flex-col gap-5 bg-white px-10 py-10 rounded-xl'>
                            {
                                [1, 2, 3].map(v => (
                                    <div key={v} className='pb-5 border-b last:border-b-0'>
                                        <div className='flex items-start w-full gap-2'>
                                            <Skeleton variant="circular" width={50} height={50} />
                                            <div className='w-1/2'>
                                                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                            </div>
                                        </div>

                                        <div className='w-full'>
                                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                                        </div>
                                    </div>))
                            }
                        </div>)
                    : (
                        <div className='flex flex-col gap-5 bg-white px-10 py-10 rounded-xl'>
                            {
                                filteredReviews.map((review, index) => (
                                    <Review key={index} review={review} />
                                ))
                            }
                        </div>
                    )
            }
        </div>
    );
};

export default ReviewSection;