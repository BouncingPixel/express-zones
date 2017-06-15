/*
 * express-zones
 * Copyright(c) 2017 Matthew Hall
 * MIT Licensed
 */

const express = require('express');
const app = express();

require('..')(app);

app.use(function(req, res, next) {
  res.write(`This runs on everything ${req.url}\n`);
  next();
});

app.zone('safe').use(function(req, res, next) {
  req.isSafeZone = true;
  res.write('This zone is safe\n');
  next();
});

app.zone('unsafe').use(function(req, res, next) {
  req.isUnsafeZone = true;
  res.write('This zone is not safe\n');
  next();
});

app.zone('admin').use(function(req, res, next) {
  req.isAdminZone = true;
  res.write('This zone would only work for an admin\n');
  next();
});

app.zone('fallback').use(function(req, res, next) {
  req.isFallbackZone = true;
  res.write('This zone is the fallback\n');
  next();
});

app.zone('safe').get('/', function(req, res) {
  const isSafe =
    req.isSafeZone && !req.isAdminZone && !req.isFallbackZone
    ? 'yes' : 'no';

  res.end(`Is / safe? (should be yes) ${isSafe}`);
});

app.zone('safe admin').get('/admin/', function(req, res) {
  const isSafeAdmin =
    req.isSafeZone && req.isAdminZone && !req.isFallbackZone
    ? 'yes' : 'no';

  res.end(`Is /admin safe and under admin? (should be yes) ${isSafeAdmin}`);
});

app.zone('safe').get('/starts-safe', function(req, res, next) {
  res.locals.startedSafe = true;
  next();
});

app.get('/starts-safe', function(req, res) {
  const isSafe =
    req.isSafeZone && !req.isAdminZone && !req.isFallbackZone
    ? 'yes' : 'no';
  const didStartSafe = res.locals.startedSafe;

  const output = isSafe && didStartSafe ? 'yes' : 'no';
  res.end(`Is /starts-safe safe and also started in safe? (should be yes) ${output}`);
});

app.get('/fallback', function(req, res) {
  const isFallback =
    !req.isSafeZone && !req.isAdminZone && req.isFallbackZone
    ? 'yes' : 'no';

  res.end(`Is /fallback only under fallback? (should be yes) ${isFallback}`);
});

app.set('fallback-zone', 'fallback');

app.listen(3000, function() {
  console.log('App is listening on port 3000'); // eslint-disable-line no-console
});
