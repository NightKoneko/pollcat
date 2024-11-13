# Pollcat

Simple poll webapp (for now, more features coming soon... probably), live web preview here: [https://pollcat.vercel.app](https://pollcat.vercel.app)

### Build
```shell
$ npm run build
```

### Running the backend server
```shell
$ node socket-server/server.js
```

If you're hosting the server elsewhere, make sure to put the link to it in an environment variable for `VITE_BACKEND_URL`

### TO-DO:

* ~~Admin accounts (so not everybody and anybody can just delete any poll at their will)~~
* ~~Database for Users and/or Polls~~
* ~~Logout button~~
* ~~Fixes for invalid/missing JWT~~
* Better frontend (I hate CSS)
* Realtime Graphs
* Battle game mode (kind of like Jackbox's "Bracketeering" game) (This probably won't happen)
