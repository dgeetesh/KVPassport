const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
// const client = require('./config/redis'); //redis connection

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Initiate our app
const app = express();

//Configure our app
// app.use(cors());
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://192.168.1.246:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Allow-Header':
          'Origin, X-Requested-With, Content-Type, Accept',
    credentials: true
  })
);
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if(!isProduction) {
  app.use(errorHandler());
}


//Configure Mongoose
let uri='mongodb+srv://kvuser:kvuser@cluster0-uwtje.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect('mongodb+srv://kvuser:kvuser@cluster0-uwtje.mongodb.net/test?retryWrites=true&w=majority');
mongoose.set('debug', true);

//Models & routes
require('./models/Users');
require('./models/sharePosts');
require('./config/passport');
app.use(require('./routes'));

//Error handlers & middlewares
// if(!isProduction) {
//   app.use((err, req, res) => {
//     res.send(err.status || 500);

//     res.json({
//       errors: {
//         message: err.message,
//         error: err,
//       },
//     });
//   });
// }

// app.use((err, req, res) => {
//   res.status(err.status || 500);

//   res.json({
//     errors: {
//       message: err.message,
//       error: {},
//     },
//   });
// });

app.listen(8000, () => console.log('Server running on http://localhost:8000/'));