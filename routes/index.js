var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登录!');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登录!');
    res.redirect('back');
  }
  next();
}

/* GET home page. */
module.exports = function(app) {
  app.get('/', function(req, res, next) {
    res.render('index', {
      title: '主页',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
     });
  });

  app.get('/register', checkNotLogin);
  app.get('/register', function(req, res, next) {
    res.render('register', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
     });
  });
  app.post('/register', checkNotLogin);
  app.post('/register', function(req, res, next) {
    var name = req.body.name;
    var password = req.body.password;
    var password_confirm = req.body['password-confirm'];
    if (password !== password_confirm) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/register');
    };
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
    });

    User.get(newUser.name, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/register');
      }

      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/register');
        }
        req.session.user = newUser;
        req.flash('success', '注册成功!');
        res.redirect('/');
      });
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res, next) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res, next) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/login');
      }
      if (user.password != password) {
        req.flash('error', '密码错误!');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', '登录成功!');
      res.redirect('/');
    });
  });

  app.get('/new', checkLogin);
  app.get('/new', function(req, res, next) {
    res.render('new', { title: '新文章' });
  });
  app.post('/new', checkLogin);
  app.post('/new', function(req, res, next) {
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res, next) {
      req.session.user = null;
      req.flash('success', '已注销!');
      res.redirect('/');
  });
};
