import { TextField } from '@mui/material';
import React, { ChangeEvent, useState } from 'react';

const ValidatableInput = (props: any) => {
    const {
        minLength = 10,
        maxLength = 50,
        name = "Input",
        onChange: handleOnChange,
        hideLimit = false,
        value
    } = props

    const [error, setError] = useState<string>("")

    const handleInput = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value

        if (
            value === undefined ||
            value === null ||
            value.length === 0
        ) {
            setError(`${name} cannot be empty`)
        }
        else if (value.length < minLength || value.length > maxLength) {
            setError(`Valid ${name} is required between ${minLength} and ${maxLength}`)
        }
        else {
            setError("")
        }

        handleOnChange(event)
    }

    return (
        <div className='w-full'>
            <TextField
                id="outlined-multiline-static"
                {...props}
                inputProps={{
                    maxLength
                }}
                onChange={(e) => handleInput(e)}
                className='w-full !mb-0'
                multiline
                color='secondary'
            />
            <div className='flex justify-between items-center'>
                <p className='mt-2 text-imbue-coral text-sm text-right capitalize-first'>{error}</p>
                {
                    !hideLimit && (
                        <p className='mt-2 text-content-primary text-sm text-right'>{value?.length || 0}/{maxLength}</p>
                    )
                }
            </div>
        </div>
    );
};

export default ValidatableInput;