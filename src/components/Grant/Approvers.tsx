/* eslint-disable no-unused-vars */
import { CircularProgress, ClickAwayListener, TextField } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';

import { searchUserByUsernameOrAddress } from '@/utils';
import { isValidAddressPolkadotAddress } from '@/utils/helper';

type ApproverProps = {
  approvers: string[];
  setApprovers: (value: string[]) => void;
  user: any;
};

const Approvers = ({ setApprovers, approvers, user }: ApproverProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [regUsers, setRegUsers] = useState<any>([]);
  const [approversPreview, setApproversPreview] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [input, setInput] = useState<string>('');
  const [validAddress, setValidAddress] = useState<boolean>(false);

  const notUser = regUsers[0]?.web3_address !== input && input && validAddress;
  const notUserApprover = {
    // id: 6,
    display_name: '',
    profile_photo: null,
    username: '',
    web3_address: '',
  };

  const getAllUsers = async (e: any) => {
    setOpen(true);
    if (e.target.value === '') {
      const allUsers = await searchUserByUsernameOrAddress('')
      const excludeUser = allUsers.filter((u: any) => u.web3_address !== user?.web3_address)

      setRegUsers(excludeUser);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = async (e: any) => {
    const input = e.target.value;
    setInput(input);
    const allUsers = await searchUserByUsernameOrAddress(input);
    const excludeUser = allUsers.filter((u: any) => u.web3_address !== user?.web3_address)

    const isValid = isValidAddressPolkadotAddress(input);
    setValidAddress(isValid);
    setRegUsers(excludeUser);
  };

  const addApprover = (newApprover: any) => {
    const newList = [...approversPreview, newApprover];
    setApproversPreview(newList);
    setApprovers(newList.map((v: any) => v.web3_address));
    setInput('');
    setOpen(false);
  };

  const removeApprover = (index: number) => {
    const approversList = [...approversPreview];
    approversList.splice(index, 1);
    setApproversPreview(approversList);
    setApprovers(approversList.map((v: any) => v.web3_address));
  };

  return (
    <div>
      <div className='lg:mb-5 flex flex-wrap gap-3'>
        {approversPreview?.map((approver: any, index: number) => (
          <div
            key={index}
            className='flex gap-3 items-start lg:items-center cursor-pointer border border-light-white p-2 rounded-full'
          >
            <Image
              height={40}
              width={40}
              src={
                approver?.profile_photo ??
                'http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png'
              }
              alt=''
              className='rounded-full'
            />
            <div className='flex flex-col'>
              <span className='text-content'>{approver?.display_name}</span>
              <p className='text-xs text-content-primary break-all mt-2 lg:mt-0'>
                {approver?.web3_address}
              </p>
            </div>
            <div
              onClick={() => removeApprover(index)}
              className='py-1 px-2 flex items-center justify-center rounded-full bg-purple-300 cursor-pointer text-[10px]'
            >
              X
            </div>
          </div>
        ))}
      </div>
      <ClickAwayListener onClickAway={handleClose}>
        <div className='relative h-14 mt-6 lg:mt-0'>
          <TextField
            autoComplete='off'
            color='secondary'
            onClick={(e) => getAllUsers(e)}
            id='outlined-basic'
            label='Add Approvers'
            variant='outlined'
            className='w-full approverInput'
            value={input}
            onChange={(e) => handleInputChange(e)}
          />

          {open && (
            <div className='flex flex-col bg-overlay border border-imbue-purple rounded-lg absolute top-full w-full z-[5] overflow-hidden'>
              {loading ? (
                <p className='flex items-center gap-10 p-4'>
                  Loading users <CircularProgress />
                </p>
              ) : (
                <>
                  {
                    <>
                      {regUsers[0]?.web3_address !== input && input && (
                        <div
                          onClick={() =>
                            notUser &&
                            !approvers.includes(input) &&
                            addApprover({
                              ...notUserApprover,
                              web3_address: input,
                            })
                          }
                          className={`px-4 py-2 flex justify-between items-center border-b border-b-imbue-light-purple ${notUser &&
                            'cursor-pointer hover:bg-imbue-light-purple'
                            }`}
                        >
                          <div className='flex gap-3 items-center'>
                            {notUser && (
                              <Image
                                height={40}
                                width={40}
                                src={
                                  'http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png'
                                }
                                alt=''
                              />
                            )}
                            <span className='text-content-primary p-2'>
                              {input}
                            </span>
                          </div>
                          <span>
                            {validAddress ? (
                              <>
                                {approvers.includes(input) ? (
                                  <span className='text-primary text-sm'>
                                    Requested
                                  </span>
                                ) : (
                                  <span className='text-theme-secondary text-sm'>
                                    Request
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className='text-red-600 text-xs'>
                                Invalid Web 3 Address
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {(regUsers.length > 0) && (
                        <>
                          <p className='ml-5 my-3 text-content text-sm font-semibold'>Suggested Results</p>
                          {
                            regUsers.map((user: any, index: number) => (
                              <div
                                key={index}
                                onClick={() =>
                                  !approvers.includes(user?.web3_address) &&
                                  user?.web3_address &&
                                  addApprover(user)
                                }
                                className='flex flex-col gap-4 '
                              >
                                <div className='flex justify-between items-center w-full hover:bg-imbue-light-purple px-4 py-2'>
                                  <div className='flex text-white gap-3 items-center cursor-pointer'>
                                    <Image
                                      height={40}
                                      width={40}
                                      src={
                                        user?.profile_photo ??
                                        'http://res.cloudinary.com/imbue-dev/image/upload/v1688127641/pvi34o7vkqpuoc5cgz3f.png'
                                      }
                                      alt=''
                                      className='rounded-full'
                                    />
                                    <div className='flex flex-col'>
                                      <span className='text-content'>
                                        {user?.display_name}
                                      </span>
                                      <p className='text-xs mt-2 text-opacity-60 text-content-primary'>
                                        {user?.web3_address ??
                                          'No Web3 address found'}
                                      </p>
                                    </div>
                                  </div>
                                  {user?.web3_address && (
                                    <span className='text-sm'>
                                      {approvers.includes(user?.web3_address) ? (
                                        <span className='text-primary'>
                                          Requested
                                        </span>
                                      ) : (
                                        <span className='text-theme-secondary'>
                                          Request
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          }
                        </>
                      )
                      }
                    </>
                  }
                </>
              )}
            </div>
          )}
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
