var mongodb = require('./db');
var Markdown = require('markdown').markdown;

function Article(name, title, article) {
  this.name = name;
  this.title = title;
  this.article = article;
}

module.exports = Article;


Article.prototype.save = function(callback) {
  var date = new Date();
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  };
  var article = {
      name: this.name,
      time: time,
      title: this.title,
      article: this.article,
      comments: [],
      pv: 0
  };
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.insert(article, {
        safe: true
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

Article.get = function(name, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('articles', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        docs.forEach(function (doc) {
          if (doc) {
            doc.article = Markdown.toHTML(doc.article);
            doc.comments.forEach(function (comment) {
              comment.content = Markdown.toHTML(comment.content);
            });
          }
        });
        callback(null, docs);
      });
    });
  });
};

Article.getArchive = function(callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.find({}, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};


Article.getOne = function(name, day, title, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('articles', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title
      }, function (err, doc) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        if (doc) {
          collection.update({
            "name": name,
            "time.day": day,
            "title": title
          }, {
            $inc: {"pv": 1}
          }, function (err) {
            mongodb.close();
            if (err) {
              return callback(err);
            }
          });
          doc.article = Markdown.toHTML(doc.article);
          doc.comments.forEach(function (comment) {
            comment.content = Markdown.toHTML(comment.content);
          });
          callback(null, doc);
        }
      });
    });
  });
};
