import { Modal } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import { Project } from '@/model';


type ProjectHintsType = {
    setModalOpen: (_open: boolean) => void;
    projectType: string | null;
    balance: number;
    requiredBalance: number;
    project: Project
}

const ProjectHint = ({ setModalOpen, projectType, balance, requiredBalance, project }: ProjectHintsType) => {
    return (
        <Modal
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                outline: 0,
                border: 'none',
            }}
            open={true}
            onClose={() => setModalOpen(false)}
        >
            <div className='bg-white rounded-2xl absolute top-28 right-14 min-w-[32.5625rem] py-7 px-6 text-imbue-purple-dark'>
                <div
                    onClick={() => setModalOpen(false)}
                    className='pb-7 flex-row-reverse cursor-pointer  items-center flex'
                >
                    <Image
                        className='ml-2'
                        src={'/cross.svg'}
                        width={30}
                        height={30}
                        alt='close'
                    />
                    <p>close</p>
                </div>
                <div className='flex flex-col items-center'>
                    <Image
                        src={'/round-dimond.svg'}
                        height={50}
                        width={50}
                        alt='rounded dimond'
                    />
                    <p className='text-3xl pt-3'>Pending</p>
                    <p className='py-2'>
                        steps required to submit/withdraw a milestone
                    </p>
                </div>
                <div className='flex  mt-7 items-center w-full'>
                    <Image
                        className='bg-transparent drop-shadow-sm mr-3'
                        src={'/checked.svg'}
                        width={35}
                        height={30}
                        alt='checked'
                    />
                    <div className='flex bg-imbue-light-purple-three rounded-xl px-3 py-2 w-full justify-between items-center '>
                        <p className='flex text-xl flex-col'>
                            {projectType}
                            <span className='text-xs text-imbue-light-purple-two'>
                                create {projectType}
                            </span>
                        </p>
                        <p className='ml-auto text-imbue-purple text-sm'>Done</p>
                    </div>
                </div>
                <div className='flex  mt-2 items-center w-full'>
                    <Image
                        className='bg-transparent  drop-shadow-sm mr-2'
                        src={'/checked.svg'}
                        width={40}
                        height={30}
                        alt='checked'
                    />
                    <div className='flex bg-imbue-light-purple-three rounded-xl px-3 py-2 w-full justify-between items-center '>
                        <p className='flex text-xl flex-col'>
                            Address
                            <span className='text-xs text-imbue-light-purple-two'>
                                copy escrow address and submit this proposal to kusama
                            </span>
                        </p>
                        <p className='ml-auto text-sm text-imbue-purple'>Done</p>
                    </div>
                </div>
                <div className='flex  mt-2 items-center w-full'>
                    {balance >= requiredBalance ? (
                        <Image
                            className='bg-transparent  drop-shadow-sm mr-2'
                            src={'/checked.svg'}
                            width={40}
                            height={30}
                            alt='checked'
                        />
                    ) : (
                        <Image
                            className='bg-transparent  drop-shadow-sm mr-2'
                            src={'/unchecked.svg'}
                            width={40}
                            height={30}
                            alt='checked'
                        />
                    )}

                    <div className='flex bg-imbue-light-purple-three rounded-xl px-3 py-2 w-full justify-between items-center '>
                        <p className='flex text-xl flex-col'>
                            Funds deposited
                            <span className='text-xs text-imbue-light-purple-two'>
                                Raised through governance
                            </span>
                        </p>
                        {balance >=
                            Number(
                                Number(project?.total_cost_without_fee) +
                                Number(project?.imbue_fee)
                            ) ? (
                            <p className='ml-auto text-sm text-imbue-purple'>Done</p>
                        ) : (
                            <p className='ml-auto text-sm text-imbue-coral'>Not Done</p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProjectHint;