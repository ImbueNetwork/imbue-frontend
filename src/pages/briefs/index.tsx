import React, { useEffect, useState } from "react";
import BriefFilter from "@/components/BriefFilter";
import { Brief, BriefSqlFilter } from "@/model";
import { callSearchBriefs, getAllBriefs } from "@/redux/services/briefService";
import { BriefFilterOption, BriefStepProps } from "@/types/briefTypes";
import { useRouter } from "next/router";
import { FiFilter } from "react-icons/fi";
import { useWindowSize } from "@/hooks";
import Pagination from "rc-pagination";

export const strToIntRange = (strList: any) => {
  return Array.isArray(strList)
    ? strList[0].split(",").map((v: any) => Number(v))
    : strList?.split(",").map((v: any) => Number(v));
};

const Briefs = (): JSX.Element => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [briefs_total, setBriefsTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterVisble, setFilterVisible] = useState<boolean>(false);
  const router = useRouter();
  const size = useWindowSize();
  const [itemsPerPage, setNumItemsPerPage] = useState<number>(5);

  const {
    expRange,
    submitRange,
    submitted_is_max,
    lengthRange,
    length_is_max,
    hpw_max,
    hpw_is_max,
    heading,
  } = router?.query;

  // The thing with this implentation is that the interior order must stay totally ordered.
  // The interior index is used to specify which entry will be used in the search brief.
  // This is not a good implementation but im afraid if we filter and find itll be slow.
  // I can change this on request: felix

  const expfilter = {
    // This is a table named "experience"
    // If you change this you must remigrate the experience table and add the new field.
    filterType: BriefFilterOption.ExpLevel,
    label: "Experience Level",
    options: [
      {
        interiorIndex: 0,
        search_for: [1],
        value: "Entry Level",
        or_max: false,
      },
      {
        interiorIndex: 1,
        search_for: [2],
        value: "Intermediate",
        or_max: false,
      },
      {
        interiorIndex: 2,
        search_for: [3],
        value: "Expert",
        or_max: false,
      },
      {
        interiorIndex: 3,
        search_for: [4],
        value: "Specialist",
        or_max: false,
      },
    ],
  };

  const submittedFilters = {
    // This is a field associated with the User.
    // since its a range i need the
    filterType: BriefFilterOption.AmountSubmitted,
    label: "Briefs Submitted",
    options: [
      {
        interiorIndex: 0,
        search_for: [1, 2, 3, 4],
        value: "1-4",
        or_max: false,
      },
      {
        interiorIndex: 1,
        search_for: [5, 6, 7, 8, 9],
        value: "5-9",
        or_max: false,
      },
      {
        interiorIndex: 2,
        search_for: [10, 11, 12, 13, 14],
        value: "10-14",
        or_max: false,
      },
      {
        interiorIndex: 3,
        search_for: [15, 10000],
        value: "15+",
        or_max: true,
      },
    ],
  };

  const lengthFilters = {
    // Should be a field in the database, WILL BE IN DAYS.

    // Again i need the high and low values.
    filterType: BriefFilterOption.Length,
    label: "Project Length",
    options: [
      {
        interiorIndex: 0,
        search_for: [1],
        value: "1-3 months",
        or_max: false,
      },
      {
        interiorIndex: 1,
        search_for: [2],
        value: "3-6 months",
        or_max: false,
      },
      {
        interiorIndex: 2,
        search_for: [3],
        value: "6-12 months",
        or_max: false,
      },
      {
        interiorIndex: 3,
        search_for: [12],
        or_max: true,
        value: "1 year +",
      },
      {
        // years * months
        interiorIndex: 4,
        search_for: [12 * 5],
        or_max: true,
        value: "5 years +",
      },
    ],
  };

  const hoursPwFilter = {
    filterType: BriefFilterOption.HoursPerWeek,
    label: "Hours Per Week",
    options: [
      {
        interiorIndex: 0,
        // This will be 0-30 as we actually use this as max value
        search_for: [30],
        or_max: false,
        value: "30hrs/week",
      },
      {
        interiorIndex: 1,
        // Same goes for this
        search_for: [50],
        value: "50hrs/week",
        or_max: true,
      },
    ],
  };

  useEffect(() => {
    const fetchAndSetBriefs = async () => {
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
          search_input: "",
          items_per_page: itemsPerPage,
          page: currentPage,
        };

        if (expRange) {
          const range = strToIntRange(expRange);
          range.forEach((v: any) => {
            const checkbox = document.getElementById(
              `0-${v - 1}`
            ) as HTMLInputElement;
            if (checkbox) checkbox.checked = true;
          });
          filter = { ...filter, experience_range: strToIntRange(expRange) };
        }
        if (submitRange) {
          const range = strToIntRange(submitRange);
          range.forEach((v: any) => {
            if (v > 0 && v < 5)
              (document.getElementById(`1-${0}`) as HTMLInputElement).checked =
                true;
            if (v >= 5 && v < 10)
              (document.getElementById(`1-${1}`) as HTMLInputElement).checked =
                true;
            if (v >= 10 && v < 15)
              (document.getElementById(`1-${2}`) as HTMLInputElement).checked =
                true;
            if (v > 15)
              (document.getElementById(`1-${3}`) as HTMLInputElement).checked =
                true;
          });
          filter = { ...filter, submitted_range: strToIntRange(submitRange) };
        }
        if (heading) {
          filter = { ...filter, search_input: heading };
          const input = document.getElementById(
            "search-input"
          ) as HTMLInputElement;
          if (input) input.value = heading.toString();
        }
        if (lengthRange) {
          const range = strToIntRange(lengthRange);
          range.forEach((v: any) => {
            const checkbox = document.getElementById(
              `2-${v - 1}`
            ) as HTMLInputElement;
            if (checkbox) checkbox.checked = true;
          });
          filter = { ...filter, length_range: strToIntRange(lengthRange) };
        }
        const result: any = await callSearchBriefs(filter);
        setBriefs(result?.currentData);
        setBriefsTotal(result?.totalBriefs);
      }
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
    const elements = document.getElementsByClassName(
      "filtercheckbox"
    ) as HTMLCollectionOf<HTMLInputElement>;

    // The filter initially should return all values
    let is_search: boolean = false;

    let exp_range: number[] = [];
    let submitted_range: number[] = [];
    let submitted_is_max: boolean = false;
    let length_range: number[] = [];
    let length_is_max: boolean = false;
    let length_range_prop: number[] = [];

    // default is max
    let hpw_max: number = 50;
    let hpw_is_max: boolean = false;
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
          switch (parseInt(filterType) as BriefFilterOption) {
            case BriefFilterOption.ExpLevel:
              const o = expfilter.options[parseInt(interiorIndex)];
              exp_range = [...exp_range, ...o.search_for.slice()];
              break;

            case BriefFilterOption.AmountSubmitted:
              const o1 = submittedFilters.options[parseInt(interiorIndex)];
              submitted_range = [...submitted_range, ...o1.search_for.slice()];
              submitted_is_max = o1.or_max;
              break;

            case BriefFilterOption.Length:
              const o2 = lengthFilters.options[parseInt(interiorIndex)];
              length_range = [...length_range, ...o2.search_for.slice()];
              length_is_max = o2.or_max;

              if (o2.search_for[0] === 12)
                length_range_prop = [...length_range_prop, 4];
              else if (o2.search_for[0] === 60)
                length_range_prop = [...length_range_prop, 5];
              else length_range_prop = length_range;

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

    if (is_search) {
      const filter: BriefSqlFilter = {
        experience_range: exp_range,
        submitted_range,
        submitted_is_max,
        length_range,
        length_is_max,
        search_input: search_value,
        items_per_page: itemsPerPage,
        page: currentPage,
      };

      const briefs_filtered: any = await callSearchBriefs(filter);
      setBriefs(briefs_filtered?.currentData);
      setBriefsTotal(briefs_filtered?.totalBriefs);
    } else {
      const briefs_all: any = await getAllBriefs(itemsPerPage, currentPage);
      setBriefs(briefs_all?.currentData);
      setBriefsTotal(briefs_all?.totalBriefs);
    }
  };

  const onSavedBriefs = () => {};

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

  const arrayMultipleOfFiveWithin100 = () => {
    let arr = [];
    for (let i = 5; i <= 100; i += 5) {
      arr.push(i);
    }
    return arr;
  };

  const pageinationIconClassName =
    "h-[32px] hover:bg-[--theme-primary] hover:text-black mr-6 cursor-pointer rounded-[4px] border border-primary w-[32px] pt-1 items-center text-center text-sm !font-bold text-primary";

  return (
    <div className="search-briefs-container px-[15px] lg:px-[40px]">
      <div
        className={`filter-panel
      max-width-750px:fixed
      max-width-750px:w-full
      max-width-750px:top-0
      max-width-750px:bg-black
      max-width-750px:z-10
      max-width-750px:px-[20px]
      max-width-750px:pt-[20px]
      h-full
      max-width-750px:overflow-y-scroll
      `}
        style={{
          display:
            size?.width <= 750 ? (filterVisble ? "block" : "none") : "block",
        }}
      >
        <div className="filter-heading">Filter By</div>
        <BriefFilter
          label={expfilter.label}
          filter_type={BriefFilterOption.ExpLevel}
          filter_options={expfilter.options}
        ></BriefFilter>
        <BriefFilter
          label={submittedFilters.label}
          filter_type={BriefFilterOption.AmountSubmitted}
          filter_options={submittedFilters.options}
        ></BriefFilter>
        <BriefFilter
          label={lengthFilters.label}
          filter_type={BriefFilterOption.Length}
          filter_options={lengthFilters.options}
        ></BriefFilter>
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
      <div className="briefs-section  max-width-750px:overflow-hidden">
        <div className="briefs-heading">
          <div className="tab-section">
            <div className="tab-item" onClick={onSearch}>
              Search
            </div>
            <div className="tab-item" onClick={onSavedBriefs}>
              Saved Briefs
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
            className="search-input px-[12px]"
            placeholder="Search"
          />
          <div className="search-result">
            <span className="result-count">{briefs_total}</span>
            <span> briefs found</span>

            <span className="ml-8">
              number of briefs per page
              <select
                className="ml-4 border-white border bg-[#2c2c2c] h-8 px-4 rounded-md focus:border-none"
                onChange={(e) => {
                  setNumItemsPerPage(parseInt(e.target.value));
                }}
                value={itemsPerPage}
              >
                {arrayMultipleOfFiveWithin100()?.map((item, itemIndex) => (
                  <option key={itemIndex} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </span>
          </div>
        </div>
        <div className="briefs-list">
          {briefs?.map((item, itemIndex) => (
            <div
              className="brief-item"
              key={itemIndex}
              onClick={() => router.push(`/briefs/${item?.id}/`)}
            >
              <div className="brief-title">{item.headline}</div>
              <div className="brief-time-info">
                {`${item.experience_level}, ${item.duration}, Posted by ${item.created_by}`}
              </div>
              <div className="brief-description">{item.description}</div>

              <div className="brief-tags">
                {item.skills.map((skill: any, skillIndex: any) => (
                  <div className="tag-item" key={skillIndex}>
                    {skill.name}
                  </div>
                ))}
              </div>

              <div className="brief-proposals">
                <span className="proposals-heading">Proposals Submitted: </span>
                <span className="proposals-count">
                  {item.number_of_briefs_submitted}
                </span>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          pageSize={itemsPerPage}
          total={briefs_total}
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
          jumpNextIcon={<div className={pageinationIconClassName}>{">>"}</div>}
          jumpPrevIcon={<div className={pageinationIconClassName}>{"<<"}</div>}
        />
      </div>
    </div>
  );
};

export default Briefs;
