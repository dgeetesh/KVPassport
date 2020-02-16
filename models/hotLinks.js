const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotLinksSchema = new Schema({
  url: String,
  hotlinkDescription: String,
  image: String,
});


mongoose.model('hotLinks', hotLinksSchema,'hotLinks');