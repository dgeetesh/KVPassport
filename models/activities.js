const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitiesSchema = new Schema({
// key: 'k1',
  // address:{
  //   city:String,
  //   country:String,
  //   state:String,
  // },
  title: String,
  image: String,
  activitiesList:[],
  subTitle:String,
  booking: String,
  description:String,
  blog:String,
  // addmission:String,
  // fee: String,
  // coupon: String,
  // images: [],
  // amenities: [],
});


mongoose.model('activities', activitiesSchema,'activities');