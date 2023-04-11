import { BriefInsights } from '@/components/Briefs/BriefInsights';
import { Brief } from '@/model';
import { getBrief } from "@/redux/services/briefService";
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const Project = () => {
    const router = useRouter()
    const [brief, setBrief] = useState<Brief>()
    const [expandMilestone, setExpand] = useState<number>()
    const id: any = router.query.id || 0;

    const milestones = [
        { name: "c++ Network Experts for banking app", fundPercent: 45,fundAmound:45000, description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus, viverra vitae congue eu, consequat ac felis donec et odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus", created: "25 February 2033", state: "Completed" },
        { name: "c++ Network Experts for banking app", fundPercent: 45,fundAmound:45000, description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus, viverra vitae congue eu, consequat ac felis donec et odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus", created: "25 February 2033", state: "Open for voting" },
        { name: "c++ Network Experts for banking app", fundPercent: 45,fundAmound:45000, description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus, viverra vitae congue eu, consequat ac felis donec et odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus", created: "25 February 2033", state: "In Progress" },
        { name: "c++ Network Experts for banking app", fundPercent: 45,fundAmound:45000, description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor rhoncus dolor purus non enim praesent elementum facilisis leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet massa vitae tortor condimentum lacinia quis vel eros donec ac odio tempor orci dapibus ultrices in iaculis nunc sed augue lacus, viverra vitae congue eu, consequat ac felis donec et odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus faucibus", created: "25 February 2033", state: "Not Started" },
    ]

    useEffect(() => {
        const fetchData = async () => {
            const briefData: Brief = await getBrief(id);
            setBrief(briefData);
        }
        id && fetchData()
    }, [id])


    return brief && (
        <div>
            <BriefInsights brief={brief} />
            {
                milestones?.map((milestone, index) => (
                    <div key={index} className='brief-container my-14'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-end gap-8'>
                                <h3 className='text-3xl'>Milestone {index + 1}</h3>
                                <h3 className='text-xl font-bold'>{milestone.name}</h3>
                            </div>
                            <div className='flex gap-3 items-center'>
                                <span>{milestone.created}</span>
                                {
                                    milestone.state==="Open for voting"
                                    ? <div className='flex items-center ml-4 text-primary font-bold'><div className='w-4 h-4 bg-primary rounded-full mx-3'></div> {milestone.state}</div>
                                    :<span className='ml-4 -text--theme-secondary font-bold'>{milestone.state}</span>
                                }
                                
                                {
                                    expandMilestone === index 
                                    ? <button className='rounded-full text-white bg-[#411dc9] w-7 h-7 flex items-center justify-center' onClick={() => setExpand(-1)}>-</button>
                                    : <button className='rounded-full text-white bg-[#411dc9] w-7 h-7 flex items-center justify-center' onClick={() => setExpand(index)}>+</button>
                                }
                                
                            </div>
                        </div>
                        {
                            expandMilestone === index && (
                                <div className='mt-5'>
                                    <h3 className='mt-3'>Percentage of Funds to be released <span className='primary-text font-bold'>{milestone.fundPercent}%</span></h3>
                                    <h3 className='mt-1'>Funding to be released <span className='primary-text font-bold'>${milestone.fundAmound}USD</span></h3>
                                    <p className='mt-5'>{milestone.description}</p>
                                    {milestone.state==="Open for voting" && <button className='primary-btn in-dark w-button mt-6'>Vote</button>}
                                </div>
                            )
                        }
                    </div>
                ))
            }
        </div>
    );
};

export default Project;