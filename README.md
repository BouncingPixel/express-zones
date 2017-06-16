# express-zones

Creates an API in Express to separate routes and middleware into zones.

## Working With

### Requirements

- NodeJS 6 and higher
- Express (tested with 4.15.x, should work for most 4.x)

### Installing

Install the package using your JS package manager of choice, such as `npm` or `yarn`.

For example, with `npm` or `yarn`:
```
$ npm install --save express-zones

$ yarn add express-zones
```

### Using

#### Adding express-zones to an Express app

Add express-zones to your express instance by calling the exported function with your app.
This will also add a middleware to your Express app to handle the zones.
If you need any middleware or routes to run before the zones, then add those before adding express-zones to the app.

```js
const express = require('express');

const app = express();

/*
  Place any middleware before that must run before the zones do
  Compression may be such a case, but it does not have to be!
*/

app.use(require('compression'));

// now add express-zones to express
require('express-zones')(app);
```

#### Adding zones and middleware/routes to zones

Zones are automatically created the first time you reference a zone.
Zones can be fetched with `app.zone(zoneName: string)`.
Middlewares and routes can be added to zones using the same function names as Express router, such as `zone.use()` for middleware and `zone.get()` for routes as just two examples.

When a route is added with a function other than `zone.use()`, the zone is added as a middleware just before the route's middlewares. This allows all middlewares added to the app itself to be ran before the zone is.

#### Union zones

A zone name can also be a "union zone", which is a space separated list of zones.
Union-zones, inherit middleware from the individual zones in the list.
They will not inherit from other union zones, so "zoneA zoneB zoneC" would not inherit from "zoneA zoneB"
Only middleware added with `.use()` will be copied from a zone to a union-zone.
Adding middleware to a zone which is part of a union-zone will also add that middleware to the union zone.
Middleware can also be added to the union zone for cases that only apply when all the listed zones apply.

Because order of middleware matters, the order of zone names in a union zone also matter.
Thus, `csrf-safe admin` and `admin csrf-safe` are considered different union-zones.
Attempting to consider these the same would lead to different behavior depending on which was referenced first.
For `csrf-safe admin`, all middlware in `csrf-safe` will be executed before `admin`, no matter when it is added.
Any middleware added to the union-zone will execute after all individual zone's middleware.
There is currently no way to interleave the middleware of a union zone nor is there a way to specify an explicit order of each middleware.

```js
app.zone('csrf-safe').use(csrfMiddleware());
app.zone('csrf-safe').post('/my-post', postHandler);

app.zone('admin').use(requiresUser);
app.zone('admin').use(requiresAdminLevel);

app.zone('csrf-safe admin').post('/admin/another-post', adminPostHandler);
```

#### Zones as middleware

If you wish to use a zone as a default or use a zone in a route's middleware, `zone.apply()` will create a middlware.
This middleware can be added to an app, such as `app.use(app.zone('myzone').apply())`.
The middleware can also be added to a route not in a zone with `app.get('/page', app.zone('myzone').apply(), myHandler)`.

This `apply` is the same that is added when adding a route to a zone.
Therefore, these are functionally the same:
```js
// using a zone
app.zone('myzone').get('/page', myHandler);

// is the same as adding the zone as a middleware
app.get('/page', app.zone('myzone').apply(), myHandler)
```

#### Fallback zones

A zone can be used when no other zone has been run yet by using `zone.fallback(options)`.
Zones added by default as a middleware will also prevent a fallback zone from running.
Generally, fallbacks should be added in routes, but can be applied as middleware.
If the fallback is added and a zone is later added, the fallback will still run.

```js
// if no zone is ran, my-fallback will be ran
app.get(
  '/my-route',
  app.zone('my-fallback').fallback(),
  myHandler
);

// even in this case, my-fallback is run since csrf-safe hasn't applied yet
app.get(
  '/another-route',
  app.zone('my-fallback').fallback(),
  app.zone('csrf-safe').apply(),
  myHandler
);

// in these equal cases, my-fallback will not run
app.get(
  '/no-fallback',
  app.zone('csrf-safe').apply(),
  app.zone('my-fallback').fallback(),
  myHandler
);
app.zone('csrf-safe').get(
  '/no-fallback',
  app.zone('my-fallback').fallback(),
  myHandler
);

// this will apply the fallback to any route if nothing above this point has started a zone
app.use(app.zone('my-fallback').fallback());
```
