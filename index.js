'use strict';

const Zone = require('./src/zone');

const zonesByKey = {};
const allZones = [];

module.exports = function ExpressZones(app) {
  app.zone = getZone;
  app.use(routerMiddleware);
};

function getZone(zone) {
  const zoneNames = Array.isArray(zone) ? zone : zone.split(' ');

  const zones = zoneNames.map(function(name) {
    if (!zonesByKey[name]) {
      const newZone = new Zone(name);
      zonesByKey[name] = newZone;
      allZones.push(newZone);
    }

    return zonesByKey[name];
  });

  if (zones.length > 1) {
    if (!zonesByKey[zone]) {
      const newUnionZone = new Zone(zone, zones);
      zonesByKey[zone] = newUnionZone;
      allZones.push(newUnionZone);
    }

    return zonesByKey[zone];
  } else {
    return zones[0];
  }
}

function routerMiddleware(req, res, next) {
  // try to find the first zone which has a route that matches it
  // TODO: should we try to execute all which match? I think so!
  // TODO: but... what about '/' since default is '/'...
  const reqPath = req.path;
  const reqMethod = req.method;

  for (let zoneIdx = 0, zoneLen = allZones.length; zoneIdx < zoneLen; zoneIdx++) {
    const zone = allZones[zoneIdx];
    const stack = zone.router.stack;

    for (let stackIdx = 0, stackLen = stack.length; stackIdx < stackLen; stackIdx++) {
      const layer = stack[stackIdx];
      const route = layer.route;

      if (!route) {
        continue;
      }

      if (route._handles_method(reqMethod) && layer.match(reqPath)) {
        zone.router(req, res, next);
        return;
      }
    }
  }

  next();
}
