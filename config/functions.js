var _ = require('lodash');

const SortData = (address,allData) => {
  let currentCityData=allData.filter(a=>{
    if(a.address.city.toLowerCase() === address.city.toLowerCase()
    && a.address.state ? a.address.state.toLowerCase() : a.address.state === address.state.toLowerCase())
    {
      return a;
    }
  });
  let restCityData=allData.filter(a=>{
    if(a.address.city.toLowerCase() !== address.city.toLowerCase())
    {
      return a;
    }
  });
  let allSortedData=[...currentCityData,restCityData];
  let sortedData=_.flatten(allSortedData);
  return sortedData;
};

module.exports = SortData;