import { CircularProgress, ClickAwayListener, TextField } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';

import { fetchUserByUsernameOrAddress } from '@/utils';
import { isValidAddressPolkadotAddress } from '@/utils/helper';


type ApproverProps = {
    approvers: string[]
    setApprovers: (value: string[]) => void;
}

const Approvers = ({ setApprovers, approvers }: ApproverProps) => {
    const [open, setOpen] = useState<boolean>(false)
    const [regUsers, setRegUsers] = useState<any>([])
    // const [approvers, setApprovers] = useState<string[]>([])
    const [approversPreview, setApproversPreview] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [input, setInput] = useState<string>("")
    const [validAddress, setValidAddress] = useState<boolean>(false)

    const notUser = (regUsers[0]?.web3_address !== input) && input && validAddress
    const notUserApprover = {
        // id: 6,
        display_name: "",
        profile_photo: null,
        username: "",
        web3_address: ""
    }

    const getAllUsers = async (e: any) => {
        setOpen(true)
        if (e.target.value === "") {
            setRegUsers(await fetchUserByUsernameOrAddress(""))
            setLoading(false)
        }
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleInputChange = async (e: any) => {
        const input = e.target.value
        setInput(input)
        const allUsers = await fetchUserByUsernameOrAddress(input)

        const isValid = isValidAddressPolkadotAddress(input)
        setValidAddress(isValid)
        setRegUsers(allUsers)
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
                    approversPreview?.map((approver: any, index: number) => (
                        <div key={index} className='flex text-white gap-3 items-center cursor-pointer border border-light-white px-2 py-1 rounded-full'>
                            <Image
                                height={40}
                                width={40}
                                src={approver?.profile_photo ?? "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png"}
                                alt=''
                                className='rounded-full'
                            />
                            <div className='flex flex-col'>
                                <span>{approver?.display_name}</span>
                                <p className='text-xs'>{approver?.web3_address}</p>

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
                        onClick={(e) => getAllUsers(e)}
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
                                    loading
                                        ? <p className='flex items-center gap-10 p-4'>Loading users <CircularProgress /></p>
                                        : <>
                                            {(
                                                <>
                                                    {
                                                        (regUsers[0]?.web3_address !== input) && input && (
                                                            <div
                                                                onClick={() => notUser && !approvers.includes(input) && addApprover({ ...notUserApprover, web3_address: input })}
                                                                className={`px-4 py-2 flex justify-between items-center ${notUser && "cursor-pointer hover:bg-secondary-dark-hover"}`}>
                                                                <div className='flex gap-3 items-center'>
                                                                    {
                                                                        notUser && <Image height={40} width={40} src={"http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png"} alt='' />
                                                                    }
                                                                    <span>
                                                                        {input}
                                                                    </span>
                                                                </div>
                                                                <span>
                                                                    {
                                                                        validAddress
                                                                            ? <>
                                                                                {
                                                                                    approvers.includes(input)
                                                                                        ? <span className='text-primary text-sm'>Requested</span>
                                                                                        : <span className='text-theme-secondary text-sm'>Request</span>
                                                                                }
                                                                            </>
                                                                            : <span className='text-red-600 text-sm'>Invalid Web 3 Address</span>
                                                                    }
                                                                </span>

                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        regUsers?.map((user: any, index: number) => (
                                                            <div
                                                                key={index}
                                                                onClick={() => (!approvers.includes(user?.web3_address) && user?.web3_address) && addApprover(user)}
                                                                className='flex flex-col gap-4'
                                                            >

                                                                <div className='flex justify-between items-center w-full hover:bg-secondary-dark-hover px-4 py-2'>
                                                                    <div className='flex text-white gap-3 items-center cursor-pointer'>
                                                                        <Image
                                                                            height={40}
                                                                            width={40}
                                                                            src={user?.profile_photo ?? "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png"}
                                                                            alt=''
                                                                            className='rounded-full'
                                                                        />
                                                                        <div className='flex flex-col'>
                                                                            <span>{user?.display_name}</span>
                                                                            <p className='text-xs mt-2 text-white text-opacity-60'>{user?.web3_address ?? "No Web3 address found"}</p>

                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        user?.web3_address && (
                                                                            <span className='text-sm'>
                                                                                {
                                                                                    approvers.includes(user?.web3_address)
                                                                                        ? <span className='text-primary'>Requested</span>
                                                                                        : <span className='text-theme-secondary'>Request</span>
                                                                                }
                                                                            </span>
                                                                        )
                                                                    }
                                                                </div>

                                                            </div>
                                                        ))
                                                    }
                                                </>
                                            )
                                            }
                                        </>
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

// const users = [
//     { display_name: 'Sam', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "5Ey5TNpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pHK" },
//     { display_name: 'Aala', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "abcdNpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH2" },
//     { display_name: 'Felix', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "trqefNpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH3" },
//     { display_name: '', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "laojhNpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH4" },
//     { display_name: 'Oliver', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "3ftrwpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH5" },
//     { display_name: 'Michael', profile_photo: "http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png", web3_address: "l9jy7NpdCa61XrXpgNRUAHor4Xvt25cHwmPM1BYUG1su2pH6" },
// ];