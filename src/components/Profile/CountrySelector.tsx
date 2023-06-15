import React, { useState } from 'react';
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import { countries } from 'country-data';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { getCode, getData, getName, getNameList, getNames } from "country-list";
import ReactCountryFlag from 'react-country-flag';


type CountrySelectorProps = {
  user: any;
  setUser: Function;
  isEditMode: boolean;
}

const CountrySelector = ({ setUser, user, isEditMode }: CountrySelectorProps) => {
  const [country, setCountry] = useState<string>(user?.country || "");
  const [region, setRegion] = useState(user?.region || '');
  
  const handleCountry = (countryName: string) => {
    setCountry(countryName)
    setUser({ ...user, country: countryName })
  }

  const handleRegion = (regionName: string) => {
    setRegion(regionName)
    setUser({ ...user, region: regionName })
  }

  const findFlag = () => {
    if (country === "United States") return getCode("United States of America")
    if (country === "United Kingdom") return "UK"

    else return getCode(country)
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
            <div className="flex gap-3 mx-auto">
              {
                country && (
                  <>
                    <ReactCountryFlag countryCode={findFlag() || ""} />
                    <p className="text-base leading-[1.2]">
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