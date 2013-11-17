var nconf = require('nconf'),
    path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    defaults;

defaults = {
  root: rootPath,
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  db: 'mongodb://localhost/standupper'
};


nconf.argv();

nconf.env('_');

// When run by `npm start`, npm_package_config_* ENV variables
// represent settings from package.json and set by `npm config`.
nconf.set(nconf.stores.env.get('npm:package:config'));

// file with local settings (ignored by git)
nconf.file('local', 'config.json');

// package configuration
nconf.file('package', 'package.json');

nconf.defaults(defaults);


module.exports = nconf.get();
