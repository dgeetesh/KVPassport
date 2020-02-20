const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitiesSchema = new Schema({
// key: 'k1',
  address:{
    city:String,
    country:String,
    state:String,
  },
  title: String,
  subTitle:String,
  image: String,
  addmission:String,
  fee: String,
  coupon: String,
  images: [],
  amenities: [],
  description:String
});


mongoose.model('activities', activitiesSchema,'activities');