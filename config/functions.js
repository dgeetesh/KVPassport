var _ = require('lodash');

const SortData = (address,allData,list) => {
  console.log('list',list);
  if(list)
  {
    let listName;
    if(list==='coachings')
    {
      listName='coachingsList';
    }else if(list==='activities')
    {
      listName='activitiesList';
    }else if(list==='college')
    {
      listName='collegeList';
    }else
    {
      return allData;
    }
    allData.map(f=>{
      let currentCityDataStart = f[listName].filter(a=>{
        if(a.address[0].city.toLowerCase() === address.toLowerCase()
        // && a.address.state ? a.address.state.toLowerCase() : a.address.state === address.state.toLowerCase()
        )
        {
          return a;
        }
      });
      let restCityDataStart = f[listName].filter(a=>{
        if(a.address[0].city.toLowerCase() !== address.toLowerCase()
        // && a.address.state ? a.address.state.toLowerCase() : a.address.state === address.state.toLowerCase()
        )
        {
          return a;
        }
      });
      let allSortedData=[...currentCityDataStart,restCityDataStart];
      f[listName] =_.flatten(allSortedData);
    });
    return allData;
  }else
  {
    return allData;
  }
};

module.exports = SortData;