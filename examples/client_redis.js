var NRP = require('node-redis-pubsub')
  , config = { port: 6379       // Port of your locally running Redis server
             // , scope: 'demo'    // Use a scope to prevent two NRPs from sharing messages
             }
  , nrp = new NRP(config); 


nrp.emit('say hello', { name: 'Louis' });   // Outputs 'Hello Louis'
nrp.emit('city:hello', { city: 'Paris' });   // Outputs 'Paris is great'
nrp.emit('city:yeah', { city: 'San Francisco' });   // Outputs 'San Francisco is great'
