const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cochingsSchema = new Schema({
// key: 'k1',
  address:{
    city:String,
    country:String,
    state:String,
  },
  title: String,
  subTitle:String,
  image: String,
  backgroundColor: String,
  inspirations:String,
  SlideShows: [],
  blog:String,
});


mongoose.model('cochings', cochingsSchema,'cochings');