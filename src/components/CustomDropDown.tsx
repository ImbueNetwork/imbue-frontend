/* eslint-disable react/display-name */
import { arrowDownIcon } from "@/assets/svgs";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import BriefFilter from "./BriefFilter";
import { BriefFilterOption, FilterOption } from "@/types/briefTypes";

interface CustomDropDownProps {
  name?: string;
  filterType: BriefFilterOption;
  filterOptions: Array<FilterOption>;
  setId?: (id: string | string[]) => void;
  ids?: Array<string>;
}

const CustomDropDown = React.memo(
  ({
    name,
    filterType,
    filterOptions,
    setId,
    ids,
  }: CustomDropDownProps): JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);

    const handleHover = useCallback(() => {
      setIsHovered(true);
    }, []);

    const handleLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    return (
      <div className="relative mb-8">
        <div
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
          typeof="button"
          className="h-[39px] w-full border border-[#EBEAE2] rounded-xl flex justify-between items-center text-white font-normal text-sm p-3 cursor-pointer"
        >
          {name}
          <Image
            src={arrowDownIcon}
            alt={"filter-icon"}
            className="h-[12px] w-[12px]"
          />
        </div>
        {isHovered && (
          <div
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
            className="w-[221px] bg-[#1B1B1B] p-4 rounded-[10px] z-50 absolute transition-all duration-300 ease-in-out"
          >
            <BriefFilter
              label=""
              filter_type={filterType}
              filter_options={filterOptions}
              setId={setId}
              ids={ids}
            />
          </div>
        )}
      </div>
    );
  }
);

export default CustomDropDown;
