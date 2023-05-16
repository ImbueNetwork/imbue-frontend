import React, { useState } from 'react';
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import { countries } from 'country-data';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { getCode, getName } from "country-list";
import ReactCountryFlag from 'react-country-flag';

type CountrySelectorProps = {
  freelancer: any;
  setFreelancer: Function;
  isEditMode: boolean;
}

const CountrySelector = ({ setFreelancer, freelancer, isEditMode }: CountrySelectorProps) => {
  const [country, setCountry] = useState<string>(freelancer.country || "");
  const [region, setRegion] = useState(freelancer.region || '');
  
  const handleCountry = (countryName: string) => {
    setCountry(countryName)
    setFreelancer({ ...freelancer, country: countryName })
  }

  const handleRegion = (regionName: string) => {
    setRegion(regionName)
    setFreelancer({ ...freelancer, region: regionName })
  }

  return (
    <>
      {
        isEditMode
          ? (
            <div className="w-full relative">
              <h3 className="text-lg mb-2">Your Location</h3>
              <div className="country-picker flex flex-wrap gap-2">
                <CountryDropdown
                  classes="bg-transparent border border-light-white px-3 py-4 rounded max-w-full"
                  value={country}
                  onChange={(val) => handleCountry(val)} />
                <RegionDropdown
                  classes="bg-transparent border border-light-white px-3 py-4 rounded max-w-full"
                  country={country}
                  value={region}
                  onChange={(val) => handleRegion(val)} />
              </div>
            </div>
          )
          : (
            <div className="flex justify-center gap-[12px]">
              {
                country && (
                  <>
                    <ReactCountryFlag countryCode={getCode(country) || ""} />
                    <p className="text-[16px] leading-[1.2] text-[#ebeae2]">
                      {region}, {country}
                    </p>
                  </>
                )
              }
            </div>
          )
      }
    </>
  );
};

export default CountrySelector;