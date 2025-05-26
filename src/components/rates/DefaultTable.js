import React from 'react';
import RateTable from './RateTable';

const DefaultTable = ({ eggRates = [] }) => {  return <RateTable rates={eggRates} showPriceColumns={true} showChart={true} chartType="bar" />;
};

export default DefaultTable;