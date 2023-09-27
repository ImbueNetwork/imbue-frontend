/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import Grid from '@mui/material/Grid';
const TextField = dynamic(() => import("@mui/material/TextField"), {
  ssr: false,
})
const OutlinedInput = dynamic(() => import("@mui/material/OutlinedInput"), {
  ssr: false,
})
const InputAdornment = dynamic(() => import("@mui/material/InputAdornment"), {
  ssr: false,
})
const IconButton = dynamic(() => import("@mui/material/IconButton"), {
  ssr: false,
})
// import ClearIcon from '@mui/icons-material/Clear';
const ClearIcon = dynamic(() => import("@mui/icons-material/Clear"), {
  ssr: false,
})
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { strToIntRange } from '@/utils/helper';

import ErrorScreen from '@/components/ErrorScreen';
import FilterModal from '@/components/Filter/FilterModal';

import {
  chevLeftIcon,
  chevRightIcon,
  filterSvg,
  searchSvg,
} from '@/assets/svgs';
import styles from '@/styles/modules/freelancers.module.css';

import LoadingFreelancers from '../../components/Freelancers/FreelancersLoading';
import {
  Freelancer,
  FreelancerResponse,
  FreelancerSqlFilter,
  Item,
} from '../../model';
import {
  callSearchFreelancers,
  getAllFreelancers,
  getFreelancerFilters,
} from '../../redux/services/freelancerService';
import { FreelancerFilterOption } from '../../types/freelancerTypes';



