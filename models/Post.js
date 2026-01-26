const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  categories:{
    type: [String],
  },
  is_featured: { //用來標示某項內容（如產品、文章、圖片）是否被特別推薦、置頂或設為焦點展示
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);