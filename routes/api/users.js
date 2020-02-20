const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const checkCache = require('../../config/checkCache.js');
const Users = mongoose.model('Users');
// const client = require('../../config/redis.js');
const createJson = require('../../config/createJson.js');
const sharePost = mongoose.model('sharePost');
const slideShow = mongoose.model('slideShow');
const achievers =  mongoose.model('achievers');
const cochings =  mongoose.model('cochings');
const hotLinks = mongoose.model('hotLinks');
var formidable = require('formidable');
var fs = require('fs');
var _ = require('lodash');
var link='https://kvmobileapp.herokuapp.com/uploads/';
//POST new user route (optional, everyone has access)

//Register the user for the first time parameters includes (email,pass,firstname,lastname)
router.post('/userSignUp', auth.optional, (req, res, next) => {
  // const { body: { user } } = req;
  const user = req.body.userDetail;
  console.log('user signup body',user);
  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
      status:422
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
      status:422
    });
  }

  const finalUser = new Users(user);

  finalUser.setPassword(user.password);

  return finalUser.save()
    .then(() => res.json({ user: createJson(finalUser),status:200 }));
});

//update the user for the domain parameters include(name,email,dob,domain)
router.post('/userDomianRegistration', auth.optional, (req, res, next) => {
  // const { body: { user } } = req; 
  console.log('userDomianRegistration body',req.body);
  if(req.body.UserDomainRegistration){

    const user = req.body.UserDomainRegistration;

    if(!user.domain || !user.dob || !user._id || !user.phoneNumber ) {
      return res.status(422).json({
        errors: 'All fields are required'
      });
    }
    let updateValue = {
      domain:user.domain,
      dob:new Date(user.dob),
      phoneNumber:user.phoneNumber,
      domainRegistrationToggle:true,
      profession:user.profession ? user.profession  : '',
      category:user.category ? user.category : '',
      schoolName:user.schoolName ? user.schoolName : '',
      admissionYear:user.admissionYear ? user.admissionYear : '',
      passingYear:user.passingYear ? user.passingYear : '',
    };
    console.log('updateValue',updateValue);
    Users.updateOne({_id:user._id},{$set:updateValue}).then(resp=>{
      console.log('resp',resp.nModified);
      // if(resp.nModified > 0) {
        return Users.findOne({_id:user._id})
          .then((userDataM) => {
            return res.status(200).json({ user: userDataM,status:200 });
          });
        // return res.status(200).json({msg:'Domain Registered Succesfully',status:200});
      // }else
      // {
      //   return res.status(500).json({msg:'Domain Registered UnSuccesfully',status:500});
      // }
      // return res.status(200).json({msg:'Domain Registered Succesfully'});
    }).catch(err=>{
      console.log('err',err);
      res.status(500).json({error:'Format of Input field doesnt match ',status:500});
    });

  }else
  {
    return res.status(422).json({
      errors: 'Invalid Data'
    });
  }

});


