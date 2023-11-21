import { Box, Dialog, Rating } from '@mui/material';
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import { apiBase } from '@/config';
import { postAPIHeaders } from '@/config';
import { Project, User } from '@/model';
import { RootState } from '@/redux/store/store';

import InputOutlined from '../Common/InputOutlined';
import TextAreaOutlined from '../Common/TextAreaOutlined';
import { LoginPopupStateType } from '../Layout';

interface ReviewModalProps {
    targetUser: User;
    project: Project;
    setShowLoginPopup: (_value: LoginPopupStateType) => void
}

const labels: { [index: string]: string } = {
    1: 'Useless',
    2: 'Poor',
    3: 'Ok',
    4: 'Good',
    5: 'Excellent',
};

function getLabelText(value: number) {
    return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

const ReviewButton = ({ targetUser, project, setShowLoginPopup }: ReviewModalProps) => {
    const [open, setOpen] = useState<boolean>(false)
    const [hover, setHover] = React.useState(-1);

    const [rating, setRating] = React.useState<number | null>(3);
    const [title, setTitle] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    const { user, loading: userLoading } = useSelector(
        (state: RootState) => state.userState
    )

    const handleClose = () => setOpen(false);

    const handleSubmit = async () => {
        const resp = await fetch(`${apiBase}reviews`, {
            method: 'Post',
            headers: postAPIHeaders,
            body: JSON.stringify({
                title,
                description,
                ratings: rating,
                user_id: targetUser.id
            })
        })

        console.log(await resp.json());

    }

    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
                className='p-14 errorDialogue'
            >
                <div className='flex flex-col gap-3 p-8 text-content'>
                    <p className='text-center text-lg lg:text-2xl font-bold text-content-primary'>
                        Add a review for {targetUser?.display_name}
                    </p>

                    <div className='mt-5'>
                        <div className='flex flex-col gap-3 mb-3'>
                            <p>How was your experience with {targetUser?.display_name}?</p>
                            <div className='flex'>
                                <Rating
                                    name="hover-feedback"
                                    value={rating}
                                    getLabelText={getLabelText}
                                    onChange={(event, newValue) => {
                                        setRating(newValue);
                                    }}
                                    onChangeActive={(event, newHover) => {
                                        setHover(newHover);
                                    }}
                                    icon={
                                        <FaStar color='var(--theme-primary)' />
                                    }
                                // emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                />
                                {rating !== null && (
                                    <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : rating]}</Box>
                                )}
                            </div>
                        </div>


                        <p>Title</p>
                        <InputOutlined
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <p>Description</p>
                        <TextAreaOutlined
                            props={{
                                onChange: (e) => setDescription(e.target.value)
                            }}
                        />

                        <div className='flex items-center justify-center w-full mt-3'>
                            <button
                                onClick={() => handleSubmit()}
                                className='primary-btn in-dark w-button'
                            >Submit</button>
                        </div>
                    </div>
                </div>
            </Dialog>
            <button
                className='px-3 py-1 rounded-full bg-imbue-light-purple text-sm text-content'
                onClick={() => {
                    if (userLoading || !user.id) setShowLoginPopup({ open: true, redirectURL: `/projects/${project.id}` });
                    else setOpen(true)
                }}
            >
                Review
            </button>
        </div>
    );
};

export default ReviewButton;