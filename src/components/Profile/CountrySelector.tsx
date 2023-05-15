import React, { useState } from 'react';
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';


const CountrySelector = () => {
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');

    return (
        <div className="w-full">
        <h3 className="text-lg mb-2">Your Location</h3>
        <div className="country-picker flex flex-wrap gap-2">
          <CountryDropdown
            classes="bg-transparent border border-light-white px-3 py-4 rounded-xl max-w-full"
            value={country}
            onChange={(val) => setCountry(val)} />
          <RegionDropdown
            classes="bg-transparent border border-light-white px-3 py-4 rounded-xl max-w-full"
            country={country}
            value={region}
            onChange={(val) => setRegion(val)} />
        </div>
      </div>
    );
};

export default CountrySelector;