/* eslint-disable react/display-name */
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { InputAdornment, TextField } from '@mui/material';
import React, { useState } from 'react';

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

const CustomDropDown = (
  ({
    name,
    filterType,
    filterOptions,
    setId,
    ids,
  }: CustomDropDownProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState(filterOptions);
    console.log("🚀 ~ file: CustomDropDown.tsx:30 ~ filterOptions:", filterOptions)

    // useEffect(() => {
    //   const storedState = localStorage.getItem(name);

    //   if (storedState === 'true') {
    //     setIsOpen(true);
    //   }
    // }, [name]);

    // const handleToggle = () => {
    //   if (isOpen) {
    //     localStorage.setItem(name, 'false');
    //   } else {
    //     localStorage.setItem(name, 'true');
    //   }
    //   setOpenDropDown && setOpenDropDown(name);
    //   setIsOpen(!isOpen);
    // };


    const handleChange = (e: any) => {
      let newOptions = [...options]
      if (e.target.value) {
        newOptions = filterOptions.filter((o: any) => o.value.includes(`${e.target.value}`))
      }
      else {
        newOptions = [...filterOptions]
      }
      setOptions(newOptions)
    }

    return (
      <div className='relative md:mb-8 mb-4'>
        {/* <div
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
        </div> */}

        <TextField
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          sx={{ width: "100%" }}
          label={name}
          color='secondary'
          autoComplete='off'
          InputProps={{
            endAdornment: <InputAdornment position="end">
              <ArrowDropDownIcon className={`cursor-pointer ${isOpen && "rotate-180"}`} onClick={() => setIsOpen(!isOpen)} />
            </InputAdornment>,
          }}
        />
        {isOpen && (
          <div
            data-testid='filterOptions'
            className='w-full -mt-6 bg-white rounded-[10px] rounded-t-none absolute z-10 transition-all duration-300 ease-in-out shadow-sm shadow-slate-300 overflow-y-auto max-h-[200px]'
          >
            <BriefFilter
              label=''
              filter_type={filterType}
              filter_options={options}
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
