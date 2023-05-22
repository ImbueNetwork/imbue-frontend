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

const Freelancers = (): JSX.Element => {
  const [freelancers, setFreelancers] = useState<
    Freelancer[] | undefined | any
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const [skills, setSkills] = useState<Item[]>();
  const [services, setServices] = useState<Item[]>();
  const [languages, setLanguages] = useState<Item[]>();
  const [filterVisble, setFilterVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const size = useWindowSize();

  const { skillsRangeProps, servicesRangeProps, languagesRangeProps, heading } =
    router.query;

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
      const data: Freelancer[] = await getAllFreelancers();

      let combinedSkills = Array.prototype.concat.apply(
        [],
        data.map((x) => x.skills)
      ) as Item[];
      const dedupedSkills = await dedupeArray(combinedSkills);

      var combinedServices = Array.prototype.concat.apply(
        [],
        data.map((x) => x.services)
      ) as Item[];
      const dedupedServices = await dedupeArray(combinedServices);

      var combinedLanguages = Array.prototype.concat.apply(
        [],
        data.map((x) => x.languages)
      ) as Item[];
      const dedupedLanguages = await dedupeArray(combinedLanguages);

      setSkills(dedupedSkills);
      setServices(dedupedServices);
      setLanguages(dedupedLanguages);
      setFreelancers(data);
      setLoading(false);
    };

    setFilters();
  }, []);

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
          range.forEach((v: any) => {
            const checkbox = document.getElementById(
              `0-${v}`
            ) as HTMLInputElement;
            if (checkbox) checkbox.checked = true;
          });
          filter = { ...filter, skills_range: strToIntRange(skillsRangeProps) };
        }

        if (servicesRangeProps) {
          const range = strToIntRange(servicesRangeProps);
          range.forEach((v: any) => {
            const checkbox = document.getElementById(
              `1-${v}`
            ) as HTMLInputElement;
            if (checkbox) checkbox.checked = true;
          });
          filter = {
            ...filter,
            services_range: strToIntRange(servicesRangeProps),
          };
        }

        if (languagesRangeProps) {
          const range = strToIntRange(languagesRangeProps);
          range.forEach((v: any) => {
            const checkbox = document.getElementById(
              `2-${v}`
            ) as HTMLInputElement;
            if (checkbox) checkbox.checked = true;
          });
          filter = {
            ...filter,
            services_range: strToIntRange(languagesRangeProps),
          };
        }

        const filteredFreelancers = await callSearchFreelancers(filter);
        setFreelancers(filteredFreelancers);
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
    const elements = document.getElementsByClassName(
      "filtercheckbox"
    ) as HTMLCollectionOf<HTMLInputElement>;

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

    for (let i = 0; i < elements.length; i++) {
      if (elements[i].checked) {
        is_search = true;
        const id = elements[i].getAttribute("id");
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
      };

      const filteredFreelancers = await callSearchFreelancers(filter);
      setFreelancers(filteredFreelancers);
    } else {
      const allFreelancers = await getAllFreelancers();
      setFreelancers(allFreelancers);
    }
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisble);
  };

  const paginatedFreelancers = (): FreelancerStepProps => {
    const freelancersPerPage = 3;
    const indexOfLastFreelancer = currentPage * freelancersPerPage;
    const indexOfFirstFreelancer = indexOfLastFreelancer - freelancersPerPage;
    const currentFreelancers = freelancers?.slice?.(
      indexOfFirstFreelancer,
      indexOfLastFreelancer
    );
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    return { currentFreelancers, paginate };
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

  if (loading) return <LoadingFreelancers />;

  return (
    <div className="px-[15px] lg:px-[40px]">
      <div className={`${styles.freelancersContainer} max-width-1100px:!m-0`}>
        <div
          className={`${styles.filterPanel}`}
          style={{
            display:
              size?.width <= 750 ? (filterVisble ? "block" : "none") : "block",
          }}
        >
          {/* <h1 className="mb-5">Freelancers</h1> */}
          <div className={styles.filterHeading}>Filter By</div>
          <FreelancerFilter
            label={skillsFilter.label}
            filter_type={FreelancerFilterOption.Skills}
            filter_options={skillsFilter.options}
          ></FreelancerFilter>
          <FreelancerFilter
            label={servicesFilter.label}
            filter_type={FreelancerFilterOption.Services}
            filter_options={servicesFilter.options}
          ></FreelancerFilter>
          <FreelancerFilter
            label={languagesFilter.label}
            filter_type={FreelancerFilterOption.Languages}
            filter_options={languagesFilter.options}
          ></FreelancerFilter>

          <div className="tab-section mb-10 min-width-500px:!hidden">
            <button
              onClick={() => {
                onSearch();
                toggleFilter();
              }}
              className="rounded-full text-black bg-white px-10 py-2"
            >
              Search
            </button>
            <button
              onClick={() => {
                setFilterVisible(false);
              }}
              className="rounded-full text-black bg-white px-10 py-2 ml-5"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className={`${styles.freelancersView} max-width-750px:!w-full`}>
          <div className={`${styles.searchHeading} max-width-750px:!mx-0`}>
            <div className={`${styles.tabSection} w-full justify-between`}>
              <div className={styles.tabItem} onClick={onSearch}>
                Search
              </div>

              <div
                className={`tab-item text-right min-width-750px:hidden`}
                onClick={toggleFilter}
              >
                <FiFilter color="#fff" />
              </div>
            </div>
            <input
              id="search-input"
              className={`search-input`}
              placeholder="Search"
            />
            <div className="search-result">
              <span className="result-count">{freelancers?.length}</span>
              <span> freelancers found</span>
            </div>
          </div>
          <div className={`${styles.freelancers} max-width-750px:!px-0`}>
            {freelancers?.length &&
              paginatedFreelancers?.()
                ?.currentFreelancers?.slice?.(0, 10)
                ?.map?.(
                  (
                    { title, username, display_name, skills, profile_image },
                    index
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
                          {skills?.slice(0, 3).map((skill, index) => (
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
            pageSize={3}
            total={freelancers.length}
            onChange={(page: number, pageSize: number) =>
              paginatedFreelancers()?.paginate(page)
            }
            className="flex flex-row items-center my-10 px-10"
            itemRender={(page, type, originalElement) => {
              if (type === "page") {
                return <PageItem page={page} />;
              }
              return originalElement;
            }}
            prevIcon={
              <div className="h-[32px] hover:bg-[--theme-primary] hover:text-black mr-6 cursor-pointer rounded-[4px] border border-primary w-[32px] pt-1 items-center text-center text-sm !font-bold text-primary">
                {"<"}
              </div>
            }
            nextIcon={
              <div className="h-[32px] hover:bg-[--theme-primary]  hover:text-black mr-6  cursor-pointer rounded-[4px] border border-primary w-[32px] pt-1 items-center text-center text-sm !font-bold text-primary">
                {">"}
              </div>
            }
            jumpNextIcon={
              <div className="h-[32px] hover:bg-[--theme-primary]  hover:text-black mr-6  rounded-[4px] border border-primary w-[32px] pt-1 items-center text-center text-sm !font-bold text-primary ">
                {">>"}
              </div>
            }
            jumpPrevIcon={
              <div className="h-[32px] hover:bg-[--theme-primary]  hover:text-black  mr-6  rounded-[4px] border border-primary w-[32px] pt-1 items-center text-center text-sm !font-bold text-primary">
                {"<<"}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Freelancers;
