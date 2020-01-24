const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const checkCache = require('../../config/checkCache.js');
const Users = mongoose.model('Users');
const client = require('../../config/redis.js');
const createJson = require('../../config/createJson.js');
const sharePost = mongoose.model('sharePost');
var formidable = require('formidable');
var fs = require('fs');
var link='http://localhost:8000/uploads/';
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
      let userData = passportUser;
      userData.token = passportUser.generateJWT();
      let logInUser = new Users(userData);
      logInUser.save()
        .then((resp) => {
          client.set(logInUser._id, JSON.stringify(resp), function(err, reply) {
            console.log('resp',createJson(resp));
            return res.json({ user: createJson(resp) });
          });
        }).catch(err=>{
          console.log('err',err);
        });
    }

    // return status(400);
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
      if(!user) {
        return res.sendStatus(400);
      }
      client.set(user._id, JSON.stringify(user), function(err, reply) {
        console.log(reply);
        return res.json({ user: createJson(reply) });
      });
    });
});

router.post('/uploadPost',auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  if(id){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = './public/uploads/' + files.filetoupload.name;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        return Users.findById(id)
          .then((user) => {
            if(!user) {
              return res.sendStatus(400);
            }
            let share_post={};
            share_post.posterName=`${user.userName ||''}`;
            share_post.userId=user._id;
            share_post.caption=fields.caption;
            share_post.postedOn=new Date();
            share_post.link=link+files.filetoupload.name;
            var sharePostss=new sharePost(share_post);
            sharePostss.save()
              .then((resp) => {
                console.log('resp',resp);
                return res.json({ user: createJson(resp) });
              }).catch(err=>{
                console.log('err',err);
              });
          });
      });
    });
  }else
  {
    return res.sendStatus(400);
  }
});

router.get('/getAllPosts', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  return sharePost.find({userId:id})
    .then((sharePost) => {
      if(!sharePost) {
        return res.sendStatus(400);
      }
      console.log('sharePost',JSON.stringify(sharePost));
      // client.set(user._id, JSON.stringify(user), function(err, reply) {
      //   console.log(reply);
        return res.json({ user: sharePost });
      // });
    });
});



module.exports = router;