import { Box, Dialog, Rating } from '@mui/material';
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

import InputOutlined from '../Common/InputOutlined';
import TextAreaOutlined from '../Common/TextFieldOutlined';

interface ReviewModalProps {
    freelancerName: string;
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

const ReviewButton = ({ freelancerName }: ReviewModalProps) => {
    const [open, setOpen] = useState<boolean>(false)
    const [value, setValue] = React.useState<number | null>(3);
    const [hover, setHover] = React.useState(-1);

    const handleClose = () => setOpen(false);

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
                        Add a review for {freelancerName}
                    </p>

                    <div className='mt-5'>
                        <div className='flex flex-col gap-3 mb-3'>
                            <p>How was your experience with {freelancerName}?</p>
                            <div className='flex'>
                                <Rating
                                    name="hover-feedback"
                                    value={value}
                                    getLabelText={getLabelText}
                                    onChange={(event, newValue) => {
                                        setValue(newValue);
                                    }}
                                    onChangeActive={(event, newHover) => {
                                        setHover(newHover);
                                    }}
                                    icon={
                                        <FaStar color='var(--theme-primary)' />
                                    }
                                // emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                />
                                {value !== null && (
                                    <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
                                )}
                            </div>
                        </div>


                        <p>Title</p>
                        <InputOutlined />

                        <p>Description</p>
                        <TextAreaOutlined />

                        <div className='flex items-center justify-center w-full mt-3'>
                            <button className='primary-btn in-dark w-button'>Submit</button>
                        </div>
                    </div>
                </div>
            </Dialog>
            <button
                className='px-3 py-1 rounded-full bg-imbue-light-purple text-sm text-content'
                onClick={() => setOpen(true)}
            >
                Review
            </button>
        </div>
    );
};

export default ReviewButton;