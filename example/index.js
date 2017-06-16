/*
 * express-zones
 * Copyright(c) 2017 Matthew Hall
 * MIT Licensed
 */

const express = require('express');
const app = express();

require('..')(app);

app.use(function(req, res, next) {
  // this would run on everything
  req.ranOnEverything = true;
  next();
});

app.zone('fallback').use(function(req, res, next) {
  req.isFallbackZone = true;
  res.write('This is in the fallback (no other) zone\n');
  next();
});

app.get('/fallback', app.zone('fallback').fallback(), function(req, res) {
  const isFallback =
    !req.isSafeZone && !req.isAdminZone && req.isFallbackZone
    ? 'yes' : 'no';

  res.end(`Is /fallback in the fallback zone, but not the safe or admin? (should be yes) ${isFallback}`);
});

app.zone('default').use(function(req, res, next) {
  req.isDefaultZone = true;
  next();
});

// note, once a default is applied, fallbacks don't matter any more!
app.use(app.zone('default').apply());

app.zone('safe').use(function(req, res, next) {
  req.isSafeZone = true;
  res.write('This zone is safe\n');
  next();
});

app.zone('admin').use(function(req, res, next) {
  req.isAdminZone = true;
  res.write('This zone would only work for an admin\n');
  next();
});

app.zone('safe admin').use(function(req, res, next) {
  res.write('This is a special safe-admin zone\n');
  next();
});

app.zone('safe').use(function(req, res, next) {
  res.write('This safe middleware is second\n');
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

app.use(function(req, res) {
  res.send('404');
});

app.listen(3000, function() {
  console.log('App is listening on port 3000'); // eslint-disable-line no-console
});
