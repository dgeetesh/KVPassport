const jwt = require('express-jwt');

const getTokenFromHeaders = (req) => {
  // const { headers: { authorization } } = req;
  console.log('token',req.headers.token);
  const authorization=req.headers.token;
  console.log('authorization',authorization);
  // if(authorization && authorization.split(' ')[0] === 'token') {
  //   return authorization.split(' ')[1];
  // }
  if(authorization) {
    return authorization;
  }
  return null;
};

const auth = {
  required: jwt({
    secret: 'secret',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
  }),
  optional: jwt({
    secret: 'secret',
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};

module.exports = auth;