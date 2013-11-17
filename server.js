var express = require('express'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    config = require('./config/config');

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});

var app = express();
var http = require('http');
var server = http.createServer(app);

server.listen(config.server.port, config.server.host);
console.log('Listening on ' + config.server.host + ':' + config.server.port);

require('./config/express')(app, server, config);
require('./config/routes')(app, config);
