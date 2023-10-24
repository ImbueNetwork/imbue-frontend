import { Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { BsFilter } from 'react-icons/bs';
import { FiBookmark } from 'react-icons/fi';
import { HiMagnifyingGlass } from 'react-icons/hi2';

import { strToIntRange } from '@/utils/helper';

import BriefComponent from '@/components/BriefComponent';
import FilterModal from '@/components/Filter/FilterModal';

import { Brief, BriefSqlFilter, Item, User } from '@/model';
import { callSearchBriefs, getAllBriefs, getAllSavedBriefs, getAllSkills } from '@/redux/services/briefService';

import { BriefFilterOption } from '@/types/briefTypes';

type BriefsViewProps = {
    setError: (_error: any) => void;
    currentUser: User;
}

const BriefsView = (props: BriefsViewProps) => {
    const { setError, currentUser } = props
    const [briefs, setBriefs] = useState<Brief[]>([]);
    const [currentPage] = useState<number>(1);
    // FIXME: setLoading
    const [loading, setLoading] = useState<boolean>(true);
    const [itemsPerPage, setItemsPerPage] = useState<number>(6);
    // const [pageInput, setPageInput] = useState<number>(1);
    const [searchInput, setSearchInput] = useState<string>('');

    const [selectedFilterIds, setSlectedFilterIds] = useState<Array<string>>([]);
    const [savedBriefsActive, setSavedBriefsActive] = useState<boolean>(false);
    const [filterVisble, setFilterVisible] = useState<boolean>(false);

    const router = useRouter()

    const {
        expRange,
        submitRange,
        lengthRange,
        heading,
        size: sizeProps,
        skillsProps,
        verified_only: verifiedOnlyProp,
    } = router.query;

    useEffect(() => {
        const fetchAndSetBriefs = async () => {
            try {
                if (!Object.keys(router?.query).length) {
                    const briefs_all: any = await getAllBriefs(itemsPerPage, currentPage);
                    if (briefs_all.status === 200) {
                        setBriefs(briefs_all?.currentData);
                    } else {
                        setError({ message: 'Something went wrong. Please try again' });
                    }
                } else {
                    let filter: BriefSqlFilter = {
                        experience_range: [],
                        submitted_range: [],
                        submitted_is_max: false,
                        length_range: [],
                        skills_range: [],
                        length_is_max: false,
                        search_input: '',
                        items_per_page: itemsPerPage,
                        page: currentPage,
                        verified_only: false,
                        non_verified: false,
                    };

                    const verifiedOnlyPropIndex = selectedFilterIds.indexOf('4-0');

                    // if (router.query.page) {
                    //     const pageQuery = Number(router.query.page);
                    //     filter.page = pageQuery;
                    //     setCurrentPage(pageQuery);
                    //     setPageInput(pageQuery);
                    // }

                    if (router.query.non_verified) {
                        filter.non_verified = true;
                    }

                    if (sizeProps) {
                        filter.items_per_page = Number(sizeProps);
                        setItemsPerPage(Number(sizeProps));
                    }

                    if (expRange) {
                        const range = strToIntRange(expRange);
                        range?.forEach?.((v: any) => {
                            if (!selectedFilterIds.includes(`0-${v - 1}`))
                                selectedFilterIds.push(`0-${v - 1}`);
                        });

                        filter = { ...filter, experience_range: strToIntRange(expRange) };
                    }

                    if (skillsProps) {
                        const range = strToIntRange(skillsProps);
                        range?.forEach?.((v: any) => {
                            if (!selectedFilterIds.includes(`3-${v}`))
                                selectedFilterIds.push(`3-${v}`);
                        });

                        filter = { ...filter, skills_range: range };
                    }

                    if (submitRange) {
                        const range = strToIntRange(submitRange);
                        range?.forEach?.((v: any) => {
                            if (v > 0 && v < 5) selectedFilterIds.push(`1-${0}`);

                            if (v >= 5 && v < 10) selectedFilterIds.push(`1-${1}`);

                            if (v >= 10 && v < 15) selectedFilterIds.push(`1-${2}`);

                            if (v > 15) selectedFilterIds.push(`1-${3}`);
                        });
                        filter = { ...filter, submitted_range: strToIntRange(submitRange) };
                    }
                    if (heading) {
                        filter = { ...filter, search_input: heading };
                        // const input = document.getElementById(
                        //   'search-input'
                        // ) as HTMLInputElement;
                        // if (input) input.value = heading.toString();
                        setSearchInput(heading.toString());
                    }

                    if (verifiedOnlyProp) {
                        if (!selectedFilterIds.includes(`4-0`))
                            selectedFilterIds.push(`4-0`);

                        filter = { ...filter, verified_only: true };
                    } else if (verifiedOnlyPropIndex !== -1) {
                        // const newFileter = [...selectedFilterIds].filter((f) => f !== '4-0')
                        // setSlectedFilterIds(newFileter)
                        selectedFilterIds.splice(verifiedOnlyPropIndex, 1);
                    }

                    if (lengthRange) {
                        const range = strToIntRange(lengthRange);
                        range?.forEach?.((v: any) => {
                            if (!selectedFilterIds.includes(`2-${v - 1}`))
                                selectedFilterIds.push(`2-${v - 1}`);
                        });
                        filter = { ...filter, length_range: strToIntRange(lengthRange) };
                    }

                    let result: any = [];

                    if (savedBriefsActive) {
                        result = await getAllSavedBriefs(
                            filter.items_per_page || itemsPerPage,
                            currentPage,
                            currentUser?.id
                        );
                    } else {
                        result = await callSearchBriefs(filter);
                    }

                    if (result.status === 200 || result.totalBriefs !== undefined) {
                        const totalPages = Math.ceil(
                            result?.totalBriefs / (filter?.items_per_page || 6)
                        );

                        if (totalPages < filter.page && totalPages > 0) {
                            router.query.page = totalPages.toString();
                            router.push(router, undefined, { shallow: true });
                            filter.page = totalPages;
                        }

                        setBriefs(result?.currentData);
                    } else {
                        setError({ message: 'Something went wrong. Please try again' });
                    }
                }
            } catch (error) {
                setError({ message: 'Something went wrong. Please try again' + error });
            } finally {
                setLoading(false);
            }
        };

        router.isReady && fetchAndSetBriefs();
    }, [router.isReady, currentPage, itemsPerPage, router, setError, selectedFilterIds, sizeProps, expRange, skillsProps, submitRange, heading, verifiedOnlyProp, lengthRange, savedBriefsActive, currentUser?.id]);


    const expfilter = {
        // This is a table named "experience"
        // If you change this you must remigrate the experience table and add the new field.
        filterType: BriefFilterOption.ExpLevel,
        label: 'Experience Level',
        options: [
            {
                interiorIndex: 0,
                search_for: [1],
                value: 'Entry Level',
                or_max: false,
            },
            {
                interiorIndex: 1,
                search_for: [2],
                value: 'Intermediate',
                or_max: false,
            },
            {
                interiorIndex: 2,
                search_for: [3],
                value: 'Expert',
                or_max: false,
            },
            {
                interiorIndex: 3,
                search_for: [4],
                value: 'Specialist',
                or_max: false,
            },
        ],
    };

    const submittedFilters = {
        // This is a field associated with the User.
        // since its a range i need the
        filterType: BriefFilterOption.AmountSubmitted,
        label: 'Briefs Submitted',
        options: [
            {
                interiorIndex: 0,
                search_for: [1, 2, 3, 4],
                value: '1-4',
                or_max: false,
            },
            {
                interiorIndex: 1,
                search_for: [5, 6, 7, 8, 9],
                value: '5-9',
                or_max: false,
            },
            {
                interiorIndex: 2,
                search_for: [10, 11, 12, 13, 14],
                value: '10-14',
                or_max: false,
            },
            {
                interiorIndex: 3,
                search_for: [15, 10000],
                value: '15+',
                or_max: true,
            },
        ],
    };

    const lengthFilters = {
        // Should be a field in the database, WILL BE IN DAYS.

        // Again i need the high and low values.
        filterType: BriefFilterOption.Length,
        label: 'Project Length',
        options: [
            {
                interiorIndex: 0,
                search_for: [1],
                value: '1-3 months',
                or_max: false,
            },
            {
                interiorIndex: 1,
                search_for: [2],
                value: '3-6 months',
                or_max: false,
            },
            {
                interiorIndex: 2,
                search_for: [3],
                value: '6-12 months',
                or_max: false,
            },
            {
                interiorIndex: 3,
                search_for: [12],
                or_max: true,
                value: '1 year +',
            },
            {
                // years * months
                interiorIndex: 4,
                search_for: [12 * 5],
                or_max: true,
                value: '5 years +',
            },
        ],
    };

    // const hoursPwFilter = {
    //   filterType: BriefFilterOption.HoursPerWeek,
    //   label: 'Hours Per Week',
    //   options: [
    //     {
    //       interiorIndex: 0,
    //       // This will be 0-30 as we actually use this as max value
    //       search_for: [30],
    //       or_max: false,
    //       value: '30hrs/week',
    //     },
    //     {
    //       interiorIndex: 1,
    //       // Same goes for this
    //       search_for: [50],
    //       value: '50hrs/week',
    //       or_max: true,
    //     },
    //   ],
    // };

    const [skills, setSkills] = useState<Item[]>([{ name: '', id: 0 }]);

    useEffect(() => {
        const getAllFilters = async () => {
            const filteredItems = await getAllSkills();
            setSkills(filteredItems?.skills);
        };

        getAllFilters();
    }, []);

    const skillsFilter = {
        filterType: BriefFilterOption.Skills,
        label: 'Skills required',
        options: skills?.map((s) => ({
            interiorIndex: s.id,
            search_for: [s.id],
            value: s.name,
        })),
    };

    const freelancerInfoFilter = {
        filterType: BriefFilterOption.FreelancerInfo,
        label: 'Freelancer Info',
        options: [
            {
                interiorIndex: 0,
                value: 'Verified',
            },
            {
                interiorIndex: 1,
                value: 'Non-verified',
            },
        ],
    };

    const customDropdownConfigs = [
        {
            label: 'Project Length',
            filterType: BriefFilterOption.Length,
            options: lengthFilters.options,
        },
        {
            label: 'Proposal Submitted',
            filterType: BriefFilterOption.AmountSubmitted,
            options: submittedFilters.options,
        },
        {
            label: 'Experience Level',
            filterType: BriefFilterOption.ExpLevel,
            options: expfilter.options,
        },
        {
            label: 'Skills Required',
            filterType: BriefFilterOption.Skills,
            options: skillsFilter.options,
        },
        {
            label: 'Freelancer Information',
            filterType: BriefFilterOption.FreelancerInfo,
            options: freelancerInfoFilter.options,
        },
        // {
        //   name: 'Hours Per Week',
        //   filterType: BriefFilterOption.HoursPerWeek,
        //   filterOptions: hoursPwFilter.options,
        // },
    ];

    // Here we have to get all the checked boxes and try and construct a query out of it...
    const onSearch = async () => {
        // The filter initially should return all values
        setLoading(true);
        let is_search = false;

        let exp_range: number[] = [];
        let submitted_range: number[] = [];
        let submitted_is_max = false;
        let length_range: number[] = [];
        let length_is_max = false;
        let length_range_prop: number[] = [];
        let skills_prop: number[] = [];
        let verified_only = false;
        let non_verified = false;

        // default is max
        // const hpw_max = 50;
        // const hpw_is_max = false;
        const search_value = searchInput;
        if (search_value !== '') {
            is_search = true;
        }

        for (let i = 0; i < selectedFilterIds.length; i++) {
            if (selectedFilterIds[i] !== '') {
                is_search = true;
                const id = selectedFilterIds[i];
                if (id != null) {
                    const [filterType, interiorIndex] = id.split('-');
                    // Here we are trying to build teh paramaters required to build the query
                    // We build an array for each to get the values we want through concat.
                    // and also specify if we want more than using the is_max field.

                    switch (parseInt(filterType) as BriefFilterOption) {
                        case BriefFilterOption.ExpLevel:
                            {
                                const o = expfilter.options[parseInt(interiorIndex)];
                                exp_range = [...exp_range, ...o.search_for.slice()];
                            }
                            break;

                        case BriefFilterOption.AmountSubmitted:
                            {
                                const o1 = submittedFilters.options[parseInt(interiorIndex)];
                                submitted_range = [
                                    ...submitted_range,
                                    ...o1.search_for.slice(),
                                ];
                                submitted_is_max = o1.or_max;
                            }
                            break;

                        case BriefFilterOption.Length:
                            {
                                const o2 = lengthFilters.options[parseInt(interiorIndex)];
                                length_range = [...length_range, ...o2.search_for.slice()];
                                length_is_max = o2.or_max;

                                if (o2.search_for[0] === 12)
                                    length_range_prop = [...length_range_prop, 4];
                                else if (o2.search_for[0] === 60)
                                    length_range_prop = [...length_range_prop, 5];
                                else length_range_prop = length_range;
                            }
                            break;

                        case BriefFilterOption.Skills:
                            {
                                skills_prop = [...skills_prop, parseInt(interiorIndex)];
                            }
                            break;

                        case BriefFilterOption.FreelancerInfo:
                            {
                                if (parseInt(interiorIndex) === 0) verified_only = true;
                                if (parseInt(interiorIndex) === 1) non_verified = true;
                            }
                            break;

                        default:
                            // eslint-disable-next-line no-console
                            console.log(
                                'Invalid filter option selected or unimplemented. type:' +
                                filterType
                            );
                    }
                }
            }
        }

        router.query.page = '1';
        router.query.verified_only = verified_only ? '1' : [];
        router.query.non_verified = non_verified ? '1' : [];
        router.query.heading = search_value !== '' ? search_value : [];
        router.query.expRange = exp_range.length ? exp_range.toString() : [];
        router.query.submitRange = submitted_range.length
            ? submitted_range.toString()
            : [];
        router.query.submitted_is_max = submitted_is_max
            ? submitted_is_max.toString()
            : [];
        router.query.lengthRange = length_range_prop.length
            ? length_range_prop.toString()
            : [];
        router.query.skillsProps = skills_prop.length ? skills_prop.toString() : [];
        router.push(router, undefined, { shallow: true });

        try {
            if (is_search) {
                const filter: BriefSqlFilter = {
                    experience_range: exp_range,
                    submitted_range,
                    submitted_is_max,
                    length_range,
                    length_is_max,
                    skills_range: skills_prop,
                    search_input: search_value,
                    items_per_page: itemsPerPage,
                    page: 1,
                    verified_only: verified_only,
                    non_verified: non_verified,
                };

                if (search_value.length === 0) {
                    setFilterVisible(!filterVisble);
                }

                const briefs_filtered: any = await callSearchBriefs(filter);

                setBriefs(briefs_filtered?.currentData);
            } else {
                const briefs_all: any = await getAllBriefs(itemsPerPage, currentPage);

                setBriefs(briefs_all?.currentData);
            }
        } catch (error) {
            setError({ message: error });
        } finally {
            setLoading(false);
            setFilterVisible(false);
        }
    };

    const toggleFilter = () => {
        setFilterVisible(!filterVisble);
    };

    const reset = async () => {
        setSavedBriefsActive(false);
        await router.push({
            pathname: router.pathname,
            query: {},
        });
        const allBriefs: any = await getAllBriefs(itemsPerPage, currentPage);
        setSlectedFilterIds([]);
        setBriefs(allBriefs?.currentData);
        setSearchInput('');
    };

    const cancelFilters = async () => {
        reset();
        setFilterVisible(false);
    };

    const handleSetId = (id: string | string[]) => {
        if (Array.isArray(id)) {
            setSlectedFilterIds([...id]);
        } else {
            setSlectedFilterIds([...selectedFilterIds, id]);
        }
    };

    return (
        <div className='border-2 text-text-aux-colour max-w-[75%] rounded-2xl w-full border-imbue-light-grey'>
            <div className='justify-between py-2 border-b b items-center flex px-7'>
                <p className='text-[#747474]'>Recomended Briefs</p>
                <div className='flex gap-5 items-center'>
                    <div className='flex group-focus:border-black active:border-black border border-imbue-light-grey py-2 px-3 rounded-full items-center'>
                        <HiMagnifyingGlass
                            onClick={onSearch}
                            size={20}
                            color='black'
                        />
                        <input
                            className='text-base group text-black ml-2 focus:outline-none h-7'
                            type='text'
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    <div className='px-4 flex items-center gap-2 py-2 rounded-full border border-imbue-light-grey'>
                        <FiBookmark size={20} color='black' />
                        <p className='text-black'>Saved jobs</p>
                    </div>
                    <div
                        className='px-4 flex items-center gap-2 py-2 rounded-full border bg-imbue-light-grey border-imbue-light-grey cursor-pointer'
                        onClick={() => setFilterVisible(true)}
                    >
                        <BsFilter size={20} color='black' />
                        <p className='text-black'>Filter</p>
                    </div>
                </div>
            </div>
            {
                loading
                    ? (
                        <div>
                            {
                                [1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className='border-b last:border-b-0 flex first-letter:'
                                    >
                                        <div className='w-2/3 p-10'>
                                            <Skeleton className='w-full h-10' variant="text" />
                                            <div className='flex items-center gap-3 w-full'>
                                                <Skeleton className='w-28 h-14' variant="text" />
                                                <Skeleton className='w-28 h-14' variant="text" />
                                                <Skeleton className='w-28 h-14' variant="text" />
                                            </div>

                                            <Skeleton className='text-base w-full mt-3' variant="text" />
                                            <Skeleton className='text-base w-full' variant="text" />
                                            <Skeleton className='text-base w-2/3' variant="text" />

                                            <div className='flex items-center gap-3 w-full mt-5'>
                                                <Skeleton className='w-28 h-8' variant="text" />
                                                <Skeleton className='w-28 h-8' variant="text" />
                                                <Skeleton className='w-28 h-8' variant="text" />
                                            </div>
                                        </div>

                                        <div className='w-1/3 p-8 border-l'>
                                            <div className='flex items-center gap-3 mb-5'>
                                                <Skeleton variant="circular" width={50} height={50} />
                                                <div className='w-full'>
                                                    <Skeleton className='w-3/4 text-base' variant="text" />
                                                    <Skeleton className='w-3/4 text-base' variant="text" />
                                                </div>
                                            </div>

                                            <Skeleton className='w-full mt-3 text-base' variant="text" />
                                            <Skeleton className='w-full mt-3 text-base' variant="text" />
                                            <Skeleton className='w-full mt-3 text-base' variant="text" />
                                            <Skeleton className='w-full mt-3 text-base' variant="text" />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>)
                    : (<>
                        {
                            briefs.map((brief) => (
                                <BriefComponent key={brief.id} brief={brief} />
                            ))
                        }</>)
            }

            <FilterModal
                open={filterVisble}
                handleClose={() => toggleFilter()}
                {...{
                    cancelFilters,
                    handleSetId,
                    onSearch,
                    customDropdownConfigs,
                    selectedFilterIds,
                }}
            />
        </div>
    );
};

export default BriefsView;