//POST login route (optional, everyone has access) parameters are(email,password)
router.post('/login', auth.optional, (req, res, next) => {
  // const { body: { user } } = req;
  const user = req.body;
  console.log(user);
  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
      status:422
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
      status:422
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      console.log(err);
      return next(err);
    }
    if(passportUser) {
      let userData = passportUser;
      userData.token = passportUser.generateJWT();
      userData.status = 'Online';
      let logInUser = new Users(userData);
      logInUser.save()
        .then((resp) => {
          // client.set(logInUser._id, JSON.stringify(resp), function(err, reply) {
          return res.json({ user: createJson(resp) ,status:200});
          // });
        }).catch(error=>{
          console.log('error',error);
          return res.json({ error: 'Something Went Wrong' ,status:500});
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
      // client.set(user._id, JSON.stringify(user), function(err, reply) {
      // console.log(reply);
      return res.json({ user: createJson(user) });
      // });
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
      fs.rename(oldpath, newpath, function (error) {
        if (error)  {console.log(error);}
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
    .then((sharePosData) => {
      if(!sharePosData) {
        return res.sendStatus(400);
      }
      return res.json({ user: sharePosData,status:200 });
    }).catch(err=>{
      return res.sendStatus(500);
    });
});

//POST current route (required, only authenticated users have access) comment in the post
router.post('/userComment', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  const postId=req.body.postId;
  const commentText=req.body.comment;
  if(postId){
    return sharePost.find({_id:postId})
      .then((sharePostData) => {
        if(!sharePostData) {
          return res.sendStatus(400);
        }
        let comment= {
          userId:id,
          comments:commentText,
          userName:'userName',
          commentedOn:new Date()
        };
        sharePost.update({_id:postId},{$push:{comments:comment}}).then(resp=>{
          console.log(resp);
          return res.json({ user: createJson(resp),status:200 });
        }).catch(err=>{
          res.status(500);
        });

        return res.json({ user: sharePost });
      }).catch(err=>{
        console.log(err);
        return res.sendStatus(500);
      });
  }else{
    return res.status(422).json({
      errors: {
        postId: 'is required',
      },
    });
  }
});

router.post('/facebookLogin', (req, res, next) => {
  console.log('facebookLogin resp',req.body);
  let fbToken=req.body.accessToken;
  let fbUserId =req.body.userID;
  return Users.findOne({fbUserId:fbUserId})
    .then((userData) => {
      console.log('userData',userData);
      if(userData) {
        let token=userData.generateJWT();
        console.log('user availavble token',token);
        Users.updateOne({fbUserId:fbUserId},{$set:{fbToken:fbToken,token:token,status:'Online'}}).then(resp=>{
          console.log('resp',resp.nModified);
          return Users.findOne({fbUserId:fbUserId})
            .then((userDataM) => {
              return res.json({ user: userDataM,status:200 });
            });
        }).catch(err=>{
          console.log('err',err);
          return res.json({ error: 'Something Went Wrong',status:500 });
        });
      }else
      {
        console.log('user unavailavble');
        const newUser={};
        newUser.fbToken=fbToken;
        newUser.fbUserId=fbUserId;
        // newUser.email=req.body.email;
        // newUser.firstName=req.body.firstName;
        newUser.firstName=req.body.userDetail.first_name ? req.body.userDetail.first_name : '' ;
        newUser.lastName=req.body.userDetail.last_name ? req.body.userDetail.last_name : '' ;
        newUser.userName=req.body.userDetail.name;
        newUser.status='Online';
        // newUser.gender=req.body.gender;
        newUser.profilePic=req.body.userDetail.profile_pic;
        newUser.email = req.body.userDetail.email ? req.body.userDetail.email : '';
        console.log('newUser',newUser);
        const finalUser = new Users(newUser);
        finalUser.token = finalUser.generateJWT();
        return finalUser.save()
          .then((resp) => res.json({ user:  createJson(resp),status:200}));
      }
      // return res.json({ user: user });
    }).catch(err=>{
      console.log(err);
      return res.json({ error:'Something Went Wrong',status:200});
    });
});

router.get('/getUserData',auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  console.log(id);
  console.log('user payload ',req.session);
  if(id){
    return Users.findOne({_id:id})
      .then((userData) => {
        console.log('userData',userData);
        res.status(200).json({
          user:createJson(userData),
          status:200
        });
      });  
  }else
  {
    return res.status(422).json({
      errors: 'Invalid Data',
      status:500
    });
  }

});

router.get('/logout',auth.required, function(req, res){
  const { payload: { id } } = req;
  console.log(id);
  if(id){
    Users.updateOne({_id:id},{$set:{status:'Offline'}}).then(resp=>{
      console.log('resp',resp.nModified);
      if(resp.nModified > 0) {
        req.session.destroy();
        return res.status(200).json({msg:'Success',status:200});
      }else
      {
        return res.status(200).json({msg:'Success',status:200});
      }
      // return res.status(200).json({msg:'Domain Registered Succesfully'});
    }).catch(err=>{
      console.log('err',err);
      res.status(500).json({msg:'Something Went Wrong',status:500});
    });

  }else
  {
    return res.status(422).json({
      errors: 'Invalid Data'
    });
  }

});

router.get('/commonPage', function(req, res){
  let findSlideshow= slideShow.find();
  let findachievers = achievers.find();
  let findHotLinks = hotLinks.find();
  Promise.all([findSlideshow,findachievers,findHotLinks]).then(function(values) {
    let commonPage={
      slideShow:values[0],
      achievers:values[1],
      hotLinks:values[2],
    };
    return res.status(200).json({commonPage:commonPage,status:200});
  }).catch(err=>{
    console.log('err',err);
    res.status(500).json({msg:'Something Went Wrong',status:500});
  });
});

router.post('/searchFilterForCochings', function(req, res){
  let address=req.body;

  if(!address.city || !address.state ) {
    return res.status(422).json({
      errors: 'All fields are required'
    });
  }

  cochings.find({}).then(function(allData) {
    let currentCityData=allData.filter(a=>{
      if(a.address.city.toLowerCase() === address.city.toLowerCase() && a.address.state ? a.address.state.toLowerCase() : a.address.state === address.state.toLowerCase())
      {
        return a;
      }
    });
    let restCityData=allData.filter(a=>{
      if(a.address.city.toLowerCase() !== address.city.toLowerCase())
      {
        return a;
      }
    });
    let allSortedData=[...currentCityData,restCityData];
    let sortedData=_.flatten(allSortedData);
    return res.status(200).json({commonPage:sortedData,status:200});

  }).catch(err=>{
    console.log('err',err);
    res.status(500).json({msg:'Something Went Wrong',status:500});
  });
});
module.exports = router;