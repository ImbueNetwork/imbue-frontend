import { Dialog, Rating } from '@mui/material';
import Link from 'next/link';
import React, { ChangeEvent, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useSelector } from 'react-redux';

import { ReviewType } from '@/lib/queryServices/reviewQueries';

import { Project } from '@/model';
import { editReview, postReviewService } from '@/redux/services/reviewServices';
import { RootState } from '@/redux/store/store';

import { LoginPopupStateType } from '../Layout';
import SuccessScreen from '../SuccessScreen';
import ValidatableInput from '../ValidatableInput';
import styles from '../../styles/modules/Freelancers/new-Freelancer.module.css';

interface ReviewModalProps {
    targetUser: any;
    project?: Project;
    setShowLoginPopup?: (_value: LoginPopupStateType) => void;
    setLoading?: (_value: boolean) => void;
    setError: (_value: any) => void;
    review?: ReviewType;
    button?: boolean;
    openMain?: boolean;
    setOpenMain?: (_value: boolean) => void;
    action: 'post' | 'edit';
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

const ReviewFormModal = ({ targetUser, project, setShowLoginPopup, setLoading, setError, review, button, openMain = false, setOpenMain, action }: ReviewModalProps) => {
    const [open, setOpen] = useState<boolean>(openMain)
    const [success, setSuccess] = useState<boolean>(false)
    // const [hover, setHover] = React.useState(-1);

    const [rating, setRating] = React.useState<number>(review?.ratings || 3);
    // const [title, setTitle] = useState<string | undefined>(action === 'post' ? project?.name : review?.title)
    const [description, setDescription] = useState<string>(review?.description || "")

    const { user, loading: userLoading } = useSelector(
        (state: RootState) => state.userState
    )

    const handleClose = () => {
        setOpen(false);
        setOpenMain?.(false);
    }

    const handleSubmit = async () => {
        if (!rating) return setError({ message: "Please use a rating from 1 to 5" })
        
        handleClose();
        setLoading?.(true);

        const reviewBody: any = {
            title: project?.name || "",
            description,
            ratings: rating,
            user_id: targetUser?.user_id || targetUser.id,
            project_id: project?.id,
            reviewer_id: user.id,
        }

        let resp;

        if (action === 'post')
            resp = await postReviewService(reviewBody)
        else if (action === 'edit') {
            reviewBody.id = review?.id
            resp = await editReview(reviewBody)
        }


        if (resp?.status === 'success') {
            setSuccess(true);
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
                className='p-14 errorDialogue min-h-fit'
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
                                    // onChangeActive={(event, newHover) => {
                                    //     setHover(newHover);
                                    // }}
                                    icon={
                                        <FaStar color='var(--theme-primary)' />
                                    }
                                // emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                />
                                {/* {rating !== null && (
                                    <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : rating]}</Box>
                                )} */}
                            </div>
                        </div>


                        {/* <p className='mb-2'>Title</p>
                        <ValidatableInput
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setTitle(e.target.value)
                            }
                            className={`${styles.fieldInput} ${styles.large}`}
                            placeholder='Add a Title'
                            data-testid='title'
                            name='title'
                            maxLength={50}
                            minLength={3}
                            // defaultValue={action === 'post' ? project?.name : review?.title}
                            value={title || ""}
                        /> */}

                        <p className='mt-5 mb-3'>Project Title: {project?.name}</p>

                        <p className='mb-2'>Description (optional)</p>
                        {/* <TextAreaOutlined
                            props={{
                                onChange: (e) => setDescription(e.target.value)
                            }}
                            inputProps={{ defaultValue: review?.description }}
                        /> */}
                        <ValidatableInput
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setDescription(e.target.value)
                            }
                            className={`${styles.fieldInput} ${styles.large}`}
                            placeholder='Add a description'
                            data-testid='description'
                            name='description'
                            maxLength={500}
                            minLength={0}
                            rows={6}
                            defaultValue={review?.description}
                            value={description}
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
                            if (!userLoading && !user.id) setShowLoginPopup?.({ open: true, redirectURL: `/projects/${project?.id}` });
                            else setOpen(true)
                        }}
                    >
                        Review
                    </button>
                )
            }

            <SuccessScreen
                noRetry={true}
                title={'Your review has been successfully submitted'}
                open={success}
                setOpen={setSuccess}
            >
                <div className='flex flex-col gap-4 w-1/2'>
                    <button
                        onClick={() => {
                            window.location.reload();
                            setSuccess(false);
                        }}
                        className='primary-btn in-dark w-button w-full !m-0'
                    >
                        Continue to Project
                    </button>
                    <button className='underline text-xs lg:text-base font-bold'>
                        <Link
                            href={`/dashboard`}
                        >
                            Go to dashboard
                        </Link>
                    </button>
                </div>
            </SuccessScreen>
        </div>
    );
};

export default ReviewFormModal;