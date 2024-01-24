import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { InputAdornment, TextField } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useClickAway } from 'react-use';

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

const CustomDropDown = ({
  name,
  filterType,
  filterOptions,
  setId,
  ids,
}: CustomDropDownProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(filterOptions);

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
    let newOptions = [...options];
    if (e.target.value) {
      newOptions = filterOptions.filter((o: any) =>
        o.value.includes(`${e.target.value}`)
      );
    } else {
      newOptions = [...filterOptions];
    }
    setOptions(newOptions);
  };

  // to close the dropdown when clicked outside
  const dropdownRef = useRef(null);

  useClickAway(dropdownRef, () => {
    setIsOpen(false)
  });

  return (
    <div ref={dropdownRef} className='relative mb-0 custom-scroll'>
      <TextField
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        className='min-w-[13.3rem] w-full'
        label={name}
        color='secondary'
        autoComplete='off'
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <ArrowDropDownIcon
                className={`cursor-pointer ${isOpen && 'rotate-180'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(!isOpen)
                }}
              />
            </InputAdornment>
          ),
        }}
      />
      {isOpen && (
        <div
          data-testid='filterOptions'
          className={`w-full -mt-6 bg-white border border-imbue-light-purple rounded-[10px] rounded-t-none absolute transition-all duration-300 ease-in-out shadow-sm shadow-slate-300 overflow-y-auto max-h-[170px]`}
          style={{ zIndex: 20 - filterType }}
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
};

export default CustomDropDown;
