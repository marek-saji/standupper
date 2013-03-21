standupper
==========

A simple tool for conducting scrumm standup meetings online.

Run with:

```
npm start
```


Configuration
-------------

Default configuration is:

```json
{
    "server": {
        "ip":   "127.0.0.1",
        "port": "8000"
    },
    "mongo": {
        "url": "standupper"
    },
    "entryFields": {
        "prev"      : "Previously",
        "next"      : "Nextly",
        "obstacles" : "Obstacles"
    },
    "debug": false
}
```

### `config.json`

Place `config.json` file in applications directory.

### environment variables

```sh
server__ip=0.0.0.0 npm start
```

### `npm config`

```sh
npm config set server__ip 0.0.0.0
npm start
```

### command line arguments

If you don't use `npm start`, you can pass command line arguments:

```sh
node server.js --server:ip=0.0.0.0
```
