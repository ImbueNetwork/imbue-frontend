import React from 'react';

import styles from '@/styles/modules/freelancers.module.css';

import {
  FilterOption,
  FreelancerFilterOption,
} from '../../types/freelancerTypes';

type FreelancerFilterProps = {
  label: string;
  options: Array<FilterOption> | undefined;
  filterType: FreelancerFilterOption;
};

export const FreelancerFilter = ({
  label,
  options,
  filterType,
}: FreelancerFilterProps): JSX.Element => {
  return (
    <div className='filter-section'>
      <div className={styles.filterLabel}>{label}</div>
      <div className={styles.filterOptionList}>
        {options?.map(({ value, interiorIndex }) => (
          <div className={styles.filterOption} key={value}>
            <input
              type='checkbox'
              className='filtercheckbox'
              id={filterType.toString() + '-' + interiorIndex}
            />
            <label className='capitalize'>{value}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreelancerFilter;
