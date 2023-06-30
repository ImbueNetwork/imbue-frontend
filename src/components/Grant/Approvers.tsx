; import { ClickAwayListener, InputAdornment, TextField } from '@mui/material';
import React, { useState } from 'react';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Image from 'next/image';
import { type } from 'os';

type ApproverProps = {
    approvers: string[]
    setApprovers: (value: string[]) => void;
}

const Approvers = ({ setApprovers, approvers }: ApproverProps) => {
    const [open, setOpen] = useState<boolean>(false)
    const [regUsers, setRegUsers] = useState(users)
    // const [approvers, setApprovers] = useState<string[]>([])
    const [approversPreview, setApproversPreview] = useState<any>([])

    const handleClose = () => {
        setOpen(false)
    }

    const handleInputChange = (e: any) => {
        if (e.target.value === "") {
            setRegUsers(users)
        }
        setRegUsers(users.filter((v: any) => v.web3_address.includes(e.target.value)))
    }

    const addApprover = (newApprover: any) => {
        const newList = [...approversPreview, newApprover]
        setApproversPreview(newList)
        setApprovers(newList.map((v: any) => v.web3_address))
    }

    const removeApprover = (index: number) => {
        const approversList = [...approversPreview]
        approversList.splice(index, 1)
        setApproversPreview(approversList)
        setApprovers(approversList.map((v: any) => v.web3_address))
    }

    return (
        <div>
            <div className='mb-5 flex flex-wrap gap-3'>
                {
                    approversPreview?.map((preview: any, index: number) => (
                        <div className='flex text-white gap-3 items-center cursor-pointer border border-light-white px-2 py-1 rounded-full'>
                            <Image height={40} width={40} src={"http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png"} alt='' />
                            <div className='flex flex-col'>
                                <span>{preview?.display_name}</span>
                                <p className='text-xs'>{preview?.web3_address}</p>

                            </div>
                            <div
                                onClick={() => removeApprover(index)}
                                className='px-2 py-0.5 rounded-full bg-purple-300 cursor-pointer'>
                                X
                            </div>
                        </div>
                    ))
                }
            </div>
            <ClickAwayListener onClickAway={handleClose}>
                <div className='relative h-14'>
                    <TextField
                        onClick={() => setOpen(true)}
                        id="outlined-basic"
                        label="Outlined"
                        variant="outlined"
                        className='w-full'
                        onChange={(e) => handleInputChange(e)}
                    />

                    {
                        open && (
                            <div className='flex flex-col bg-black absolute top-full w-full z-[5] py-2'>
                                {
                                    regUsers?.length
                                        ? (
                                            <>
                                                {
                                                    regUsers?.map((user: any) => (
                                                        <div key={user?.web3_address} onClick={() => approvers.includes(user?.web3_address) || addApprover(user)} className='flex justify-between items-center w-full hover:bg-secondary-dark-hover px-4 py-2'>
                                                            <div className='flex text-white gap-3 items-center cursor-pointer'>
                                                                <Image height={40} width={40} src={"http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png"} alt='' />
                                                                <div className='flex flex-col'>
                                                                    <span>{user?.display_name}</span>
                                                                    <p className='text-xs'>{user?.web3_address}</p>

                                                                </div>
                                                            </div>
                                                            <span className='text-sm'>
                                                                {
                                                                    approvers.includes(user?.web3_address)
                                                                    ?<span className='text-primary'>Requested</span>
                                                                    :<span className='text-theme-secondary'>Request</span>
                                                                }
                                                            </span>
                                                        </div>
                                                    ))
                                                }
                                            </>
                                        )
                                        : <div className='px-4 py-2'>No Approver Found</div>
                                }

                            </div>
                        )
                    }
                </div>
            </ClickAwayListener>

        </div>
    );
};

export default Approvers;

const users = [
    { display_name: 'Sam', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "5Ey5TNpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pHK" },
    { display_name: 'Aala', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "abcdNpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH2" },
    { display_name: 'Felix', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "trqefNpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH3" },
    { display_name: '', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "laojhNpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH4" },
    { display_name: 'Oliver', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "3ftrwpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH5" },
    { display_name: 'Michael', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "l9jy7NpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH6" },
];