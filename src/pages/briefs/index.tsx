/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { IoTrashBin } from 'react-icons/io5';
import { useSelector } from 'react-redux';

import { strToIntRange } from '@/utils/helper';

import CustomDropDown from '@/components/CustomDropDown';
import CustomModal from '@/components/CustomModal';
import ErrorScreen from '@/components/ErrorScreen';
import BackDropLoader from '@/components/LoadingScreen/BackDropLoader';

import {
  chevLeftIcon,
  chevRightIcon,
  filterSvg,
  savedIcon,
  searchSvg,
} from '@/assets/svgs';
import { Brief, BriefSqlFilter, Item } from '@/model';
import {
  callSearchBriefs,
  deleteSavedBrief,
  getAllBriefs,
  getAllSavedBriefs,
  getAllSkills,
} from '@/redux/services/briefService';
import { RootState } from '@/redux/store/store';

import { BriefFilterOption } from '@/types/briefTypes';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

interface FilterModalProps {
  open: boolean;
  handleClose: () => void;
}


const Briefs = (): JSX.Element => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [briefs_total, setBriefsTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  // FIXME: setLoading
  const [loading, setLoading] = useState<boolean>(true);
  const [filterVisble, setFilterVisible] = useState<boolean>(false);
  const router = useRouter();
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);

  const [selectedFilterIds, setSlectedFilterIds] = useState<Array<string>>([]);
  // FIXME: openDropdown
  const [_openDropDown, setOpenDropDown] = useState<string>('');
  const [savedBriefsActive, setSavedBriefsActive] = useState<boolean>(false);

  // search input value
  const [searchInput, setSearchInput] = useState<string>('');
  const [skills, setSkills] = useState<Item[]>([{ name: "", id: 0 }]);

  const [error, setError] = useState<any>();
  const { expRange, submitRange, lengthRange, heading, size: sizeProps } = router.query;

  const { pathname } = router;

  const pageItems = [6, 12, 18, 24, 30];

  const { user: currentUser } = useSelector(
    (state: RootState) => state.userState
  );

  // The thing with this implentation is that the interior order must stay totally ordered.
  // The interior index is used to specify which entry will be used in the search brief.
  // This is not a good implementation but im afraid if we filter and find itll be slow.
  // I can change this on request: felix

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

  const skillsFilter = {
    filterType: BriefFilterOption.HoursPerWeek,
    label: 'Skills required',
    options: skills?.map((s) => ({
      interiorIndex: 0,
      value: s.name,
    }))
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
      filterType: BriefFilterOption.HoursPerWeek,
      options: skillsFilter.options,
    },
    // {
    //   name: 'Hours Per Week',
    //   filterType: BriefFilterOption.HoursPerWeek,
    //   filterOptions: hoursPwFilter.options,
    // },
  ];

  const handleSetId = (id: string | string[]) => {
    if (Array.isArray(id)) {
      setSlectedFilterIds([...id]);
    } else {
      setSlectedFilterIds([...selectedFilterIds, id]);
    }
  };

  useEffect(() => {
    const fetchAndSetBriefs = async () => {
      setLoading(true)
      if (!Object.keys(router?.query).length) {
        const briefs_all: any = await getAllBriefs(itemsPerPage, currentPage);
        setBriefs(briefs_all?.currentData);
        setBriefsTotal(briefs_all?.totalBriefs);
      } else {
        let filter: BriefSqlFilter = {
          experience_range: [],
          submitted_range: [],
          submitted_is_max: false,
          length_range: [],
          length_is_max: false,
          search_input: '',
          items_per_page: itemsPerPage,
          page: currentPage,
        };

        if (router.query.page) {
          const pageQuery = Number(router.query.page)
          filter.page = pageQuery;
          setCurrentPage(pageQuery)
        }

        if (sizeProps) {
          filter.items_per_page = Number(sizeProps)
          setItemsPerPage(Number(sizeProps))
        }

        if (expRange) {
          const range = strToIntRange(expRange);
          range?.forEach?.((v: any) => {
            if (!selectedFilterIds.includes(`0-${v - 1}`))
              selectedFilterIds.push(`0-${v - 1}`);
          });

          filter = { ...filter, experience_range: strToIntRange(expRange) };
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
          setSearchInput(heading.toString())
        }
        if (lengthRange) {
          const range = strToIntRange(lengthRange);
          range?.forEach?.((v: any) => {
            if (!selectedFilterIds.includes(`2-${v - 1}`))
              selectedFilterIds.push(`2-${v - 1}`);
          });
          filter = { ...filter, length_range: strToIntRange(lengthRange) };
        }
        try {
          const result: any = await callSearchBriefs(filter);

          const totalPages = Math.ceil(result?.totalBriefs / (filter?.items_per_page || 6))

          if (totalPages < filter.page && totalPages > 0) {
            router.query.page = totalPages.toString()
            router.push(router, undefined, { shallow: true })
            filter.page = totalPages
          }

          setBriefs(result?.currentData);
          setBriefsTotal(result?.totalBriefs);
        } catch (error) {
          setError({ message: "Something went wrong. Please try again" })
        }
      }
      setLoading(false)
    };

    router.isReady && fetchAndSetBriefs();
  }, [
    expRange,
    heading,
    lengthRange,
    router,
    submitRange,
    currentPage,
    itemsPerPage,
  ]);

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

    // default is max
    // const hpw_max = 50;
    // const hpw_is_max = false;
    const search_input = document.getElementById(
      'search-input'
    ) as HTMLInputElement;
    const search_value = search_input.value;
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
    router.push(router, undefined, { shallow: true });

    try {
      if (is_search) {
        const filter: BriefSqlFilter = {
          experience_range: exp_range,
          submitted_range,
          submitted_is_max,
          length_range,
          length_is_max,
          search_input: search_value,
          items_per_page: itemsPerPage,
          page: 1,
        };

        if (search_value.length === 0) {
          setFilterVisible(!filterVisble);
        }

        const briefs_filtered: any = await callSearchBriefs(filter);

        setBriefs(briefs_filtered?.currentData);
        setBriefsTotal(briefs_filtered?.totalBriefs);
      } else {
        const briefs_all: any = await getAllBriefs(itemsPerPage, currentPage);

        setBriefs(briefs_all?.currentData);
        setBriefsTotal(briefs_all?.totalBriefs);
      }
    } catch (error) {
      setError({ message: error });
    }
    finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    const getAllFilters = async () => {
      const filteredItems = await getAllSkills()
      setSkills(filteredItems?.skills);
    }

    getAllFilters()
  }, [])

  const onSavedBriefs = async () => {
    setSavedBriefsActive(true);
    const briefs_all: any = await getAllSavedBriefs(
      itemsPerPage,
      currentPage,
      currentUser?.id
    );
    setBriefs(briefs_all?.currentData);
    setBriefsTotal(briefs_all?.totalBriefs);
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisble);
  };

  // const closeFilterDropDowns = () => { // looking for a better solution
  //   const itemsToClear = customDropdownConfigs
  //     ?.filter((item) => item?.filterOptions && item?.filterOptions?.length > 0)
  //     ?.map?.(({ name }) => name);

  //   itemsToClear?.forEach?.((item) => {
  //     localStorage.removeItem(item);
  //   }, []);
  // };

  const reset = async () => {
    setSavedBriefsActive(false);
    await router.push({
      pathname,
      query: {},
    });
    const allBriefs: any = await getAllBriefs(itemsPerPage, currentPage);
    await setSlectedFilterIds([]);
    setBriefs(allBriefs?.currentData);
    setBriefsTotal(allBriefs?.totalBriefs);
    setSearchInput('');
  };

  const deleteBrief = async (briefId: string | number) => {
    const allBriefs: any = await deleteSavedBrief(briefId, currentUser?.id);
    await setSlectedFilterIds([]);
    setBriefs(allBriefs?.currentData);
    setBriefsTotal(allBriefs?.totalBriefs);
  };

  const cancelFilters = async () => {
    reset();
    setFilterVisible(false);
  };

  const nextPage = () => {
    if (briefs_total > currentPage * itemsPerPage) {
      setCurrentPage(currentPage + 1);
      router.query.page = (currentPage + 1).toString()
      router.push(router, undefined, { shallow: true });
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      router.query.page = (currentPage - 1).toString()
      router.push(router, undefined, { shallow: true });
    }
  }

  const FilterModal = ({ open, handleClose }: FilterModalProps) => {
    return (
      <CustomModal
        open={open}
        onClose={handleClose}
        className='flex justify-center items-center flex-wrap bg-black bg-opacity-50 top-0 left-0 w-full h-full z-[100] fixed'
      >
        <div
          onClick={(e: any) => {
            e?.stopPropagation();
          }}
          className='bg-white rounded-2xl md:px-12 px-8 md:py-10 py-5 h-[434px] lg:w-[60%] w-[95vw] self-center relative'
        >
          <p className='font-normal text-base text-black mb-9'>Filter by:</p>

          <div className='grid md:grid-cols-4 grid-cols-1 md:gap-10 gap-5'>
            {customDropdownConfigs
              ?.filter(
                (item) => item?.options && item?.options?.length > 0
              )
              ?.map?.(({ label, filterType, options }) => (
                <CustomDropDown
                  key={label}
                  name={label}
                  filterType={filterType}
                  filterOptions={options}
                  setId={handleSetId}
                  ids={selectedFilterIds}
                  setOpenDropDown={setOpenDropDown}
                />
              ))}
          </div>

          <div className='h-[39px] text-center gap-5 flex items-center absolute md:bottom-10 bottom-5 right-10'>
            <button
              onClick={cancelFilters}
              data-testid='cancel'
              className='h-[39px] px-[20px] text-center justify-center w-[121px] rounded-[25px] bg-imbue-coral flex items-center cursor-pointer hover:scale-105 hover:bg-primary hover:text-content'
            >
              Cancel
            </button>

            <button
              onClick={onSearch}
              data-testid='Apply'
              className='h-[39px] px-[20px] text-center justify-center w-[121px] rounded-[25px] bg-imbue-purple flex items-center cursor-pointer hover:scale-105 hover:bg-primary hover:text-content'
            >
              Apply
            </button>
          </div>
        </div>
      </CustomModal>
    );
  };

  const briefsData = savedBriefsActive
    ? briefs?.filter((brief) =>
      brief?.headline.toLocaleLowerCase().includes(searchInput)
    )
    : briefs;

  return (
    <div className='flex flex-col'>
      <div className='search-briefs-container !overflow-hidden max-width-868px:px-5'>
        <FilterModal open={filterVisble} handleClose={() => toggleFilter()}
          {...{ cancelFilters, handleSetId, onSearch, customDropdownConfigs }}
        />

        <div className='briefs-section !overflow-hidden'>
          <div className='briefs-heading'>
            <div className='flex justify-between lg:flex-row flex-col items-start lg:py-[3rem]'>
              <div>
                <div className='flex items-center'>
                  <input
                    autoComplete='off'
                    id='search-input'
                    className='search-input px-[12px] !w-full  lg:!w-[20rem] !h-[2.875rem] !rounded-tr-[0px] !rounded-br-[0px]'
                    placeholder='Search'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <div
                    role='button'
                    onClick={() => !savedBriefsActive && onSearch()}
                    className='h-[2.975rem] w-[3.0625rem] rounded-tr-[8px] rounded-br-[8px] bg-imbue-purple flex justify-center items-center cursor-pointer'
                  >
                    <Image src={searchSvg} alt='Search' role='button' />
                  </div>
                </div>

                <p className='text-[1rem] text-imbue-purple-dark mt-[0.75rem]'>
                  {savedBriefsActive ? briefsData.length : briefs_total} brief
                  {(
                    savedBriefsActive
                      ? briefsData.length === 1
                      : briefs_total === 1
                  )
                    ? ''
                    : 's'}{' '}
                  found
                </p>
              </div>

              <div className='flex items-center mt-[2rem] lg:mt-0 gap-4'>
                {(selectedFilterIds?.length > 0 || searchInput.length > 0) && (
                  <button
                    onClick={reset}
                    className='h-[43px] px-[20px] rounded-[10px] bg-imbue-purple flex items-center cursor-pointer hover:scale-105 lg:ml-[44px]'
                  >
                    Reset
                  </button>
                )}
                {savedBriefsActive && (
                  <button
                    onClick={reset}
                    className='h-[43px] px-[20px] rounded-[10px] border bg-white border-imbue-purple text-imbue-purple-dark flex items-center cursor-pointer hover:scale-105 lg:ml-[44px]'
                  >
                    Back to Briefs
                  </button>
                )}

                <button
                  onClick={() => {
                    onSavedBriefs();
                  }}
                  className='h-[43px] px-[20px] lg:mr-12 rounded-[10px] bg-imbue-purple flex items-center cursor-pointer hover:scale-105'
                >
                  Saved Briefs
                  <Image
                    src={savedIcon}
                    alt={'filter-icon'}
                    className='h-[20px] w-[20px] ml-2'
                  />
                </button>

                {!savedBriefsActive && (
                  <div
                    className='flex items-center cursor-pointer'
                    onClick={toggleFilter}
                    role='button'
                  >
                    <p className='mr-[0.25rem] text-imbue-purple-dark text-[1rem]'>
                      Filter
                    </p>
                    <Image src={filterSvg} alt='Filter Icon' />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='briefs-list !overflow-hidden z-10'>
            {briefsData?.map(
              (item, itemIndex) => (
                <div key={itemIndex} className='relative z-0'>
                  {savedBriefsActive && (
                    <button
                      className='absolute top-5 z-[1000] right-5 h-[30px] w-[30px] border border-red-500 rounded-full flex justify-center items-center bg-red-500'
                      onClick={() => {
                        deleteBrief(item?.id);
                      }}
                    >
                      <IoTrashBin color='#fff' />
                    </button>
                  )}

                  <div
                    className='brief-item relative z-20'
                    onClick={() =>
                      router.push(`/briefs/${item?.id}`)
                    }
                  >
                    <div className='brief-title'>
                      {item.headline.length > 50
                        ? `${item.headline.substring(0, 50)}...`
                        : item.headline}
                    </div>
                    <div className='brief-time-info'>
                      {`${item.experience_level}, ${item.duration}, Posted by ${item.created_by}`}
                    </div>
                    <div className='brief-description lg:w-10/12'>
                      {item.description.length > 500
                        ? `${item.description.substring(0, 500)}...`
                        : item.description}
                    </div>

                    <div className='brief-tags !flex-wrap'>
                      {item.skills.map((skill: any, skillIndex: any) => (
                        <div className='tag-item' key={skillIndex}>
                          {skill.name}
                        </div>
                      ))}
                    </div>

                    <div className='flex justify-between lg:flex-row flex-col lg:w-[400px] lg:items-center'>
                      <div className='brief-proposals'>
                        <span className='proposals-heading'>
                          Proposals Submitted:{' '}
                        </span>
                        <span className='proposals-count'>
                          Less than {item.number_of_briefs_submitted}
                        </span>
                      </div>

                      <div className='leading-none text-black mt-3 lg:mt-0'>
                        {timeAgo.format(new Date(item?.created))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <ErrorScreen {...{ error, setError }}>
          <div className='flex flex-col gap-4 w-1/2'>
            <button
              onClick={() => setError(null)}
              className='primary-btn in-dark w-button w-full !m-0'
            >
              Try Again
            </button>
            <button
              onClick={() => router.push(`/dashboard`)}
              className='underline text-xs lg:text-base font-bold'
            >
              Go to Dashboard
            </button>
          </div>
        </ErrorScreen>
        <BackDropLoader open={loading} />
      </div>
      <div className='mt-[0.5rem] mb-[0.5rem] bg-white rounded-[0.5rem] w-full p-[1rem] flex  justify-between  max-width-868px:w-[90%] self-center'>
        <div className='flex items-center'>
          <button
            onClick={() => previousPage()}
            className='py-[0.5rem] px-[1rem] border border-imbue-purple-dark rounded-[0.5rem] bg-transparent text-[0.7rem] lg:text-[1rem] font-normal text-imbue-foundation-blue flex items-center'
          >
            <Image src={chevLeftIcon} alt='chev left' />
            Previous
          </button>

          <div className='mx-[1.62rem] text-[#5E5E5E] text-[0.7rem] lg:text-[1rem] font-normal'>
            {currentPage} of {Math.ceil(briefs_total / itemsPerPage)}
          </div>

          <button
            onClick={() => nextPage()}
            className='py-[0.5rem] px-[1rem] border border-imbue-purple-dark rounded-[0.5rem] bg-transparent text-[0.7rem] lg:text-[1rem] font-normal text-imbue-foundation-blue flex items-center'
          >
            Next
            <Image src={chevRightIcon} alt='chev right' />
          </button>
        </div>

        <div className='flex items-center'>
          <p className=' text-imbue-purple mr-[10px]'>Items per page:</p>
          <div className='network-amount'>
            <select
              name='currencyId'
              onChange={(e) => {
                router.query.size = (e.target.value).toString()
                router.push(router, undefined, { shallow: true });
                setItemsPerPage(Number(e.target.value));
              }}
              value={itemsPerPage}
              placeholder='Select a currency'
              className='bg-white outline-none round border border-imbue-purple rounded-[0.5rem] text-base px-5 h-[2.75rem] text-imbue-purple-dark'
              required
            >
              {[...pageItems].map((item: any) => (
                <option value={item} key={item} className='duration-option'>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Briefs;
