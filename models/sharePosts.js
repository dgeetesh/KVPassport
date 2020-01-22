const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

const sharePostSchema = new Schema({
  posterName: String,
  userId: { type: ObjectId, ref: 'Users' },
  comments: Array,
  likes: Array,
  link: String,
  caption:String,
  postedOn:Date,
  commonTimeline:Boolean,
  studentTimeline:Boolean,
  tag:String,
});


mongoose.model('sharePost', sharePostSchema,'sharePost');