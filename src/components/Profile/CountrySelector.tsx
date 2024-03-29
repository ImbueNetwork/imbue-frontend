/* eslint-disable no-unused-vars */
import { getCode } from 'country-list';
import React, { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

type CountrySelectorProps = {
  user: any;
  setUser?: (value: any) => void;
  isEditMode?: boolean;
};

export const findFlag = (country: string) => {
  if (!country) return;
  if (country === 'United States')
    return getCode('United States of America');
  if (country === 'United Kingdom') return 'UK';
  if (country === 'Turkey') return 'TR';
  else return getCode(country);
};

const CountrySelector = ({
  setUser,
  user,
  isEditMode = false,
}: CountrySelectorProps) => {
  const [country, setCountry] = useState<string>(user?.country || '');
  const [region, setRegion] = useState(user?.region || '');

  const handleCountry = (countryName: string) => {
    setCountry(countryName);
    setUser?.({ ...user, country: countryName });
  };

  const handleRegion = (regionName: string) => {
    setRegion(regionName);
    setUser?.({ ...user, region: regionName });
  };



  return (
    <>
      {isEditMode ? (
        <div className='w-full relative'>
          <h3 className='text-lg mb-2 text-imbue-purple-dark'>Your Location</h3>
          <div className='country-picker flex flex-wrap gap-2'>
            <CountryDropdown
              classes='bg-transparent border border-imbue-purple px-3 py-4 rounded max-w-full text-imbue-purple'
              value={country}
              onChange={(val) => handleCountry(val)}
            />
            <RegionDropdown
              classes='bg-transparent border border-imbue-purple px-3 py-4 rounded max-w-full text-imbue-purple'
              country={country}
              value={region}
              onChange={(val) => handleRegion(val)}
            />
          </div>
        </div>
      ) : (
        <div className='flex gap-3'>
          {user?.country && (
            <>
              <ReactCountryFlag
                className='text-imbue-purple-dark font-bold'
                countryCode={findFlag(user.country) || 'TR'}
              />
              <p className='text-base leading-[1.2] text-imbue-purple-dark'>
                {user?.region && `${user?.region}, `} {user?.country}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CountrySelector;
