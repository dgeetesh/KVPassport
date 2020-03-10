const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const checkCache = require('../../config/checkCache.js');
const Users = mongoose.model('Users');
// const client = require('../../config/redis.js');
const createJson = require('../../config/createJson.js');
const SortData = require('../../config/functions.js');
const sharePost = mongoose.model('sharePost');
const slideShow = mongoose.model('slideShow');
const achievers =  mongoose.model('achievers');
const coachings =  mongoose.model('coachings');
const college =  mongoose.model('college');
const activities =  mongoose.model('activities');
const hotLinks = mongoose.model('hotLinks');
// var formidable = require('formidable');
// var fs = require('fs');
// const moment=require('moment');
// eslint-disable-next-line no-unused-vars
var _ = require('lodash');
var link='https://kvmobileapp.herokuapp.com/uploads/';
//POST new user route (optional, everyone has access)

//Register the user for the first time parameters includes (email,pass,firstname,lastname)
router.post('/userSignUp', auth.optional, (req, res) => {
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
  finalUser.token = finalUser.generateJWT();

  finalUser.setPassword(user.password);

  return finalUser.save()
    .then(() => res.json({ user: createJson(finalUser),status:200 }));
});

//update the user for the domain parameters include(name,email,dob,domain)
router.post('/userDomianRegistration', auth.optional, (req, res) => {
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

  return passport.authenticate('local', { session: false }, (err, passportUser) => {
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
    }else
    {
      return res.json({ error: 'Invalid Credentials' ,status:500});
    }
    // return status(400);
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required,checkCache, (req, res) => {
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


// //POST current route (required, only authenticated users have access) sharig post
// router.post('/uploadPost2',auth.optional, (req) => {
//   let postData=req.body;
//   //  const base64Data=Base64.decode(req.image);
//   console.log('__dirname11',__dirname);
//   // console.log('postData.image',postData.image);
//   let buff = new Buffer(postData.image, 'base64');
//   console.log(buff);
//   // let timeStamp=new Date();
//   let fileName=`${'filenames'}`;
//   fs.writeFile(`public/uploads/${fileName}`, buff,function(err){
//   //  if (err) throw err;
//     console.log('Saved!',err);
//   });
// });


// //POST current route (required, only authenticated users have access) sharig post
// router.post('/uploadPost',auth.required, (req, res) => {
//   const { payload: { id } } = req;
//   let postData=req.body;
//   console.log(id,postData);
//   if(postData.image){
//     return Users.findById(id)
//       .then((user) => {
//         if(!user) {
//           return res.sendStatus(400);
//         }
//         //  const base64Data=Base64.decode(req.image);
//         let buff = new Buffer(postData.image, 'base64');
//         console.log(buff);
//         let timeStamp=moment().format('YYYY-MM-DD HH:mm:ss');
//         let fileName=user.userName+timeStamp;
//         fs.writeFile(`public/uploads/${fileName}`, buff,function(err){
//         //  if (err) throw err;
//           console.log('Saved!',err);
//         });
//         let share_post={};
//         share_post.posterName=`${user.userName ||''}`;
//         share_post.userId=user._id;
//         share_post.caption=postData.caption ? postData.caption : '' ;
//         share_post.typeOfFile=postData.typeOfFile ? postData.typeOfFile : '';
//         share_post.tag=postData.tag ? postData.tag : '';
//         share_post.postedOn=timeStamp;
//         share_post.link=link+fileName;
//         var sharePostss=new sharePost(share_post);
//         sharePostss.save()
//           .then((resp) => {
//             console.log('resp',resp);
//             return res.json({ user: createJson(resp) });
//           }).catch(postErr=>{
//             console.log('postErr',postErr);
//           });
//       });

//   }else
//   {
//     return res.status(422).json({
//       errors: 'Invalid Data',
//       status:500
//     });
//   }
// });

// //POST current route (required, only authenticated users have access) sharig post
// router.post('/uploadPost1',auth.required, (req, res) => {
//   const { payload: { id } } = req;
//   if(id){
//     console.log('id',id);
//     var form = new formidable.IncomingForm();
//     form.parse(req, function (err, fields, files) {
//       console.log('files',files);
//       console.log('files.image',files.image);
//       console.log('fields',fields);
//       console.log('err',err);
//       if (err) throw err;
//       var oldpath = files.image.path;
//       var newpath = `public/uploads/${files.image.name}`;
//       fs.rename(oldpath, newpath, function (error) {
//         if (error)  {console.log(error);}
//         return Users.findById(id)
//           .then((user) => {
//             if(!user) {
//               return res.sendStatus(400);
//             }
//             let share_post={};
//             share_post.posterName=`${user.userName ||''}`;
//             share_post.userId=user._id;
//             share_post.caption=fields.caption ? fields.caption : '' ;
//             share_post.typeOfFile=fields.typeOfFile ? fields.typeOfFile : '' ;
//             share_post.postedOn=new Date();
//             share_post.link=link+files.image.name;
//             console.log('share_post',share_post);
//             var sharePostss=new sharePost(share_post);
//             sharePostss.save()
//               .then((resp) => {
//                 console.log('resp',resp);
//                 return res.json({ user: createJson(resp),status:200 });
//               }).catch(postErr=>{
//                 console.log('postErr',postErr);
//                 return res.json({ error:'Data Not Found',status:500  });
//               });
//           });
//       });
//     });
//   }else
//   {
//     return res.json({ error:'Data Not Found',status:400  });
//   }
// });

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    console.log('filename',file);
    cb(null, Date.now() + '-' +file.originalname)
  }
});
var upload = multer({ storage: storage }).array('file',10);
// var upload = multer({ storage: storage });

// POST current route (required, only authenticated users have access) sharig post with multer
router.post('/uploadPost',auth.required, (req, res) => {
  const { payload: { id } } = req;
  if(id){
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.json({ message:'Data Not Found',Error:err, timeLine: [], status:400 });
      } else if (err) {
        return res.json({ message:'Data Not Found',Error:err, timeLine: [], status:400 });
      }
      return Users.findById(id)
        .then((user) => {
          if(!user) {
            return res.sendStatus(400);
          }
          let postData=req.body;
          console.log('postData',postData,req.files);
          if(req.files.length === 0 && !postData.caption){
            throw 'Data Not Found';
          }
          // var personalTimeline=false;
          var commonTimeline=false;
          var domainTimeline=false;
          if(postData.commonTimeline === 'true'){
            commonTimeline=true;
          }
          if(postData.domainTimeline === 'true'){
            domainTimeline=true;
          }

          let domain = user.domain;
          let share_post={};
          share_post.posterName=`${user.userName ||''}`;
          share_post.posterImage=user.profilePic || '';
          share_post.userId=user._id;
          share_post.domain=user.domain;
          share_post.commonTimeline=commonTimeline ? true : false;
          share_post.domainTimeline=domainTimeline ? true : false;
          share_post.typeOfFile=postData.typeOfFile ? postData.typeOfFile : '';
          share_post.tag=req.body.tag ? req.body.tag : '' ;
          share_post.postedOn=new Date();

          let imageArray=[];
          let videoArray=[];
          let pdfArray=[];
          if(req.files.length>0){
            req.files.map(files=>{
              if(files && files.mimetype.includes('image')){
                var postImagename=files ? files.filename : '';
                imageArray.push({image:link+postImagename});
                share_post.images=imageArray;
              }else if(files && files.mimetype.includes('video')){
                var postVideoname=files ? files.filename : '';
                videoArray.push({video:link+postVideoname});
                share_post.images=videoArray;
              }else if(files && files.mimetype.includes('pdf')){
                var postPdfName=files ? files.filename : '';
                pdfArray.push({pdf:link+postPdfName});
                share_post.images=pdfArray;
              }
            });
          }

          if(req.body.caption){
            share_post.caption=req.body.caption;
          }

          console.log('share_post',share_post);

          var sharePostss=new sharePost(share_post);
          sharePostss.save()
            .then((resp) => {
              console.log('resp',JSON.stringify(resp));
              let pArr=[];
              pArr.push(sharePost.find({commonTimeline:true}).sort({postedOn:-1}));
              pArr.push(sharePost.find({userId:id}).sort({postedOn:-1}));
              pArr.push(sharePost.find({domainTimeline:true,domain:domain}).sort({postedOn:-1}));
              // pArr.push(
              //   sharePost.aggregate([
              //     { "$match": domainTimeline:true,domain:domain },])
              // );
              Promise.all(pArr).then(function(values) {
                if(!values) {
                  return res.json({ error:'Data Not Found', timeLine: [], status:400 });
                }
                let getAllPostsData={
                  commonTimeline:values[0],
                  personalTimeline:values[1],
                  domainTimeline:values[2],
                };
                return res.json({ timeLine:getAllPostsData,status:200 });
              }).catch(getPosterr=>{
                console.log('getPosterr',getPosterr);
                return res.json({ error:'Data Not Found', timeLine: [], status:500 });
              });
            }).catch(postErr=>{
              console.log('postErr',postErr);
              return res.json({ error:'Data Not Found',timeLine: [],status:500  });
            });
        }).catch(postErr=>{
          console.log('postErr',postErr);
          return res.json({ error:'Data Not Found',timeLine: [],status:500  });
        });
    });
  }else
  {
    return res.json({ error:'Data Not Found',status:400  });
  }
});


