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
var link='https://kvmobileapp.herokuapp.com/uploads/';
//POST new user route (optional, everyone has access)

//Register the user for the first time parameters includes (email,pass,firstname,lastname)
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

//update the user for the domain parameters include(name,email,dob,domain)
router.post('/updateDomian', auth.optional, (req, res, next) => {
  // const { body: { user } } = req;
  const user = req.body;

  if(!user.email || !user.firstName ||  !user.domain || !user.dob || !user._id || !user.phoneNumber ) {
    return res.status(422).json({
      errors: 'All fields are required'
          });
  }
  Users.updateOne({_id:user._id},{$set:{domain:user.domain,dob:user.dob}}).then(resp=>{
    return res.json({ user: createJson(resp) });
  }).catch(err=>{
    res.status(500)
  });

});


//POST login route (optional, everyone has access) parameters are(email,password)
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
            return res.json({ user: createJson(resp) });
          });
        }).catch(error=>{
          console.log('error',error);
        });
    }
    // return status(400);
  })(req, res, next);
});

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

//POST current route (required, only authenticated users have access) sharig post 
router.post('/uploadPost',auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  if(id){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = './public/uploads/' + files.filetoupload.name;
      fs.rename(oldpath, newpath, function (err) {
        if (err)  console.log(err);
        return Users.findById(id)
          .then((user) => {
            if(!user) {
              return res.sendStatus(400);
            }
            let share_post={};
            share_post.posterName=`${user.userName ||''}`;
            share_post.userId=user._id;
            share_post.caption=fields.caption;
            share_post.typeOfFile=fields.typeOfFile;
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

//GET current route (required, only authenticated users have access) get all post
router.get('/getAllPosts', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  return sharePost.find({userId:id})
    .then((sharePost) => {
      if(!sharePost) {
        return res.sendStatus(400);
      }
        return res.json({ user: sharePost });
    }).catch(err=>{
      console.log(reply);
      return res.sendStatus(500);
  });
});

//POST current route (required, only authenticated users have access) comment in the post
router.get('/userComment', auth.required, (req, res, next) => {
  // const { payload: { id } } = req;
  const postId=req.body.postId;
  return sharePost.find({_id:postId})
    .then((sharePost) => {
      if(!sharePost) {
        return res.sendStatus(400);
      }
      console.log(sharePost)

      // sharePost.updateOne({_id:postId},{$set:{dcoomain:user.domain,dob:user.dob}}).then(resp=>{
      //   return res.json({ user: createJson(resp) });
      // }).catch(err=>{
      //   res.status(500)
      // });

        return res.json({ user: sharePost });
    }).catch(err=>{
      console.log(reply);
      return res.sendStatus(500);
  });
});


module.exports = router;