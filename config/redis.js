var redis = require('redis');
var client = redis.createClient(); //creates a new client
// var client = redis.createClient(port, host); //if need to add the post

client.on('connect', function() {
  console.log('Redis Connected');
});

module.exports=client;