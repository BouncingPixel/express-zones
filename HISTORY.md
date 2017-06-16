# History of express-zones

## 0.3.0
- BREAKING: zones now are applied just before the soon to be applied route
- BREAKING: express-zones no longer adds a middleware into the app
- BREAKING: union-zone middleware order always follows order of zone list
- BREAKING: fallback-zones are implemented as a `zone.fallback()` middleware now
- NEW: added `req.zonesApplied` is an array of zones which have been applied
- NEW: added `zone.apply()` to create a middleware to run the zone on demand

## 0.2.0
- NEW: Added fallback-zones to be applied to un-zoned routes which never start in a zone
- BREAKING: Changed union-zones to only copy middleware added with `.use()`
- UPDATE: Updated README with new docs and improved explanation on zones

## 0.1.0
Initial release
