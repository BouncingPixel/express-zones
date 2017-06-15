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
To get a zone, use `app.zone(zoneName: string)` where zoneName can also be a space separated list of zone names.
These multi-name zones, or union-zones, inherit middleware from all zones in the list.
Only middleware added with `.use()` will be copied from a zone to a union zone.
All middleware later added to a zone with `.use()` will also be copied into all union-zone which reference the zone.

Because order of middleware matters, the order of zone names in a union zone also matter.
Thus, `csrf-safe admin` and `admin csrf-safe` are considered different union-zones.
Attempting to consider these the same would lead to different behavior depending on which was referenced first.

```js
app.zone('csrf-safe').use(csrfMiddleware());
app.zone('csrf-safe').post('/my-post', postHandler);

app.zone('admin').use(requiresUser);
app.zone('admin').use(requiresAdminLevel);

app.zone('csrf-safe admin').post('/admin/another-post', adminPostHandler);
```

#### Fallback Zones

Fallback zones can be used to apply a zone or a union zone to routes when no zone is applied.
They do not apply to every route nor do they apply if a route starts running in a zone and finishes outside of the zone.

To set the fallback zone, set the settings key `fallback-zone` on the Express app.
The fallback zone can be a single zone or a union-zone.
Fallback zones can be set at any time and can be changed while the app runs.

```js
// setting to a single zone
app.set('fallback-zone', 'csrf-safe');

// setting to a union zone
app.set('fallback-zone', 'csrf-safe force-ssl');
```
