const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

const createPost = async (req, res) => {
  const post = new Post(req.body);
  const savedPost = await post.save();
  res.status(httpStatus.CREATED).json(savedPost);
};
/*
const getPosts = async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
};
*/
const getPosts = async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Validate pagination parameters
  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid pagination parameters');
  }

  // Validate sorting parameters
  const allowedSortFields = ['createdAt', 'title']; // Add or remove fields as needed
  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid sort field');
  }

  if (!['asc', 'desc'].includes(order.toLowerCase())) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid sort order');
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sortBy]: order === 'desc' ? -1 : 1 },
    lean: true,
  };

  const result = await Post.paginate({}, options);

  if (result.docs.length === 0 && page > 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No posts found for this page');
  }

  res.json({
    posts: result.docs,
    totalPages: result.totalPages,
    currentPage: result.page,
    totalPosts: result.totalDocs,
  });
};

const getPost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.json(post);
};

const updatePost = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.json(post);
};

const deletePost = async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.json({ message: 'Post deleted successfully' });
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost
};