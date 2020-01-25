var redis = require('redis');
// var client = redis.createClient(); //creates a new client
let port='18429';
let host='ec2-35-173-89-108.compute-1.amazonaws.com';
var client = redis.createClient(port, host); //if need to add the post

client.on('connect', function() {
  console.log('Redis Connected');
});

module.exports=client;