//GET current route (required, only authenticated users have access) get all post
router.get('/getAllPosts', auth.required, (req, res) => {
  const { payload: { id } } = req;
  return sharePost.find({userId:id})
    .then((sharePosData) => {
      if(!sharePosData) {
        return res.sendStatus(400);
      }
      return res.json({ user: sharePosData,status:200 });
    }).catch(getPosterr=>{
      console.log('getPosterr',getPosterr);
      return res.sendStatus(500);
    });
});

//POST current route (required, only authenticated users have access) get timeLine Post
router.post('/getTimeLine', auth.required, (req, res) => {
  const { payload: { id } } = req;
  let timeLine = req.body;
  console.log('timeLine',timeLine);
  var timeLineKey;
  // if(timeLine.timeLine && timeLine.personal){
  //   timeLineKey='personalTimeline';
  // }
  if(timeLine.timeLine && timeLine.common){
    timeLineKey='commonTimeline';
  }
  if(timeLine.timeLine && timeLine.domain){
    timeLineKey='commonTimeline';
  }
  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }
      let domain = user.domain;
      let pArr=[];
      pArr.push(sharePost.find({commonTimeline:true}).sort({postedOn:-1}));
      pArr.push(sharePost.find({userId:id}).sort({postedOn:-1}));
      pArr.push(sharePost.find({domainTimeline:true,domain:domain}).sort({postedOn:-1}));
      Promise.all(pArr).then(function(values) {
        if(!values) {
          return res.json({ error:'Data Not Found', timeLine: [], status:400 });
        }
        let getAllPostsData={
          commonTimeline:values[0],
          personalTimeline:values[1],
          domainTimeline:values[2],
        };
        return res.json({ timeLine:getAllPostsData,status:200 });
      }).catch(getPosterr=>{
        console.log('getPosterr',getPosterr);
        return res.json({ error:'Data Not Found', timeLine: [], status:500 });
      });
    }).catch(postErr=>{
      console.log('postErr',postErr);
      return res.json({ error:'Data Not Found', timeLine: [], status:500 });
    });
  // return sharePost.find({userId:id,[timeLineKey]:true})
  //   .then((sharePosData) => {
  //     if(!sharePosData) {
  //       return res.sendStatus(400);
  //     }
  //     return res.json({ user: sharePosData,status:200 });
  //   }).catch(getPosterr=>{
  //     console.log('getPosterr',getPosterr);
  //     return res.sendStatus(500);
  //   });
  // });
});

