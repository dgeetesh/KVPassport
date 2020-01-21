const createJson = (data) => {
  let json={};
  Object.keys(data).forEach(function(key) {
    if(key !== 'salt' && key !== 'hash' ){
      json[key]=data[key];
    }
  });
  return json;
};

module.exports = createJson;