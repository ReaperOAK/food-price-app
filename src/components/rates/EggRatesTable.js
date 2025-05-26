import React from 'react';
import RateTable from './RateTable';

const EggRatesTable = ({ sortedEggRates, handleSort, setEggRate, handleDelete, handleEditRate }) => {
  return (
    <RateTable 
      rates={sortedEggRates}
      showAdmin={true}
      showState={true}
      showDate={true}
      showChart={false}
      showPriceColumns={false}
      handleSort={handleSort}
      onEdit={handleEditRate}
      onDelete={handleDelete}
    />
  );
};

export default EggRatesTable;