/* eslint-disable react/display-name */
import React from "react";
import { BriefFilterOption, FilterOption } from "@/types/briefTypes";
import { FreelancerFilterOption } from "@/types/freelancerTypes";

type BriefFilterProps = {
  label: string;
  filter_options: Array<FilterOption>;
  filter_type: BriefFilterOption | FreelancerFilterOption;
  setId?: (id: string | string[]) => void;
  ids?: Array<string>;
};

export const BriefFilter = React.memo(
  ({
    label,
    filter_options,
    filter_type,
    setId,
    ids = [],
  }: BriefFilterProps): JSX.Element => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { checked, id } = e.target;
      const newIds = checked
        ? [...ids, id]
        : ids.filter((existingId) => existingId !== id);

      setId && setId(newIds);
    };

    return (
      <div className="filter-section">
        <div className="filter-label">{label}</div>
        <div className="filter-option-list">
          {filter_options.map(({ value, interiorIndex }) => (
            <div
              className="filter-option flex items-center justify-between w-full"
              key={value}
            >
              <label className="font-normal text-base text-white flex justify-between w-full cursor-pointer">
                {value}
                <input
                  type="checkbox"
                  className="filtercheckbox"
                  id={`${filter_type.toString()}-${interiorIndex}`}
                  data-testid={`${filter_type.toString()}-${interiorIndex}`}
                  checked={ids.includes(
                    `${filter_type.toString()}-${interiorIndex}`
                  )}
                  onChange={handleChange}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default BriefFilter;
