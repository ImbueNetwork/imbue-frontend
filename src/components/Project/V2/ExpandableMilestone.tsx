import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import axios from 'axios'
import moment from 'moment';
import React from 'react';
import { LuTrash2 } from 'react-icons/lu';

import { Milestone, Project } from '@/model';

interface ExpandableMilestonProps {
    item: Milestone;
    index: number;
    project: Project;
    isApplicant: boolean;
    projectType: 'grant' | 'brief' | null;
    isProjectOwner: boolean;
}

const ExpandableMilestone = ({ index, item, project, isApplicant, projectType, isProjectOwner }: ExpandableMilestonProps) => {

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (!target?.files?.length) return

        const file = target?.files[0]
        // const filename = encodeURIComponent(file.name);

        const data = new FormData()
        data.append('file', file)

        await axios.post(`/api/upload`, data)
    }

    return (
        <Accordion
            className='shadow-none mt-5 before:h-0 !rounded-xl py-5'
        >
            <AccordionSummary
                aria-controls='panel1a-content'
                id='panel1a-header'
            >
                <Typography className='grid grid-cols-12 gap-5 w-full'>
                    <div className='col-start-1 col-end-7  flex items-center'>
                        <div className='bg-[#2400FF] rounded-md relative  w-5 h-6  flex justify-center items-center text-white'>
                            <span className='relative text-sm z-10'>{index + 1}</span>
                            <div className='w-2 h-2 -rotate-45 bg-[#2400FF] absolute -bottom-0.5  '></div>
                        </div>
                        <p className='text-black ml-3 text-2xl'>{item.name}</p>
                    </div>
                    <p className='col-start-7 col-end-9 text-lg mr-10 ml-4'>
                        ${item.amount}
                    </p>
                    <p className='col-start-9 text-lg col-end-11 ml-4'>
                        {moment(item.modified).format("MMM Do YY")}
                    </p>

                    {/* <p
                        className={`px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ml-auto ${item.is_approved
                            ? 'bg-lime-100 text-lime-600'
                            : 'bg-red-100 text-red-500'}`}
                    >
                        {item.is_approved ? 'Completed' : 'Open for voting'}
                    </p> */}
                    {
                        project.first_pending_milestone === item.milestone_index &&
                            project.project_in_milestone_voting
                            ? (
                                <p
                                    className={`px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ml-auto ${item.is_approved
                                        ? 'bg-lime-100 text-lime-600'
                                        : 'bg-red-100 text-red-500'}`}
                                >
                                    {item.is_approved ? 'Completed' : 'Open for voting'}
                                </p>)
                            : (
                                <p
                                    className={`px-4 py-1.5 rounded-full col-start-11 justify-self-start col-end-13 ml-auto ${item.is_approved
                                        ? 'bg-lime-100 text-lime-600'
                                        : 'bg-[#EBEAE2] text-[#949494]'}`}
                                >
                                    {item.is_approved ? 'Completed' : 'Pending'}
                                </p>)
                    }
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography className='px-2'>
                    <div>
                        <p className='text-black mt-10 font-semibold text-lg'>
                            Milestone description and expectation
                        </p>
                        <p className='mt-5'>{item.description}</p>
                        <p className='text-black mt-10 font-semibold text-lg'>
                            Deliverables and updates
                        </p>
                        <p className='mt-5'>
                            At this stage of this project, we were entirely focused on
                            pushing out our first MVP based on our product roadmap;
                            for this we would hired talents on imbue including a
                            designer, a UX writer, a Full Stack Developer and a
                            Project Manager. We estimated our MVP Design and
                            Development to involve Key steps, Hiring, Onboarding and
                            task delegation; and at the end of this Milestone we now
                            have a live Website for our Waitlist. You can find a link
                            to the live website <a href='#'>here</a>
                        </p>
                        <p className='text-black mt-10 font-semibold text-lg'>
                            Project Attachments
                        </p>
                        <div className='flex space-x-5'>
                            <div className='border rounded-lg mt-10 flex space-x-2 items-center px-3 text-xs py-3'>
                                <div className='space-y-2'>
                                    <p>Landing page Development files</p>
                                    <p>3.2MB</p>
                                </div>
                                <LuTrash2 size={20} />
                            </div>
                            <div className='border rounded-lg mt-10 flex space-x-2 items-center px-3 text-xs py-3'>
                                <div className='space-y-2'>
                                    <p>Landing page Development files</p>
                                    <p>3.2MB</p>
                                </div>
                                <LuTrash2 size={20} />
                            </div>
                            <div className='border rounded-lg mt-10 flex space-x-2 items-center px-3 text-xs py-3'>
                                <div className='space-y-2'>
                                    <p>Landing page Development files</p>
                                    <p>3.2MB</p>
                                </div>
                                <LuTrash2 size={20} />
                            </div>
                        </div>

                        <input
                            onChange={(e) => handleUpload(e)}
                            type="file"
                        />
                        <div className='w-full mt-7 flex'>

                            {
                                !isApplicant &&
                                project.first_pending_milestone === item.milestone_index &&
                                project.project_in_milestone_voting && (
                                    <button
                                        className='primary-btn  ml-auto in-dark w-button lg:w-1/5'
                                        style={{ textAlign: 'center' }}
                                    >
                                        Vote for Milestone
                                    </button>
                                )
                            }

                            {
                                (isApplicant || (projectType === 'grant' && isProjectOwner)) &&
                                item.milestone_index == project.first_pending_milestone &&
                                !project.project_in_milestone_voting &&
                                !item?.is_approved && (
                                    <button
                                        className='primary-btn  ml-auto in-dark w-button lg:w-1/5'
                                        style={{ textAlign: 'center' }}
                                    >
                                        Submit Milestone
                                    </button>
                                )
                            }

                            {
                                isApplicant && item.is_approved && (
                                    <button
                                        className='primary-btn  ml-auto in-dark w-button lg:w-1/5'
                                        style={{ textAlign: 'center' }}
                                    >
                                        Withdraw
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default ExpandableMilestone;