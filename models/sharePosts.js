const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema;

//sharing the post with user 
const sharePostSchema = new Schema({
  posterName: String,
  posterImage:String,
  surname:String,
  video:String,
  image:String,
  userId: { type: ObjectId, ref: 'Users' },
  comments: [
    {
      userId:
      {
        type: ObjectId,
        ref: 'Users'
      },
      comments:
      {
        type: String,
      },
      userName:
      {
        type: String,
      },
      commentedOn:
      {
        type: Date,
      },
    }
  ],
  likes: Array,
  typeOfFile: String,
  link: String,
  caption:String,
  postedOn:Date,
  commonTimeline:Boolean,
  studentTimeline:Boolean,
  tag:String,
});


mongoose.model('sharePost', sharePostSchema,'sharePost');