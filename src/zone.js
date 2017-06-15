'use strict';

const express = require('express');
const methods = require('./router-methods');

function Zone(name, basedOn) {
  this.name = name;
  this.router = express.Router();
  this._unionsIn = [];

  basedOn && basedOn.forEach((otherZone) => {
    otherZone._unionsIn.push(this);

    this.router.stack = this.router.stack.concat(
      otherZone.router.stack.filter(layer => !layer.route)
    );
  });
}

methods.forEach(function(method) {
  Zone.prototype[method] = function(...args) {
    this.router[method](...args);

    // add it to the union too
    this._unionsIn.forEach(function(union) {
      union[method](...args);
    });
  };
});

module.exports = Zone;
