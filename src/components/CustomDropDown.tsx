/* eslint-disable react/display-name */
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { chevDownIcon } from '@/assets/svgs';

import BriefFilter from './BriefFilter';

import { BriefFilterOption, FilterOption } from '@/types/briefTypes';
import { FreelancerFilterOption } from '@/types/freelancerTypes';

interface CustomDropDownProps {
  name: string;
  filterType: BriefFilterOption | FreelancerFilterOption;
  filterOptions: Array<FilterOption> | undefined | any;
  setId?: (_id: string | string[]) => void;
  ids?: Array<string>;
  setOpenDropDown?: (_val: string) => void | undefined;
}

const CustomDropDown = React.memo(
  ({
    name,
    filterType,
    filterOptions,
    setId,
    ids,
    setOpenDropDown,
  }: CustomDropDownProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      const storedState = localStorage.getItem(name);

      if (storedState === 'true') {
        setIsOpen(true);
      }
    }, [name]);

    const handleToggle = () => {
      if (isOpen) {
        localStorage.setItem(name, 'false');
      } else {
        localStorage.setItem(name, 'true');
      }
      setOpenDropDown && setOpenDropDown(name);
      setIsOpen(!isOpen);
    };

    return (
      <div className='relative md:mb-8 mb-4'>
        <div
          onClick={handleToggle}
          typeof='button'
          data-testid={name}
          className='h-[39px] w-full border border-black rounded-xl flex justify-between items-center text-imbue-purple-dark font-normal text-sm p-3 cursor-pointer'
        >
          {name}
          <Image
            src={chevDownIcon}
            alt={'filter-icon'}
            className='h-[12px] w-[12px]'
          />
        </div>
        {isOpen && (
          <div
            data-testid='filterOptions'
            className='w-full bg-white rounded-[10px] rounded-t-none z-50 absolute  transition-all duration-300 ease-in-out shadow-sm shadow-slate-300 !overflow-scroll overflow-y-scroll max-h-[180px]'
          >
            <BriefFilter
              label=''
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