const Freelancers = (): JSX.Element => {
  const [freelancers, setFreelancers] = useState<
    Freelancer[] | undefined | any
  >();
  const [freelancers_total, setFreelancersTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [skills, setSkills] = useState<Item[]>();
  const [services, setServices] = useState<Item[]>([{ id: 0, name: "" }]);
  const [languages, setLanguages] = useState<Item[]>();
  const [filterVisble, setFilterVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [searchInput, setSearchInput] = useState<string>("")
  const [pageInput, setPageInput] = useState<number>(1);

  const [selectedFilterIds, setSlectedFilterIds] = useState<Array<string>>([]);
  const [error, setError] = useState<any>()
  const router = useRouter();

  const {
    skillsRangeProps,
    servicesRangeProps,
    languagesRangeProps,
    freelancerInfoProps,
    name,
    page: pageProp,
    size: sizeProp
  } = router.query;

  const { pathname } = router;

  const redirectToProfile = (username: any) => {
    router.push(`/freelancers/${username}/`);
  };

  // const dedupeArray = async (input: any[]) => {
  //   if (input[0]) {
  //     return input
  //       .filter((thing: any, i: any, arr: any) => {
  //         return arr.indexOf(arr.find((t: any) => t?.id === thing?.id)) === i;
  //       })
  //       .sort(function (a: any, b: any) {
  //         return a.name.localeCompare(b.name);
  //       });
  //   }
  // };

  useEffect(() => {
    const setFilters = async () => {
      setLoading(true);
      try {
        const data: FreelancerResponse = await getAllFreelancers(
          itemsPerPage,
          currentPage
        );
        // const combinedSkills = Array.prototype.concat.apply(
        //   [],
        //   data?.currentData?.map((x: any) => x.skills)
        // ) as Item[];

        // const dedupedSkills =
        //   combinedSkills.length > 0 ? await dedupeArray(combinedSkills) : [];
        // const combinedServices = Array.prototype.concat.apply(
        //   [],
        //   data?.currentData?.map((x: any) => x.services)
        // ) as Item[];
        // const dedupedServices = combinedServices
        //   ? await dedupeArray(combinedServices)
        //   : [];
        // const combinedLanguages = Array.prototype.concat.apply(
        //   [],
        //   data?.currentData?.map((x: any) => x.languages)
        // ) as Item[];
        // const dedupedLanguages = combinedLanguages
        //   ? await dedupeArray(combinedLanguages)
        //   : [];
        // setSkills(dedupedSkills);
        // setServices(dedupedServices);
        // setLanguages(dedupedLanguages);
        setFreelancers(data?.currentData);
        setFreelancersTotal(data?.totalFreelancers);
      } catch (error) {
        console.log(error);
      }
      finally {
        setLoading(false)
      }
    };

    !Object.keys(router?.query).length && router.isReady && setFilters();
  }, [currentPage, itemsPerPage, router.isReady]);

  useEffect(() => {
    const getAllFilters = async () => {
      const filteredItems = await getFreelancerFilters()
      setSkills(filteredItems.skills);
      setServices(filteredItems.services);
      setLanguages(filteredItems.languages);
    }

    getAllFilters()
  }, [])

  const skillsFilter = {
    filterType: FreelancerFilterOption.Skills,
    label: 'Skills',
    options: skills?.map(({ id, name }) => ({
      interiorIndex: id,
      value: name,
    })),
  };

  const servicesFilter = {
    filterType: FreelancerFilterOption.Services,
    label: 'Services',
    options: services?.map(({ id, name }) => ({
      interiorIndex: id,
      value: name,
    })),
  };

  const languagesFilter = {
    filterType: FreelancerFilterOption.Languages,
    label: 'Languages',
    options: languages?.map(({ id, name }) => ({
      interiorIndex: id,
      value: name,
    })),
  };

  const freelancerInfoFilter = {
    filterType: FreelancerFilterOption.FreelancerInfo,
    label: 'Freelancer Info',
    options: [
      {
        interiorIndex: 0,
        value: 'Verified',
      },
    ],
  };

  const handleSetId = (id: string | string[]) => {
    if (Array.isArray(id)) {
      setSlectedFilterIds([...id]);
    } else {
      setSlectedFilterIds([...selectedFilterIds, id]);
    }
  };

  const customDropdownConfigs = [
    skillsFilter,
    servicesFilter,
    languagesFilter,
    freelancerInfoFilter,
  ];

  const pageItems = [12, 18, 24, 30];

  useEffect(() => {
    const fetchAndSetFreelancers = async () => {
      if (Object.keys(router?.query).length) {
        setLoading(true)
        let filter: FreelancerSqlFilter = {
          skills_range: [],
          services_range: [],
          languages_range: [],
          name: '',
          page: currentPage,
          items_per_page: itemsPerPage
        };


        if (sizeProp) {
          filter = { ...filter, items_per_page: Number(sizeProp) || 12 };
          setItemsPerPage(Number(sizeProp))
        }

        if (Number(pageProp)) {
          filter = { ...filter, page: Number(pageProp) || 1 };
        }

        if (name) {
          filter = { ...filter, name: name };
          // const input = document.getElementById(
          //   'search-input'
          // ) as HTMLInputElement;
          // if (input) input.value = name.toString();
          setSearchInput(name.toString())
        }

        if (skillsRangeProps) {
          const range = strToIntRange(skillsRangeProps);
          range?.forEach?.((v: any) => {
            if (!selectedFilterIds.includes(`0-${v}`))
              setSlectedFilterIds([...selectedFilterIds, `0-${v}`]);
          });
          filter = { ...filter, skills_range: range };
        }

        if (servicesRangeProps) {
          const range = strToIntRange(servicesRangeProps);

          range?.forEach?.((v: any) => {
            if (!selectedFilterIds.includes(`1-${v}`))
              setSlectedFilterIds([...selectedFilterIds, `1-${v}`]);
          });
          filter = {
            ...filter,
            services_range: range,
          };
        }

        if (languagesRangeProps) {
          const range = strToIntRange(languagesRangeProps);
          range?.forEach?.((v: any) => {
            if (!selectedFilterIds.includes(`2-${v}`))
              setSlectedFilterIds([...selectedFilterIds, `2-${v}`]);
          });
          filter = {
            ...filter,
            languages_range: strToIntRange(languagesRangeProps),
          };
        }

        if (freelancerInfoProps) {
          const data = JSON.parse(freelancerInfoProps as string);
          const { verified } = data;
          if (verified) {
            filter = { ...filter, verified: true };
            setSlectedFilterIds([...selectedFilterIds, '3-0']); // FIXME:
          }
        }
        try {
          const { currentData, totalFreelancers } = await callSearchFreelancers(
            filter
          );

          const totalPages = Math.ceil(totalFreelancers / (filter?.items_per_page || 12))

          if (totalPages < filter.page && totalPages > 0) {
            router.query.page = totalPages.toString()
            router.push(router, undefined, { shallow: true })
            filter.page = totalPages
          }

          setCurrentPage(filter.page)
          setPageInput(filter.page)
          setFreelancers(currentData);
          setFreelancersTotal(totalFreelancers);
        } catch (error) {
          setError({ message: "Could not get the results. Please try again" })
        } finally {
          setLoading(false)
        }
      }
    };

    router.isReady && fetchAndSetFreelancers();
  }, [router.isReady, currentPage, itemsPerPage]);


  const onSearch = async () => {
    // The filter initially should return all values
    setLoading(true);
    let is_search = false;

    let skillsRange: number[] = [];
    let servicesRange: number[] = [];
    let languagesRange: number[] = [];
    const freelancerInfo: any = {};

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
          const index = parseInt(interiorIndex);
          switch (parseInt(filterType) as FreelancerFilterOption) {
            case FreelancerFilterOption.Skills:
              skillsRange = [...skillsRange, index];
              break;
            case FreelancerFilterOption.Services:
              servicesRange = [...servicesRange, index];
              break;
            case FreelancerFilterOption.Languages:
              languagesRange = [...languagesRange, index];
              break;
            case FreelancerFilterOption.FreelancerInfo:
              if (index === 0) freelancerInfo.verified = true;
              break;
            default:
              console.log(
                'Invalid filter option selected or unimplemented. type:' +
                filterType
              );
          }
        }
      }
    }

    router.query.page = '1';
    router.query.name = search_value !== '' ? search_value : [];
    router.query.skillsRangeProps = skillsRange.length
      ? skillsRange.toString()
      : [];
    router.query.servicesRangeProps = servicesRange.length
      ? servicesRange.toString()
      : [];
    router.query.languagesRangeProps = languagesRange.length
      ? languagesRange.toString()
      : [];
    if (Object.keys(freelancerInfo).length)
      router.query.freelancerInfoProps = JSON.stringify(freelancerInfo);
    else {
      delete router.query.freelancerInfoProps;
    }
    router.push(router, undefined, { shallow: true });

    try {
      if (is_search) {
        const filter: FreelancerSqlFilter = {
          skills_range: skillsRange,
          services_range: servicesRange,
          languages_range: languagesRange,
          name: search_value,
          items_per_page: itemsPerPage,
          page: 1,
          verified: freelancerInfo.verified,
        };
        if (search_value.length === 0) {
          setFilterVisible(!filterVisble);
        }
        const filteredFreelancers: any = await callSearchFreelancers(filter);
        setFreelancers(filteredFreelancers?.currentData);
        setFreelancersTotal(filteredFreelancers?.totalFreelancers);
      } else {
        const allFreelancers: any = await getAllFreelancers(
          itemsPerPage,
          currentPage
        );
        setFreelancers(allFreelancers?.currentData);
        setFreelancersTotal(allFreelancers?.totalFreelancers);
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisble);
  };

  const reset = async () => {
    await router.push({
      pathname,
      query: {},
    });
    const allFreelancers: any = await getAllFreelancers(
      itemsPerPage,
      currentPage
    );
    setSlectedFilterIds([]);
    setFreelancers(allFreelancers?.currentData);
    setFreelancersTotal(allFreelancers?.totalFreelancers);
  };

  const cancelFilters = async () => {
    reset();
    setFilterVisible(false);
  };

  const setPageNumber = (e: any) => {
    const pageNumber = Number(e.target.value) || 1;
    const totalPages = Math.ceil(freelancers_total / itemsPerPage)

    if ((e.key === 'Enter' || e.key === 'Enter') && (pageNumber <= totalPages) && (pageNumber > 0)) {
      setCurrentPage(pageNumber);
      setPageInput(pageNumber);
      router.query.page = pageNumber.toString()
      router.push(router, undefined, { shallow: true });
    }
  }

  if (loading) return <LoadingFreelancers />;
  console.log(freelancers)
  return (
    <div>
      <div className={`${styles.freelancersContainer} max-width-1100px:!m-0`}>
        <FilterModal open={filterVisble} handleClose={() => toggleFilter()}
          {
          ...{ selectedFilterIds, handleSetId, cancelFilters, customDropdownConfigs, onSearch }
          }
        />
        <div
          className={`${styles.freelancersView} max-width-750px:!w-full max-width-750px:px-5`}
        >
          <div className='bg-white py-[1.5rem] px-6 lg:px-[3.88rem] rounded-[1.25rem]'>
            <div className='flex justify-between lg:flex-row flex-col items-start'>
              <div>
                <div className='flex items-center'>
                  {/* <input
                    value={searhInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    id='search-input'
                    className='search-input px-[12px] !w-full lg:!w-[20rem] !h-[2.875rem] !rounded-tr-[0px] !rounded-br-[0px] !text-black'
                    placeholder='Search'
                    autoComplete='off'
                  /> */}
                  <OutlinedInput
                    autoComplete='off'
                    color='secondary'
                    id='search-input'
                    notched={false}
                    className='!w-full lg:!w-[20rem] !h-[2.875rem] rounded-lg !rounded-tr-[0px] !rounded-br-[0px]'
                    placeholder='Search'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyUp={e => e.key === 'Enter' && onSearch()}
                    endAdornment={
                      searchInput?.length
                        ? (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => searchInput?.length && setSearchInput("")}
                              onMouseDown={e => e.preventDefault()}
                              edge="end"
                            >
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>)
                        : ""
                    }
                  />
                  <div
                    role='button'
                    onClick={onSearch}
                    className='h-[2.9rem] w-[3.0625rem] rounded-tr-[8px] rounded-br-[8px] bg-imbue-purple flex justify-center items-center cursor-pointer'
                  >
                    <Image src={searchSvg} alt='Search' role='button' />
                  </div>
                </div>

                <p className='!text-[1rem] !text-imbue-purple-dark !mt-[0.75rem]'>
                  {Number(freelancers_total) === 0 ? 'No' : freelancers_total}{' '}
                  freelancer
                  {Number(freelancers_total) === 1 ? '' : 's'} found
                </p>
              </div>

              <div className='flex items-center mt-[2rem] lg:mt-0'>
                {selectedFilterIds?.length > 0 && (
                  <button
                    onClick={reset}
                    className='h-[43px] mr-4 px-[20px] rounded-[10px] bg-imbue-purple flex items-center cursor-pointer hover:scale-105 ml-[44px]'
                  >
                    Reset
                  </button>
                )}

                <div
                  className='flex items-center cursor-pointer'
                  onClick={toggleFilter}
                  role='button'
                >
                  <p className='!mr-[0.25rem] !text-imbue-purple-dark text-[1rem]'>
                    Filter
                  </p>
                  <Image src={filterSvg} alt='Filter Icon' />
                </div>
              </div>
            </div>
          </div>

          <Grid container spacing={4} sx={{ marginTop: '0.75rem' }}>
            {freelancers?.length &&
              freelancers
                ?.map?.(
                  (
                    {
                      about,
                      username,
                      display_name,
                      skills,
                      profile_image,
                      verified,
                    }: Freelancer,
                    index: number
                  ) => (
                    <Grid item xs={12} sm={12} md={3} key={index}>
                      <div
                        className={`${styles.freelancer} py-[0.94rem] h-full`}
                      >
                        <div className='flex items-center justify-center'>
                          <Image
                            src={
                              profile_image ??
                              require('@/assets/images/profile-image.png')
                            }
                            className={`${styles.freelancerProfilePic} object-cover h-[100px] w-[100px] rounded-full`}
                            height={100}
                            width={100}
                            alt=''
                          />
                        </div>
                        <div className={`${styles.freelancerInfo} mt-[0.5rem]`}>
                          <div className='px-[1.25rem]'>
                            <div className='flex items-center justify-center gap-2'>
                              <h3 className='text-xl font-medium text-content text-center'>
                                {display_name}
                              </h3>

                              {verified && (
                                <VerifiedRoundedIcon fontSize='small' htmlColor='#38e894' />
                              )}
                            </div>
                            <h5 className='text-xs lg:text-sm mt-2 text-imbue-purple-dark font-normal whitespace-pre-wrap break-all'>
                              {about?.length > 299
                                ? about.substring(0, 300) + '...'
                                : about}
                            </h5>
                          </div>
                          <div
                            className={`${styles.skills} ml-4 overflow-scroll mb-4 flex-wrap`}
                          >
                            {skills
                              ?.slice(0, 3)
                              .map((skill: any, index: number) => (
                                <p
                                  className={`${styles.skill} !text-[0.75rem] !text-imbue-purple-dark`}
                                  key={index}
                                >
                                  {skill.name}
                                </p>
                              ))}
                          </div>
                        </div>

                        <div className='px-[1.25rem] mt-auto'>
                          <button
                            className='w-full h-[2.6rem] border border-content rounded-[1.5rem] font-normal text-base text-content'
                            onClick={() => redirectToProfile(username)}
                          >
                            View Freelancer
                          </button>
                        </div>
                      </div>
                    </Grid>
                  )
                )}
          </Grid>

          <div className='mt-[0.5rem] mb-[0.5rem] bg-white rounded-[0.5rem] w-full p-[1rem] flex items-center justify-between  max-width-868px:w-[90%] self-center'>
            <div className='flex items-center'>
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    router.query.page = String(currentPage - 1)
                    router.push(router, undefined, { shallow: true })
                    setCurrentPage(currentPage - 1)
                    setPageInput(currentPage - 1)
                  }
                }}
                className='py-[0.5rem] px-[1rem] border border-imbue-purple-dark rounded-[0.5rem] bg-transparent text-[0.7rem] lg:text-[1rem] font-normal text-imbue-foundation-blue flex items-center'
              >
                <Image src={chevLeftIcon} alt='chev left' />
                Previous
              </button>

              <div className='mx-[1.62rem] text-[#5E5E5E] text-[0.7rem] lg:text-[1rem] font-normal flex items-center gap-3'>
                <TextField
                  id="standard-size-small"
                  className='!mb-0'
                  inputProps={{
                    className: "w-6 text-right px-1",
                    type: "number",
                    min: 1,
                    max: Math.ceil(freelancers_total / itemsPerPage)
                  }}
                  onChange={(e) => setPageInput(Number(e.target.value))}
                  onKeyDown={(e) => setPageNumber(e)}
                  value={pageInput}
                  variant="standard" />
                <span>
                  of
                </span>
                <span>
                  {Math.ceil(freelancers_total / itemsPerPage)}
                </span>
                {/* {currentPage} of {Math.ceil(freelancers_total / itemsPerPage)} */}
              </div>

              <button
                onClick={() => {
                  if (freelancers_total > currentPage * itemsPerPage) {
                    setCurrentPage(currentPage + 1);
                    setPageInput(currentPage + 1);
                    router.query.page = String(currentPage + 1)
                    router.push(router, undefined, { shallow: true })
                  }
                }}
                className='py-[0.5rem] px-[1rem] border border-imbue-purple-dark rounded-[0.5rem] bg-transparent text-[0.7rem] lg:text-[1rem] font-normal text-imbue-foundation-blue flex items-center'
              >
                Next
                <Image src={chevRightIcon} alt='chev right' />
              </button>
            </div>

            <div className='flex items-center'>
              <p className='!text-imbue-purple !mr-[10px]'>Items per page:</p>
              <div className='network-amount'>
                <select
                  name='currencyId'
                  onChange={(e) => {
                    router.query.size = String(e.target.value)
                    router.push(router, undefined, { shallow: true })
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
    </div>
  );
};

export default Freelancers;
