var NRP = require('node-redis-pubsub')
  , config = { port: 6379       // Port of your locally running Redis server
             // , scope: 'demo'    // Use a scope to prevent two NRPs from sharing messages
             }
  , nrp = new NRP(config); 

nrp.on('say hello', function (data) {
  console.log('Hello ' + data.name);
}, function () {
	nrp.emit('say hello', { name: 'Louis' });   // Outputs 'Hello Louis'
});



// You can use patterns to capture all messages of a certain type
nrp.on('city:*', function (data) {
  console.log(data.city + ' is great');
}, function () {
	nrp.emit('city:hello', { city: 'Paris' });   // Outputs 'Paris is great'
	nrp.emit('city:yeah', { city: 'San Francisco' });   // Outputs 'San Francisco is great'
});



// console.log(nrp);