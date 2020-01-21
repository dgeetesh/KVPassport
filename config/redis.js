var redis = require('redis');
var client = redis.createClient(); //creates a new client
// var client = redis.createClient(port, host); //if need to add the post

client.on('connect', function() {
    console.log('Redis Connected');
});

// client.set('framework1--', 'AngularJS'); // ----

client.set('framework', 'AngularJS', function(err, reply) {
    console.log(reply);
  });

client.get('framework', function(err, reply) {
    console.log(reply);
});

client.hmset('frameworks', 'javascript', 'AngularJS', 'css', 'Bootstrap', 'node', 'Express');

client.hgetall('frameworks', function(err, object) {
    console.log('POpopo----',object);
});

module.exports=client;