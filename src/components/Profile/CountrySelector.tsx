/* eslint-disable no-unused-vars */
import { getCode } from 'country-list';
import React, { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

type CountrySelectorProps = {
  user: any;
  setUser: (value: any) => void;
  isEditMode: boolean;
};

const CountrySelector = ({
  setUser,
  user,
  isEditMode,
}: CountrySelectorProps) => {
  const [country, setCountry] = useState<string>(user?.country || '');
  const [region, setRegion] = useState(user?.region || '');

  const handleCountry = (countryName: string) => {
    setCountry(countryName);
    setUser({ ...user, country: countryName });
  };

  const handleRegion = (regionName: string) => {
    setRegion(regionName);
    setUser({ ...user, region: regionName });
  };

  const findFlag = () => {
    if (country === 'United States') return getCode('United States of America');
    if (country === 'United Kingdom') return 'UK';
    else return getCode(country);
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
          {country && (
            <>
              <ReactCountryFlag countryCode={findFlag() || ''} />
              <p className='text-base leading-[1.2] text-imbue-purple-dark'>
                {region}, {country}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CountrySelector;
