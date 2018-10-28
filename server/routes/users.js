var express = require('express');
var router = express.Router();
var User = require('../models/user.js').User;
var HttpError = require('../error/').HttpError;
var ObjectID = require('mongodb').ObjectID;

/* GET users listing. */
router.get('/', (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) return next(err);
    res.json(users);
  });
});

router.get('/:id', (req, res, next) => {
  try {
    var id = new ObjectID(req.params.id);
  } catch (e) {
    return next(new HttpError(404, "User not found"));
  }

  User.findById(id, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return next(new HttpError(404, "User not found"));
    }
    res.json(user);
  });
});

module.exports = router;