//DELETE post route (required, only authenticated users have access)
router.post('/deletePost', auth.required, (req, res) => {
  const { payload: { id } } = req;
  const postId=req.body.postId;
  if(postId){
    return Users.findById(id)
      .then((user) => {
        if(!user) {
          return res.sendStatus(400);
        }
        return sharePost.deleteOne({_id:postId})
          .then((deletePost) => {
            let domain=user.domain;
            console.log('deletePost',deletePost);
            let pArr=[];
            pArr.push(sharePost.find({commonTimeline:true}).sort({postedOn:-1}));
            pArr.push(sharePost.find({userId:id}).sort({postedOn:-1}));
            pArr.push(sharePost.find({domainTimeline:true,domain:domain}).sort({postedOn:-1}));
            Promise.all(pArr).then(function(values) {
              if(!values) {
                return res.json({ error:'Data Not Found', timeLine: [], status:400 });
              }
              let getAllPostsData={
                commonTimeline:values[0],
                personalTimeline:values[1],
                domainTimeline:values[2],
              };
              return res.json({ timeLine:getAllPostsData,status:200 });
            // return res.json({ post: 'Post Deleted Successfully',status:200 });
            }).catch(err=>{
              return res.json({ error:'Data Not Found', timeLine: [], status:500 });
            });
          }).catch(err=>{
            console.log(err);
            return res.sendStatus(500).json({
              post: 'Error in Deleting Post',status:500
            });
          });
      });

  }else{
    return res.status(422).json({
      errors: {
        postId: 'is required',
      },
    });
  }
});


