const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const successStoriesSchema = new Schema({
  name: String,
  successStoriesDescription: String,
  image: String,
});


mongoose.model('successStories', successStoriesSchema,'successStories');