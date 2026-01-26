const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  }
}, {
  timestamps: true,
});

postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);