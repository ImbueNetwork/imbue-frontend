import { getCode } from 'country-list';
import React, { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

type CountrySelectorProps = {
  freelancer: any;
  setFreelancer: (_freelancer: any) => void;
  isEditMode: boolean;
};

const CountrySelector = ({
  setFreelancer,
  freelancer,
  isEditMode,
}: CountrySelectorProps) => {
  const [country, setCountry] = useState<string>(freelancer.country || '');
  const [region, setRegion] = useState(freelancer.region || '');

  const handleCountry = (countryName: string) => {
    setCountry(countryName);
    setFreelancer({ ...freelancer, country: countryName });
  };

  const handleRegion = (regionName: string) => {
    setRegion(regionName);
    setFreelancer({ ...freelancer, region: regionName });
  };

  return (
    <>
      {isEditMode ? (
        <div className='w-full relative'>
          <h3 className='text-lg mb-2'>Your Location</h3>
          <div className='country-picker flex flex-wrap gap-2'>
            <CountryDropdown
              classes='bg-transparent border border-light-white px-3 py-4 rounded max-w-full'
              value={country}
              onChange={(val) => handleCountry(val)}
            />
            <RegionDropdown
              classes='bg-transparent border border-light-white px-3 py-4 rounded max-w-full'
              country={country}
              value={region}
              onChange={(val) => handleRegion(val)}
            />
          </div>
        </div>
      ) : (
        <div className='flex justify-center gap-3'>
          {country && (
            <>
              <ReactCountryFlag countryCode={getCode(country) || ''} />
              <p className='text-base leading-[1.2]'>
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
