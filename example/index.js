const express = require('express');
const app = express();

require('..')(app);

app.use(function(req, res, next) {
  console.log('This runs on everything ' + req.url);
  next();
});

app.zone('safe').use(function(req, res, next) {
  console.log('This zone is safe');
  next();
});

app.zone('unsafe').use(function(req, res, next) {
  console.log('This zone is not safe');
  next();
});

app.zone('admin').use(function(req, res, next) {
  console.log('This zone would only work for an admin');
  next();
});

app.zone('safe').get('/', function(req, res) {
  res.send('/ should be safe');
});

app.zone('unsafe').get('/unsafe', function(req, res) {
  res.send('/unsafe should be unsafe');
});

app.zone('safe admin').get('/admin/', function(req, res) {
  res.send('/admin/ should be safe and only for admins');
});

app.listen(3000, function() {
  console.log('App is listening on port 3000');
});
