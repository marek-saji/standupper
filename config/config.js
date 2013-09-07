var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'standupper'
    },
    port: 3000,
    db: 'mongodb://localhost/standupper'
  },

  test: {
    root: rootPath,
    app: {
      name: 'standupper'
    },
    port: 3000,
    db: 'mongodb://localhost/standupper-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'standupper'
    },
    port: 3000,
    db: 'mongodb://localhost/standupper-production'
  }
};

module.exports = config[env];
