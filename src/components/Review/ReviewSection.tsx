import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, StyledEngineProvider, TextField } from '@mui/material';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { ReviewType } from '@/lib/queryServices/reviewQueries';

import { getReviewService } from '@/redux/services/reviewServices';

import Review from './Review';

interface ReviewSectionProps {
    user_id: string | number;
    setError?: (_error: any) => void;
}

const ReviewSection = ({ user_id, setError }: ReviewSectionProps) => {

    const [sortReviews, setSortReviews] = useState<any>('relevant');
    const [reviews, setReviews] = useState<ReviewType[]>([])
    const [filteredReviews, setFilteredReviews] = useState<ReviewType[]>([])
    const [loading, setLoading] = useState<boolean>(true);

    // const reviews = [
    //     {
    //         name: 'Sam',
    //         ratings: 3,
    //         time: '1 month',
    //         description:
    //             'I have created a web NFT marketplace landing page for imbue , you can check on my profile to see more',
    //         countryCode: 'US',
    //         country: 'United States',
    //         image:
    //             'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    //     },
    //     {
    //         name: 'Sausan',
    //         ratings: 3,
    //         time: '1 month',
    //         description:
    //             'I have created a web NFT marketplace landing page for imbue , you can check on my profile to see more',
    //         countryCode: 'NO',
    //         country: 'Norway',
    //         image:
    //             'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    //     },
    //     {
    //         name: 'Aala S.',
    //         ratings: 3,
    //         time: '1 month',
    //         description:
    //             'I have contacted idris muhammad for building web3 for new eBook product that i am developing for my coaching business',
    //         countryCode: 'CA',
    //         country: 'Canada',
    //         image:
    //             'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
    //     },
    // ];


    useEffect(() => {
        const getReviews = async () => {

            if (!user_id) return

            setLoading(true)

            const resp = await getReviewService(user_id)
            console.log("🚀 ~ file: ReviewSection.tsx:67 ~ getReviews ~ resp:", resp)

            if (resp?.length) {
                setReviews(resp)
                setFilteredReviews(resp)
            }
            else setError?.(resp.message)

            setLoading(false)
        }

        getReviews();

    }, [setError, user_id])

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


    // if (loading) return <span>Loading...</span>


    return (
        <div>
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
                        sx={{ m: 1, minWidth: 180, maxWidth: '100px' }}
                    >
                        <InputLabel id='demo-simple-select-standard-label'>
                            Sort by
                        </InputLabel>
                        <Select
                            labelId='demo-simple-select-standard-label'
                            id='demo-simple-select-standard'
                            value={sortReviews}
                            onChange={(e) => setSortReviews(e.target.value)}
                            label='Sort by'
                        >
                            <MenuItem value='relevant'>Most Relevant</MenuItem>
                            <MenuItem value='ratings'>Ratings</MenuItem>
                            <MenuItem value='budget'>Budget</MenuItem>
                            <MenuItem value='date'>Date</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </StyledEngineProvider>
            <hr className='separator' />

            <div className='flex flex-col gap-5 bg-white px-10 py-10 rounded-xl'>
                {
                    filteredReviews.map((review, index) => (
                        <Review key={index} review={review} />
                    ))
                }
            </div>
        </div>
    );
};

export default ReviewSection;