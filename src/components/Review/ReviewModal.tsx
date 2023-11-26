import { Box, Dialog, Rating } from '@mui/material';
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import { ReviewType } from '@/lib/queryServices/reviewQueries';

import { Project, User } from '@/model';
import { postReviewService } from '@/redux/services/reviewServices';
import { RootState } from '@/redux/store/store';

import InputOutlined from '../Common/InputOutlined';
import TextAreaOutlined from '../Common/TextAreaOutlined';
import { LoginPopupStateType } from '../Layout';

interface ReviewModalProps {
    targetUser: User;
    project?: Project;
    setShowLoginPopup?: (_value: LoginPopupStateType) => void;
    setLoading?: (_value: boolean) => void;
    setSuccessTitle: (_value: string) => void;
    setSuccess: (_value: boolean) => void;
    setError: (_value: any) => void;
    review?: ReviewType;
    button?: boolean;
    openMain?: boolean;
    setOpenMain?: (_value: boolean) => void;
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

const ReviewFormModal = ({ targetUser, project, setShowLoginPopup, setSuccess, setSuccessTitle, setLoading, setError, review, button, openMain = false, setOpenMain }: ReviewModalProps) => {
    const [open, setOpen] = useState<boolean>(openMain)
    const [hover, setHover] = React.useState(-1);

    const [rating, setRating] = React.useState<number>(review?.ratings || 3);
    const [title, setTitle] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    const { user, loading: userLoading } = useSelector(
        (state: RootState) => state.userState
    )

    const handleClose = () => {
        setOpen(false);
        setOpenMain?.(false);
    }

    const handleSubmit = async () => {
        setLoading?.(true);
        handleClose();

        const review = {
            title,
            description,
            ratings: rating,
            user_id: targetUser.id,
            project_id: project?.id,
            reviewer_id: user.id,
        }
        const resp = await postReviewService(review)

        if (resp.status === 'success') {
            setSuccess(true);
            setSuccessTitle("Your review has been successfully submitted")
        } else {
            setError({ message: resp.message })
        }
        setLoading?.(false);
    }

    return (
        <div>
            <Dialog
                open={open || openMain}
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
                                    defaultValue={review?.ratings}
                                    value={rating}
                                    getLabelText={getLabelText}
                                    onChange={(event, newValue) => {
                                        setRating(newValue || 0);
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
                            inputProps={{ defaultValue: review?.title }}
                        />

                        <p>Description</p>
                        <TextAreaOutlined
                            props={{
                                onChange: (e) => setDescription(e.target.value)
                            }}
                            inputProps={{ defaultValue: review?.description }}
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
            {
                button && (
                    <button
                        className='px-3 py-1 rounded-full bg-imbue-light-purple text-sm text-content'
                        onClick={() => {
                            if (userLoading || !user.id) setShowLoginPopup?.({ open: true, redirectURL: `/projects/${project?.id}` });
                            else setOpen(true)
                        }}
                    >
                        Review
                    </button>
                )
            }
        </div>
    );
};

export default ReviewFormModal;