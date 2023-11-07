import ArrowIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Brief } from '@/model';

type ClientsHistoryType = {
    client: any;
    briefId: string;
    allClientBriefs: any;
}

const ClientsHistory = ({ client, briefId, allClientBriefs }: ClientsHistoryType) => {
    const [showClientHistory, setShowClientHistory] = useState<boolean>(false);
    const [clientBriefs, setClientAllBriefs] = useState<Brief[]>([])
    const [totalBriefs, setTotalBriefs] = useState<number>(0)
    const [briefsToShow, setBriefsToShow] = useState<number>(3)
    const router = useRouter()

    useEffect(() => {
        const setUpClientHistory = async () => {
            if(!allClientBriefs) {
                return
            }
            const briefs = allClientBriefs.briefsUnderReview?.filter((brief: Brief) => brief.id != briefId)
            setTotalBriefs(briefs?.length)
            briefs.splice(briefsToShow)
            setClientAllBriefs(briefs)
        }
        client?.id && setUpClientHistory()
    }, [client?.id, briefId, allClientBriefs, briefsToShow])

    // const showBriefs = () =>{
    //     const truncatedBrief = [...clientBriefs]
    //     truncatedBrief.splice(4)
    //     setBriefsToShow(truncatedBrief)
    // }

    if (clientBriefs?.length === 0) return <></>

    return (
        <div
            className={`transparent-conatainer !bg-imbue-light-purple-three relative ${showClientHistory ? '!pb-0' : ''
                }`}
        >
            <div className='flex justify-between w-full lg:px-[4rem] px-[1rem]'>
                <h3 className='text-imbue-purple-dark'>{`Client's other briefs (${totalBriefs})`}</h3>
                <div
                    className={`transition transform ease-in-out duration-600 ${showClientHistory && 'rotate-180'
                        } cursor-pointer`}
                >
                    <ArrowIcon
                        onClick={() => setShowClientHistory(!showClientHistory)}
                        className='scale-150'
                        sx={{
                            color: '#03116A',
                        }}
                    />
                </div>
            </div>
            <div className={`${!showClientHistory && 'hidden'} my-6`}>
                <hr className='h-[1.5px] bg-[rgba(3, 17, 106, 0.12)] w-full mb-[0.5rem]' />
                {/* FIXME: replace dummy array with client history data*/}
                {clientBriefs.map((brief, index) => (
                    <div
                        key={`${index}-similar-brief`}
                        className='similar-brief lg:px-[4rem] px-[1rem] items-center last:border-b-0'
                    >
                        <div className='flex flex-col gap-5 justify-start'>
                            <h3 className='text-imbue-purple-dark'>{brief?.headline}</h3>
                            {/* TODO: implement ratings */}
                            {/* <div className='flex items-center'>
                                {[4, 4, 4, 4].map((star, index) => (
                                    <StarIcon
                                        key={`${index}-star-icon`}
                                        className={`${index <= 4 && 'primary-icon'}`}
                                    />
                                ))}
                                <span className='ml-3 text-imbue-purple-dark'>
                                    Thanks for choosing me. All the best for your future works...
                                </span>
                            </div> */}
                            <p className='text-base text-content line-clamp-4  w-5/6'>
                                {
                                    brief?.description?.length > 500
                                        ? brief?.description.substring(0, 500) + "..."
                                        : brief?.description
                                }
                            </p>
                            <button
                                onClick={() => router.push(`/briefs/${brief?.id}`)}
                                className='primary-btn in-dark w-button !mr-auto'
                            >
                                View Full Brief
                            </button>
                        </div>
                        <div className='flex flex-col gap-5 max-w-[150px] w-full'>
                            <p className='text-imbue-purple-dark'>{moment(brief?.created).format('MMMM DD, YYYY')}</p>
                            <p className='text-imbue-purple-dark'>Budget: ${brief?.budget}</p>
                        </div>
                    </div>
                ))}
            </div>
            {showClientHistory && (
                <span
                    onClick={() => setBriefsToShow((prev) => briefsToShow < totalBriefs ? prev + 3 : 3)}
                    className='primary-text font-bold absolute bottom-7 lg:right-[4.5rem] right-6 cursor-pointer !text-imbue-coral hover:underline'
                >
                    {
                        briefsToShow < totalBriefs
                            ? `View more (${totalBriefs - clientBriefs?.length})`
                            : `View less`
                    }
                </span>
            )}
        </div>
    );
};

export default ClientsHistory;