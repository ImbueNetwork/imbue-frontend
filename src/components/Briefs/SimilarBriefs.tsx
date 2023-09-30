import ArrowIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";

import { Brief } from "@/model";
import { getAllBriefs } from "@/redux/services/briefService";

const SimilarProjects = () => {
    const [showSimilarBrief, setShowSimilarBrief] = useState<boolean>(false);
    const [similarBriefs, setSimilarBriefs] = useState<Brief[]>([]);

    const router = useRouter()

    useEffect(() => {
        const setUpBriefs = async () => {
            const briefs_all: any = await getAllBriefs(4, 1);
            setSimilarBriefs(briefs_all?.currentData);
        };
        setUpBriefs();
    }, []);

    return (
        <div
            className={`transparent-conatainer !bg-imbue-light-purple-three relative ${showSimilarBrief ? '!pb-[3rem]' : ''
                } `}
        >
            <div className='flex justify-between w-full lg:px-[4rem] px-[1rem]'>
                <h3 className='text-imbue-purple-dark'>Similar projects on Imbue</h3>
                <div
                    className={`transition transform ease-in-out duration-600 ${showSimilarBrief && 'rotate-180'
                        } cursor-pointer`}
                >
                    <ArrowIcon
                        onClick={() => setShowSimilarBrief(!showSimilarBrief)}
                        className='scale-150'
                        sx={{
                            color: '#03116A',
                        }}
                    />
                </div>
            </div>

            <div className={`${!showSimilarBrief && 'hidden'} my-6`}>
                <hr className='h-[1.5px] bg-[rgba(3, 17, 106, 0.12)] w-full mb-[0.5rem]' />
                {/* TODO: Need an object for the list of similar projects */}
                {/* FIXME: replace dummy array with similar projects data*/}
                {similarBriefs.map((brief, index) => (
                    <div
                        key={`${index}-sim-brief`}
                        className='similar-brief lg:px-[4rem] px-[1rem]'
                    >
                        <div className='similar-brief-details !items-start !flex-col gap-4'>
                            <h3 className='text-base whitespace-nowrap w-fit text-imbue-purple-dark'>
                                {brief?.headline}
                            </h3>
                            <span className='max-width-750px:!text-base max-width-750px:overflow-hidden max-width-750px:text-ellipsis max-width-750px:ml-3 max-width-750px:line-clamp-2 !text-imbue-purple'>
                                {brief?.description?.length > 300
                                    ? brief?.description.substring(0, 300) + '...'
                                    : brief?.description}
                            </span>
                        </div>
                        <button
                            onClick={() => router.push(`/briefs/${brief?.id}`)}
                            className='primary-btn in-dark w-button max-width-750px:!px-[9px] max-width-750px:mr-0'
                        >
                            View Brief
                        </button>
                    </div>
                ))}
            </div>
            {showSimilarBrief && (
                <span
                    onClick={() => router.push(`/briefs`)}
                    className='primary-text font-bold absolute bottom-7 lg:right-[4.5rem] right-6 cursor-pointer !text-imbue-coral hover:underline'
                >
                    View all
                </span>
            )}
        </div>
    );
};

export default SimilarProjects;