const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const checkCache = require('../../config/checkCache.js');
const Users = mongoose.model('Users');
const client = require('../../config/redis.js');
const createJson = require('../../config/createJson.js');

//POST new user route (optional, everyone has access)
router.post('/register', auth.optional, (req, res, next) => {
  // const { body: { user } } = req;
  const user = req.body;

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  const finalUser = new Users(user);

  finalUser.setPassword(user.password);

  return finalUser.save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }));
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  // const { body: { user } } = req;
  const user = req.body;
  console.log(user);
  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      return next(err);
    }
    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();
      const logInUser = new Users(user);
      logInUser.save()
    .then((resp) => {
      client.set(logInUser._id, JSON.stringify(resp), function(err, reply) {
        console.log(reply);
      });
    });
      return res.json({ user: user.toAuthJSON() });
    }

    return status(400);
  })(req, res, next);
});

// router.post('/login',
//   passport.authenticate('local',{ session: false }),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     console.log('req.user',req.user)
//     res.redirect('/users/' + req.user);
//   }); 

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required,checkCache, (req, res, next) => {
  const { payload: { id } } = req;
    return Users.findById(id)
      .then((user) => {
        console.log('user',JSON.stringify(user));
        if(!user) {
          return res.sendStatus(400);
        }
        client.set(user._id, JSON.stringify(user), function(err, reply) {
          console.log(reply);
          return res.json({ user: createJson(reply) });
        });
    });
});

module.exports = router;