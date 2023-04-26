import React from "react";
import { FreelancerFilterOption, FilterOption } from "../../types/freelancerTypes";
import styles from "@/styles/modules/freelancers.module.css"

type FreelancerFilterProps = {
    label: string;
    filter_options: Array<FilterOption>;
    filter_type: FreelancerFilterOption;
};

export const FreelancerFilter = ({ label, filter_options, filter_type }: FreelancerFilterProps): JSX.Element => {
    return (
        <div className="filter-section">
            <div className={styles.filterLabel}>{label}</div>
            <div className={styles.filterOptionList}>
                {filter_options?.map(
                    ({ value, interiorIndex }) => (
                        <div className={styles.filterOption} key={value}>
                            <input
                                type="checkbox"
                                className="filtercheckbox"
                                id={
                                    filter_type.toString() +
                                    "-" +
                                    interiorIndex
                                }
                            />
                            <label className="capitalize">{value}</label>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default FreelancerFilter;
