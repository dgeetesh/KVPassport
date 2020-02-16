const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const achieversSchema = new Schema({
// key: 'k1',
  title: String,
  subTitle:String,
  image: String,
  backgroundColor: String,
  inspirations:String,
  SlideShows: [],
  blog:String,
});


mongoose.model('achievers', achieversSchema,'achievers');