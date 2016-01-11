var express = require('express');
var router = express.Router();

/* GET home page. */
module.exports = function(app) {
  app.get('/', function(req, res, next) {
    res.render('index', { title: '首页' });
  });

  app.get('/register', function(req, res, next) {
    res.render('register', { title: '注册' });
  });
  app.post('/register', function(req, res, next) {
  });

  app.get('/login', function(req, res, next) {
    res.render('login', { title: '登录' });
  });
  app.post('/login', function(req, res, next) {
  });

  app.get('/new', function(req, res, next) {
    res.render('reg', { title: '新文章' });
  });
  app.post('/new', function(req, res, next) {
  });

  app.get('/logout', function(req, res, next) {
    res.render('logout', { title: '注销' });
  });
};
