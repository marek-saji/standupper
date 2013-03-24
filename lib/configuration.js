var ENV_SEPARATOR = "__";

var nconf = require("nconf"),
    config = nconf,
    separatorRegex = new RegExp(ENV_SEPARATOR, "g"),
    npmEnvRegex = /^npm_package_config_(.*)$/,
    match,
    env,
    defaults;

defaults = {
    "server": {
        "ip":   "127.0.0.1",
        "port": "8000"
    },
    "mongo": {
        "url": "standupper"
    },
    "debug": false,
    "client" : {
        "entryFields": {
            "prev"      : "Previously",
            "next"      : "Nextly",
            "obstacles" : "Obstacles"
        }
    }
};

// Command line
config = config.argv();

// Use double underscores for variable names, instead of default ":".
config = config.env(ENV_SEPARATOR);

// It's ok for this file not to exist.
config = config.file({file: "config.json"});

// When run by `npm start`, npm_package_config_ ENV variables
// represent settings from package.json and set by `npm config`.
for (env in process.env) {
    env = env.replace(separatorRegex, ":");
    match = env.match(npmEnvRegex);
    if (null !== match) {
        config.set(match[1], config.get(match[0]));
    }
}

// Default values
config.defaults(defaults);


module.exports = config;
