const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  userName: String,
  firstName: String,
  lastName: String,
  email: String,
  domain: String,
  gender: String,
  profilePic:String,
  dob: Date,
  hash: String,
  profession:String,
  phoneNumber:Number,
  salt: String,
  address: String,
  fbUserId:String,
  accessToken: String,
  token:String,
  category:String,
  schoolName:String,
  admissionYear:Date,
  passingYear:Date,
  phoneNumber:Number,
  fbToken:String,
  userCommonToggle:{type:Boolean,default:false},
  domainRegistrationToggle:{type:Boolean,default:false},
  status:{type:String,default:'Online'}
});

// set password to user
UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// validate password for the user
UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

// generate access token for the user
UsersSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
};

UsersSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

mongoose.model('Users', UsersSchema);