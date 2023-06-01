/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Freelancer, FreelancerSqlFilter, Item } from "../../model";
import styles from "@/styles/modules/freelancers.module.css";
import {
  callSearchFreelancers,
  getAllFreelancers,
} from "../../redux/services/freelancerService";
import { FreelancerFilterOption } from "../../types/freelancerTypes";
import FreelancerFilter from "../../components/Freelancers/FreelancerFilter";
import Image from "next/image";
import { useRouter } from "next/router";
import { strToIntRange } from "../briefs";
import { useWindowSize } from "@/hooks";
import { FiFilter } from "react-icons/fi";
import LoadingFreelancers from "../../components/Freelancers/FreelancersLoading";
import { FreelancerStepProps } from "@/types/proposalsTypes";
import Pagination from "rc-pagination";
import CustomModal from "@/components/CustomModal";
import CustomDropDown from "@/components/CustomDropDown";
import { filterIcon } from "@/assets/svgs";

interface FilterModalProps {
  open: boolean;
  handleClose: () => void;
}

const Freelancers = (): JSX.Element => {
  const [freelancers, setFreelancers] = useState<
    Freelancer[] | undefined | any
  >();
  const [freelancers_total, setFreelancersTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [skills, setSkills] = useState<Item[]>();
  const [services, setServices] = useState<Item[]>();
  const [languages, setLanguages] = useState<Item[]>();
  const [filterVisble, setFilterVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsPerPage, setNumItemsPerPage] = useState<number>(5);

  const [selectedFilterIds, setSlectedFilterIds] = useState<Array<string>>([]);

  const router = useRouter();
  const size = useWindowSize();

  const { skillsRangeProps, servicesRangeProps, languagesRangeProps, heading } =
    router.query;

  const { pathname } = router;

  const redirectToProfile = (username: any) => {
    router.push(`/freelancers/${username}/`);
  };

  const dedupeArray = async (input: any) => {
    return input
      .filter((thing: any, i: any, arr: any) => {
        return arr.indexOf(arr.find((t: any) => t.id === thing.id)) === i;
      })
      .sort(function (a: any, b: any) {
        return a.name.localeCompare(b.name);
      });
  };

  useEffect(() => {
    const setFilters = async () => {
      setLoading(true);
      const data:
        | { currentData: Freelancer[]; totalFreelancers: number }
        | any = await getAllFreelancers(itemsPerPage, currentPage);
      setLoading(false);
      let combinedSkills = Array.prototype.concat.apply(
        [],
        data?.currentData?.map((x: any) => x.skills)
      ) as Item[];
      const dedupedSkills = await dedupeArray(combinedSkills);

      var combinedServices = Array.prototype.concat.apply(
        [],
        data?.currentData?.map((x: any) => x.services)
      ) as Item[];
      const dedupedServices = await dedupeArray(combinedServices);

      var combinedLanguages = Array.prototype.concat.apply(
        [],
        data?.currentData?.map((x: any) => x.languages)
      ) as Item[];
      const dedupedLanguages = await dedupeArray(combinedLanguages);

      setSkills(dedupedSkills);
      setServices(dedupedServices);
      setLanguages(dedupedLanguages);
      setFreelancers(data?.currentData);
      setFreelancersTotal(data?.totalFreelancers);
      setLoading(false);
    };

    setFilters();
  }, [currentPage, itemsPerPage]);

  const skillsFilter = {
    filterType: FreelancerFilterOption.Services,
    label: "Skills",
    options: skills?.map((item) => {
      let filter = {
        interiorIndex: item.id,
        value: item.name,
      };
      return filter;
    }),
  };

  const servicesFilter = {
    // This is a field associated with the User.
    // since its a range i need the
    filterType: FreelancerFilterOption.Services,
    label: "Services",
    options: services?.map((item) => {
      let filter = {
        interiorIndex: item.id,
        value: item.name,
      };
      return filter;
    }),
  };

  const languagesFilter = {
    // Should be a field in the database, WILL BE IN DAYS.
    // Again i need the high and low values.
    filterType: FreelancerFilterOption.Languages,
    label: "Languages",
    options: languages?.map((item) => {
      let filter = {
        interiorIndex: item.id,
        value: item.name,
      };
      return filter;
    }),
  };

  const handleSetId = (id: string | string[]) => {
    if (Array.isArray(id)) {
      setSlectedFilterIds([...id]);
    } else {
      setSlectedFilterIds([...selectedFilterIds, id]);
    }
  };

  const customDropdownConfigs = [
    {
      name: skillsFilter.label,
      filterType: FreelancerFilterOption.Skills,
      filterOptions: skillsFilter.options,
    },
    {
      name: servicesFilter.label,
      filterType: FreelancerFilterOption.Services,
      filterOptions: servicesFilter.options,
    },
    {
      name: languagesFilter.label,
      filterType: FreelancerFilterOption.Languages,
      filterOptions: languagesFilter.options,
    },
  ];

  const pageinationIconClassName =
    "h-[32px] hover:bg-[--theme-primary] hover:text-black mr-6 cursor-pointer rounded-[4px] border border-primary w-[32px] pt-1 items-center text-center text-sm !font-bold text-primary";

  useEffect(() => {
    const fetchAndSetBriefs = async () => {
      if (Object.keys(router?.query).length) {
        let filter: FreelancerSqlFilter = {
          skills_range: [],
          services_range: [],
          languages_range: [],
          search_input: "",
        };

        if (heading) {
          filter = { ...filter, search_input: heading };
          const input = document.getElementById(
            "search-input"
          ) as HTMLInputElement;
          if (input) input.value = heading.toString();
        }

        if (skillsRangeProps) {
          const range = strToIntRange(skillsRangeProps);
          range?.forEach?.((v: any) => {
            setSlectedFilterIds([...selectedFilterIds, `0-${v}`]);
          });
          filter = { ...filter, skills_range: strToIntRange(skillsRangeProps) };
        }

        if (servicesRangeProps) {
          const range = strToIntRange(servicesRangeProps);

          range?.forEach?.((v: any) => {
            setSlectedFilterIds([...selectedFilterIds, `1-${v}`]);
          });
          filter = {
            ...filter,
            services_range: strToIntRange(servicesRangeProps),
          };
        }

        if (languagesRangeProps) {
          const range = strToIntRange(languagesRangeProps);
          range?.forEach?.((v: any) => {
            setSlectedFilterIds([...selectedFilterIds, `2-${v}`]);
          });
          filter = {
            ...filter,
            services_range: strToIntRange(languagesRangeProps),
          };
        }

        const filteredFreelancers: any = await callSearchFreelancers(filter);
        setFreelancers(filteredFreelancers?.currentData);
      }
    };

    router.isReady && fetchAndSetBriefs();
  }, [
    router,
    skills,
    services,
    languages,
    skillsRangeProps,
    heading,
    languagesRangeProps,
    servicesRangeProps,
  ]);

  const onSearch = async () => {
    setFilterVisible(!filterVisble);
    // The filter initially should return all values
    let is_search: boolean = false;

    let skillsRange: number[] = [];
    let servicesRange: number[] = [];
    let languagesRange: number[] = [];

    let search_input = document.getElementById(
      "search-input"
    ) as HTMLInputElement;
    let search_value = search_input.value;
    if (search_value !== "") {
      is_search = true;
    }

    for (let i = 0; i < selectedFilterIds.length; i++) {
      if (selectedFilterIds[i] !== "") {
        is_search = true;
        const id = selectedFilterIds[i];
        if (id != null) {
          const [filterType, interiorIndex] = id.split("-");
          // Here we are trying to build teh paramaters required to build the query
          // We build an array for each to get the values we want through concat.
          // and also specify if we want more than using the is_max field.
          switch (parseInt(filterType) as FreelancerFilterOption) {
            case FreelancerFilterOption.Skills:
              skillsRange = [...skillsRange, parseInt(interiorIndex)];
              break;
            case FreelancerFilterOption.Services:
              servicesRange = [...servicesRange, parseInt(interiorIndex)];
              break;
            case FreelancerFilterOption.Languages:
              languagesRange = [...languagesRange, parseInt(interiorIndex)];
              break;
            default:
              console.log(
                "Invalid filter option selected or unimplemented. type:" +
                  filterType
              );
          }
        }
      }
    }

    router.query.heading = search_value !== "" ? search_value : [];
    router.query.skillsRangeProps = skillsRange.length
      ? skillsRange.toString()
      : [];
    router.query.servicesRangeProps = servicesRange.length
      ? servicesRange.toString()
      : [];
    router.query.languagesRangeProps = languagesRange.length
      ? languagesRange.toString()
      : [];
    router.push(router, undefined, { shallow: true });

    if (is_search) {
      const filter: FreelancerSqlFilter = {
        skills_range: skillsRange,
        services_range: servicesRange,
        languages_range: languagesRange,
        search_input: search_value,
        items_per_page: itemsPerPage,
        page: currentPage,
      };
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
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisble);
  };

  const PageItem = (props: any) => {
    return (
      <div
        className={`h-[32px] rounded-[4px] hover:bg-[--theme-primary] hover:text-black border border-primary w-[32px] cursor-pointer pt-1 items-center text-center text-sm !font-bold mr-6 ${
          currentPage === parseInt(props.page) ? "text-black" : "text-white"
        }
        ${
          currentPage === parseInt(props.page)
            ? "bg-[--theme-primary]"
            : "bg-transparent"
        }
        `}
      >
        {props.page}
      </div>
    );
  };

  const dropDownValues = [5, 10, 20, 50];

  const FilterModal = ({ open, handleClose }: FilterModalProps) => {
    return (
      <CustomModal
        open={open}
        onClose={handleClose}
        className="flex justify-center items-center flex-wrap bg-black bg-opacity-50 top-0 left-0 w-full h-full z-[100] fixed"
      >
        <div
          onClick={(e: any) => {
            e?.stopPropagation();
          }}
          className="bg-[#1B1B1B] rounded-2xl md:px-12 px-8 md:py-10 py-5 h-[434px] md:w-[60%] w-[95vw] self-center relative"
        >
          <p className="font-normal text-base text-white !mb-9">Filter</p>

          <div className="grid md:grid-cols-3 grid-cols-1 md:gap-10 gap-5">
            {customDropdownConfigs
              ?.filter(
                (item) => item?.filterOptions && item?.filterOptions?.length > 0
              )
              ?.map(({ name, filterType, filterOptions }) => (
                <CustomDropDown
                  key={name}
                  name={name}
                  filterType={filterType}
                  filterOptions={filterOptions}
                  setId={handleSetId}
                  ids={selectedFilterIds}
                />
              ))}
          </div>

          <button
            onClick={onSearch}
            className="h-[39px] px-[20px] text-center justify-center w-[121px] rounded-[25px] bg-imbue-purple flex items-center cursor-pointer hover:scale-105 absolute md:bottom-10 bottom-5 right-10"
          >
            Apply
          </button>
        </div>
      </CustomModal>
    );
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
    await setSlectedFilterIds([]);
    setFreelancers(allFreelancers?.currentData);
    setFreelancersTotal(allFreelancers?.totalFreelancers);
  };

  if (loading) return <LoadingFreelancers />;

  return (
    <div className="px-[15px] lg:px-[40px]">
      <div className={`${styles.freelancersContainer} max-width-1100px:!m-0`}>
        <FilterModal open={filterVisble} handleClose={() => toggleFilter()} />

        <div className={`${styles.freelancersView} max-width-750px:!w-full`}>
          <div className={`${styles.searchHeading} max-width-750px:!mx-0`}>
            <div className={`${styles.tabSection} w-full justify-between`}>
              <div className="tab-section">
                <button
                  onClick={toggleFilter}
                  className="h-[43px] px-[20px] rounded-[10px] bg-imbue-purple flex items-center cursor-pointer hover:scale-105"
                >
                  Filter
                  <Image
                    src={filterIcon}
                    alt={"filter-icon"}
                    className="h-[14px] w-[14px] ml-2"
                  />
                </button>

                {selectedFilterIds?.length > 0 && (
                  <button
                    onClick={reset}
                    className="h-[43px] px-[20px] rounded-[10px] bg-imbue-purple flex items-center cursor-pointer hover:scale-105 ml-[44px]"
                  >
                    Reset Filter X
                  </button>
                )}
              </div>
            </div>
            <input
              id="search-input"
              className={`search-input`}
              placeholder="Search"
            />
            <div className="search-result flex flex-col">
              <div>
                <span className="result-count">{freelancers_total}</span>
                <span> freelancers found</span>
              </div>

              <span className="max-width-500px:ml-8">
                number of freelancers per page
                <select
                  className="ml-4 border-white border bg-[#2c2c2c] h-8 px-4 rounded-md focus:border-none focus:outline-none focus:outline-white"
                  onChange={(e) => {
                    setNumItemsPerPage(parseInt(e.target.value));
                  }}
                  value={itemsPerPage}
                >
                  {dropDownValues.map((item, itemIndex) => (
                    <option key={itemIndex} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          </div>
          <div className={`${styles.freelancers} max-width-750px:!px-0`}>
            {freelancers?.length &&
              freelancers
                ?.slice?.(0, 10)
                ?.map?.(
                  (
                    {
                      title,
                      username,
                      display_name,
                      skills,
                      profile_image,
                    }: any,
                    index: number
                  ) => (
                    <div className={styles.freelancer} key={index}>
                      <div className={styles.freelancerImageContainer}>
                        <Image
                          src={
                            profile_image ??
                            require("@/assets/images/profile-image.png")
                          }
                          className={styles.freelancerProfilePic}
                          height={300}
                          width={300}
                          alt=""
                        />
                        <div className="dark-layer" />
                      </div>
                      <div className={styles.freelancerInfo}>
                        <h3>{display_name}</h3>
                        <h5>{title}</h5>
                        <div className={styles.skills}>
                          {skills
                            ?.slice(0, 3)
                            .map((skill: any, index: number) => (
                              <p className={styles.skill} key={index}>
                                {skill.name}
                              </p>
                            ))}
                        </div>
                      </div>
                      <button
                        className={`${styles.primaryButton} w-2/3`}
                        onClick={() => redirectToProfile(username)}
                      >
                        View
                      </button>
                    </div>
                  )
                )}
          </div>
          <Pagination
            pageSize={itemsPerPage}
            total={freelancers_total}
            onChange={(page: number, pageSize: number) => setCurrentPage(page)}
            className="flex flex-row items-center my-10 px-10"
            itemRender={(page, type, originalElement) => {
              if (type === "page") {
                return <PageItem page={page} />;
              }
              return originalElement;
            }}
            prevIcon={<div className={pageinationIconClassName}>{"<"}</div>}
            nextIcon={<div className={pageinationIconClassName}>{">"}</div>}
            jumpNextIcon={
              <div className={pageinationIconClassName}>{">>"}</div>
            }
            jumpPrevIcon={
              <div className={pageinationIconClassName}>{"<<"}</div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Freelancers;
