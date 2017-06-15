# express-zones

Creates an API in Express to separate routes and middleware into zones.

## Working With

### Requirements

- NodeJS 6 LTS
- Express 4.x

### Installing

Install the package using your JS package manager of choice, such as `npm` or `yarn`.

For example, with `npm` or `yarn`:
```
$ npm install --save @bouncingpixel/express-zones

$ yarn add @bouncingpixel/express-zones
```

### Using express-zones

Add express-zones to your express instance by calling the exported function with your app:

```js
const express = require('express');

const app = express();
require('@bouncingpixel/express-zones')(app);
```

To get a zone, use `app.zone(zoneName: string)` API where zoneName can also be a space separated list of zone names.
These multi-name zones, or union-zones, inherit everything from all zones in the list.
Any new items added to the other zones will be added to the union-zones.
Current **all** middleware and routes are copied from a zone to a union zone.
Since a middleware can be defined with `.use` or any `method` function, `express-zones` cannot know if something is a middleware or a route. Therefore, all are cloned.

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
