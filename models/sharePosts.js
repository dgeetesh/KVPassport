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
      profilePic:String
    }
  ],
  likes: Array,
  typeOfFile: String,
  link: String,
  caption:String,
  postedOn:Date,
  commonTimeline:Boolean,
  personalTimeline:Boolean,
  domainTimeline:Boolean,
  domain:String,
  tag:String,
});


mongoose.model('sharePost', sharePostSchema,'sharePost');