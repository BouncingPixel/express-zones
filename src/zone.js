/*
 * express-zones
 * Copyright(c) 2017 Matthew Hall
 * MIT Licensed
 */

'use strict';

const express = require('express');
const methods = require('./router-methods');

function Zone(name, router, basedOn) {
  this.name = name;
  this.router = router;
  this.middlewareRouter = express.Router();
  this.basedZones = basedOn || [];
}

Zone.prototype.apply = function() {
  const _this = this;
  return function(req, res, done) {
    // make a copy in case middleware change mid-processing
    const basedZones = _this.basedZones.slice();
    const basedCount = basedZones.length;
    let index = 0;

    next();

    function next() {
      if (index > basedCount) {
        // while this should never happen, catching it for safety
        // also avoid re-runing the zone, so we just go to done.
        return done();
      }

      // while we could call next and it would work, this saves an extra call
      const nextFn = index === basedCount ? done : next;

      const zone = index === basedCount ? _this : basedZones[index];
      index++;

      if (!req.zonesApplied) {
        req.zonesApplied = [zone.name];
      } else {
        // if the zone has already been applied, then no need to reapply it
        if (req.zonesApplied.indexOf(zone.name) !== -1) {
          return next();
        }

        req.zonesApplied.push(zone.name);
      }

      return zone.middlewareRouter(req, res, nextFn);
    }
  };
};

Zone.prototype.fallback = function() {
  const apply = this.apply().bind(this);

  return function(req, res, done) {
    if (req.zonesApplied && req.zonesApplied.length) {
      return done();
    }

    apply(req, res, done);
  };
};

Zone.prototype.use = function(...args) {
  this.middlewareRouter.use(...args);
};

methods.forEach(function(method) {
  Zone.prototype[method] = function(path, ...middleware) {
    this.router[method](path, this.apply(), ...middleware);
  };
});

module.exports = Zone;
