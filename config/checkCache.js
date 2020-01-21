const client = require('../config/redis.js');
const createJson = require('../config/createJson.js');

const checkCache = (req, res, next) => {
  const { id } = req.payload;

  // client.del(id, function(err, reply) {
  //     console.log('deleted',reply);
  // });

  client.get(id, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    //if no match found

    let finaldata=JSON.parse(data);
    if (data != null) {
      res.send(createJson(finaldata));
    } else {
      //proceed to next middleware function
      next();
    }
  });
};

module.exports = checkCache;