//POST current route (required, only authenticated users have access) comment in the post
router.post('/userComment', auth.required, (req, res) => {
  const { payload: { id } } = req;
  const postId=req.body.postId;
  const commentText=req.body.comment;
  console.log('postId',req.body);
  if(postId){
    return Users.findOne({_id:id})
      .then((userData) => {
        // });
        return sharePost.find({_id:postId})
          .then((sharePostData) => {
            if(!sharePostData) {
              return res.sendStatus(400);
            }
            let comment= {
              userId:id,
              comments:commentText,
              userName:`${userData.userName}`,
              commentedOn:new Date(),
              profilePic:userData ? userData.profilePic : ''
            };
            sharePost.update({_id:postId},{$push:{comments:comment}}).then(resp=>{
              console.log(resp);
              let domain = userData.domain;
              let pArr=[];
              pArr.push(sharePost.find({commonTimeline:true}).sort({postedOn:-1}));
              pArr.push(sharePost.find({userId:id}).sort({postedOn:-1}));
              pArr.push(sharePost.find({domainTimeline:true,domain:domain}).sort({postedOn:-1}));
              Promise.all(pArr).then(function(values) {
                if(!values) {
                  return res.json({ error:'Data Not Found', timeLine: [], status:false });
                }
                let getAllPostsData={
                  commonTimeline:values[0],
                  personalTimeline:values[1],
                  domainTimeline:values[2],
                };
                return res.json({ timeLine:getAllPostsData,status:true });

              // return res.json({ user: createJson(resp),status:200 });
              }).catch(commentErr=>{
                console.log('commentErr',commentErr);
                return res.json({ timeLine: [], status:false });
                // res.status(500);
              });
            // return res.json({ user: sharePost });
            }).catch(err=>{
              console.log(err);
              return res.json({ timeLine: [], status:false });
            });
          });
      });
  }else{
    return res.status(422).json({
      errors: {
        postId: 'is required',
      },
      status:false
    });
  }
});


//POST current route (required, only authenticated users have access) comment in the post
router.post('/deleteUserComment', auth.required, (req, res) => {
  const { payload: { id } } = req;
  const postId=req.body.postId;
  const commentId=req.body.commentId;
  console.log(req.body);
  if(postId){
    return Users.findOne({_id:id})
      .then((userData) => {
        // });
        return sharePost.find({_id:postId})
          .then((sharePostData) => {
            if(!sharePostData) {
              return res.sendStatus(400);
            }
            // let comment= {
            //   userId:id,
            //   comments:commentText,
            //   userName:`${userData.userName}`,
            //   commentedOn:new Date()
            // };
            sharePost.update({_id:postId},
              { $pull: { comments : { _id : commentId } } },
              { safe: true })
              .then(resp=>{
                console.log(resp);
                let domain = userData.domain;
                let pArr=[];
                pArr.push(sharePost.find({commonTimeline:true}).sort({postedOn:-1}));
                pArr.push(sharePost.find({userId:id}).sort({postedOn:-1}));
                pArr.push(sharePost.find({domainTimeline:true,domain:domain}).sort({postedOn:-1}));
                Promise.all(pArr).then(function(values) {
                  if(!values) {
                    return res.json({ error:'Data Not Found', timeLine: [], status:400 });
                  }
                  let getAllPostsData={
                    commonTimeline:values[0],
                    personalTimeline:values[1],
                    domainTimeline:values[2],
                  };
                  return res.json({ timeLine:getAllPostsData,status:200 });

                // return res.json({ user: createJson(resp),status:200 });
                }).catch(commentErr=>{
                  console.log('commentErr',commentErr);
                  return res.json({ timeLine: [], status:500 });
                  // res.status(500);
                });
                // return res.json({ user: sharePost });
              }).catch(err=>{
                console.log(err);
                return res.json({ timeLine: [], status:500 });
              });
          });
      });
  }else{
    return res.status(422).json({
      errors: {
        postId: 'is required',
      },
    });
  }
});

