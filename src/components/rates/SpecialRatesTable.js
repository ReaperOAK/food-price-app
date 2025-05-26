import React, { useEffect, useState } from 'react';
import RateTable from './RateTable';

const SpecialRatesTable = () => {
  const [specialRates, setSpecialRates] = useState([]);

  useEffect(() => {
    fetch('/php/api/rates/get_special_rates.php')
      .then(response => response.json())
      .then(data => {
        setSpecialRates(data);
      })
      .catch(error => console.error('Error fetching special rates:', error));
  }, []);

  return (
    <RateTable 
      rates={specialRates}
      showSpecialRates={true}
      showPriceColumns={false}
      showChart={false}
    />
  );
};

export default SpecialRatesTable;
