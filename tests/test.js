var Apiko = require('../index');

// A little setup:

var config = {
  port: 5000,
  // prefix: 'api' // will prepend URLs with /api, e.g.: /api/users, no prefix by default
}

// You can also have your config in a separate file, see config.js.

if (process.argv[2] === 'prod') {
  // protects the server with the secret generated on the first run (see apiko.json)
}

if (process.argv[2] === 'dev') {
  config.protect = false, // if true, protects /dev/ UI with the secret generated on the first run (see apiko.json), use for production
  config.verbosity = 2 // 0 - 3
}

// Your custom request processing:

Apiko.on('GET /collection', (req, res, next) => {
  // req.method contains the HTTP method received, uppercased, 'GET' in this case

  // Now two cases can happen here:

  // CASE 1: you have not defined the specified (URL) endpoint in Apiko GUI

  // Request parameters are stored in the req.all property and are
  // never validated. You have to validate them here.

  if (request.all.foo) {
  // In order to respond to the client, you need to call:
    res.success({any: 'data'}) // 200 OK
  } else {
  // If you are not happy, you can respond with an error:
    res.error(400, 'Custom message', 76)
    // args: HTTP status code, custom message, custom error code, all optional
    // custom error codes should be > 100
    // this is custom errors codes your app can work with, unrelated to HTTP errors
  }

  // CASE 2: the specified (URL) endpoint is defined in Apiko GUI

  // The params will be processed according to your Apiko GUI validation
  // setup and this callback will never be called if they are invalid.

  // Furthermore, if the specified endpoint is a special endpoint processed
  // by Apiko itself (e.g. a user login at /users/login), the res.body
  // property will be present and will contain an object describing how would
  // Apiko normally respond to this request, for example:
  //
  // Error: { status: 401, message: 'The username parameter is missing.', code: 1 }
  // Success: { status: 200, data: { session: 's43v094ioag345...' }}

  // You always have to call req.success(), req.error() or next() in
  // this handler to make the web server respond!
})

Apiko.on('POST /justaction', (req, res, next) => {
  // You can define any custom endpoint addresses.

  // You probably also want to work with data, you can access any data collection
  // using the store argument with collection names as you can see them in Apiko GUI:

  // Apiko.store.collectionName.row(335) // returns row with id == 335 as an object
  // Apiko.store.collectionName.query('SELECT * FROM Users WHERE registered > ?',  params) // users who registered within the last hour
})

// Normally it's a good idea to split your code into files:
Apiko.on('GET /custom/action', require('./custom/action'))

// Let Apiko run this for you:
Apiko.run(config)