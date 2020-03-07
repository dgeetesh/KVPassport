var nodemailer = require('nodemailer');
var link='https://kvmobileapp.herokuapp.com/users/resetPassword/';
const sendEmail = (req, res,recipient,data) => { 
// create reusable transporter object using the default SMTP transport
// var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');
console.log('email',process.env.FROM,process.env.PASS);
// for gmail without smtp
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.FROM,
      pass: process.env.PASS
    },
    // rejectUnauthorized: true,
    tls: {
        rejectUnauthorized: false
    },
    // secure:true
  });
// setup e-mail data with unicode symbols
var mailOptions = {
    from: process.env.FROM, // sender address
    // to: recipient ? recipient : '', // list of receivers
    to: 'dgeetesh99@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plaintext body
    html: `<b>Hello world ? click on this link to reset passsword </b>
    <span>${link+data._id}</span>
    ` // html body
};

// send mail with defined transport object
return transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
    res.send(info);
    return info;
});
}
  module.exports = sendEmail;