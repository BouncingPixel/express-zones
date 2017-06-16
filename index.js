/*
 * express-zones
 * Copyright(c) 2017 Matthew Hall
 * MIT Licensed
 */

'use strict';

const Zone = require('./src/zone');

const zonesByKey = {};
const allZones = [];

module.exports = function ExpressZones(app) {
  app.zone = getZone;
};

function getZone(zone) {
  if (!zone || typeof zone !== 'string' || zone.length === '') {
    throw new TypeError('Zone name must be a non-empty string');
  }

  const zoneNames = Array.isArray(zone) ? zone : zone.split(' ');

  const zones = zoneNames.map((name) => {
    if (!zonesByKey[name]) {
      const newZone = new Zone(name, this);
      zonesByKey[name] = newZone;
      allZones.push(newZone);
    }

    return zonesByKey[name];
  });

  if (zones.length > 1) {
    if (!zonesByKey[zone]) {
      const newUnionZone = new Zone(zone, this, zones);
      zonesByKey[zone] = newUnionZone;
      allZones.push(newUnionZone);
    }

    return zonesByKey[zone];
  } else {
    return zones[0];
  }
}
