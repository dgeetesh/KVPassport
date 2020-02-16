const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const slideShowSchema = new Schema({
  link: String,
});


mongoose.model('slideShow', slideShowSchema,'slideShow');