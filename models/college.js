const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collegeSchema = new Schema({
// key: 'k1',
  // address:{
  //   city:String,
  //   country:String,
  //   state:String,
  // },
  // subTitle:String,
  title: String,
  image: String,
  collegeList:[],
  // addmission:String,
  // fee: String,
  // coupon: String,
  // images: [],
  // amenities: [],
  // description:String
});


mongoose.model('college', collegeSchema,'college');