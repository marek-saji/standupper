var nconf = require('nconf'),
    path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    defaults;

defaults = {
  app: {
    name: 'StandUpper'
  },
  root: rootPath,
  server: {
    host: '0.0.0.0',
    port: 3000,
    livereload: {
      port: 35729
    }
  },
  db: 'mongodb://localhost/standupper',
  // keys for authentication with Passport:
  // set them in ./config.json
  keys: {
    github: {
      // https://github.com/settings/applications/new
      id:     '',
      secret: ''
    },
    dropbox: {
      // https://www.dropbox.com/developers/apps
      id:     '',
      secret: ''
    },
    facebook: {
      // https://developers.facebook.com/apps/
      id:     '',
      secret: ''
    }
  }
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
