# StandUpper

A simple tool for cunducting scrumm meetings online. Soon to evolve into daily planning and time tracking tool. Still simple.

[![Code Climate](https://codeclimate.com/github/marek-saji/standupper.png)](https://codeclimate.com/github/marek-saji/standupper)


## Running

Choose your poison:

1. `grunt`
   This is probably what you want.
2. `npm start`
3. `node server.js`


## Configuration

Default configuration can be found in `./config/config.js`. There are several ways to overwrite it (each next overwriting previous):

### `config.json`

JSON file placed in repository's root directory. Ignored by git, so safe to keep local settings.

### `npm config`

    npm config set server:host 127.0.0.1
    npm start

More information: [npm-config(7)](https://npmjs.org/doc/misc/npm-config.html).

### environment variables

    server_host=127.0.0.1 grunt

### command line arguments

If you run node directly, you can pass command line arguments:

    node server.js --server:host=127.0.0.1