const createJson = (data) => {
  let finaldata=JSON.parse(JSON.stringify(data));
  let json={};
  Object.keys(finaldata).forEach(function(key) {
    if(key !== 'salt' && key !== 'hash' ){
      json[key]=finaldata[key];
    }
  });
  return json;
};

module.exports = createJson;