router.post('/facebookLogin', (req, res) => {
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

router.get('/getUserData',auth.required, (req, res) => {
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
        req.session.destroy();
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

router.post('/dataFordomain', function(req, res){
  let domain=req.body.domain;
  var city;
  city=req.body.city ? req.body.city :'banglore' ;
  console.log(domain,city);
  let pArr=[];
  let domainkey1;
  let domainkey2;
  let domainkey3;
  let domainkey4;
  if(domain === 'SCH'){
    domainkey1='coachings';
    domainkey2='activities';
    domainkey3='college';
    domainkey4='exams';
    pArr.push(coachings.find());
    pArr.push(activities.find());
    pArr.push(college.find());
    pArr.push(hotLinks.find());
  }else if(domain === 'CLG'){
    domainkey1='coachings';
    domainkey2='activities';
    domainkey3='jobPrefrence';
    domainkey4='exams';
    pArr.push(coachings.find());
    pArr.push(activities.find());
    pArr.push(sharePost.find({tag:'job'}));
    pArr.push(hotLinks.find());
  }
  else if(domain === 'WRK' || domain === 'PRF'){
    domainkey1='successStories';
    domainkey2='matrimony';
    domainkey3='jobPrefrence';
    domainkey4='activities';
    pArr.push(achievers.find());
    pArr.push(sharePost.find({tag:'matrimony'}));
    pArr.push(sharePost.find({tag:'job'}));
    pArr.push(activities.find());
  }
  pArr.push(slideShow.find());
  Promise.all(pArr).then(function(values) {
    // let domainData={
    //   [domainkey1]:values[0],
    //   [domainkey2]:values[1],
    //   [domainkey3]:values[2],
    //   [domainkey4]:values[3],
    //   slideShow:values[4],
    // };
    let domainData={
      [domainkey1]:SortData(city,values[0],domainkey1),
      [domainkey2]:SortData(city,values[1],domainkey2),
      [domainkey3]:SortData(city,values[2],domainkey3),
      [domainkey4]:SortData(city,values[3],domainkey4),
      slideShow:values[4],
    };
    return res.status(200).json({domainData:domainData,status:200});
  }).catch(err=>{
    console.log('err',err);
    res.status(500).json({msg:'Something Went Wrong',status:500});
  });
});

//GET current route (required, only authenticated users have access) get all post
router.get('/getUserProfile', auth.required, (req, res) => {
  const { payload: { id } } = req;
  if(id){
  return Users.findOne({_id:id})
    .then((userData) => {
      if(!userData) {
        return res.json({ user: {}, status:500 });
      }
      return res.json({ user: createJson(userData), status:200 });
    }).catch(errorUserProfile=>{
      console.log('errorUserProfile',errorUserProfile);
      return res.json({ user: {}, status:500 });
    });
  }else
  {
    return res.status(422).json({
      errors: 'Invalid Data',
      status:500
    });
  }
});

router.post('/editUserProfile', auth.required, (req, res) => {
  const { payload: { id } } = req;
  let updateData=req.body;
  if(id){
    let setData={};
    Object.keys(updateData).forEach(function (key) {
      setData[key]=updateData[key];
    });
    console.log(setData); // value
    return Users.update({_id:id},
    {
      $set:setData
    })
    .then((updateData) => {
    // });
    console.log(updateData); // value
    return Users.findOne({_id:id})
      .then((userData) => {
        if(!userData) {
          return res.json({ user: {}, status:500 });
        }
        return res.json({ user: createJson(userData), status:200 });
      }).catch(errorEditUserProfile=>{
        console.log('errorEditUserProfile',errorEditUserProfile);
        return res.json({ user: {}, status:500 });
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

const sendEmail= require('../../config/email.js');

// Reset password page
router.get('/resetPassword/:userId', auth.optional, (req, res) => {
  console.log('userId',req.params.userId);
  res.render('resetPasswordPage',{userId:req.params.userId});
});


//GET current route (required, only authenticated users have access) forgot password
router.post('/resetPassword', auth.optional, (req, res) => {
let passwordData=req.body;
  return Users.findOne({_id:passwordData.userId})
  .then((userData) => {
    if(!userData) {
      return res.json({ user: {},message:'User not found', status:500 });
    }
    const finalUser = new Users(userData);
    finalUser.setPassword(passwordData.newPassword);
    finalUser.save().then(resp=>{
      console.log(JSON.stringify(resp));
      return res.json({ user: resp, status:200 });
    });

  }).catch(errorforgotPassword=>{
    console.log('forgotPassword Error',errorforgotPassword);
    return res.json({ user: {},message:'Something Went Wrong',Error:errorforgotPassword, status:500 });
  });
});
// check email and then send mail
router.post('/forgotPassword', auth.optional, (req, res) => {
  userEmail=req.body;
  return Users.findOne({email:userEmail.email})
  .then((userData) => {
    if(!userData) {
      return res.json({ user: {},message:'User not found', status:500 });
    }
    sendEmail(req, res,userData.email,userData);
  }).catch(errorforgotPassword=>{
    console.log('forgotPassword Error',errorforgotPassword);
    return res.json({ user: {},message:'Something Went Wrong',Error:errorforgotPassword, status:500 });
  });

  function getContent(){

  }
});
module.exports = router;