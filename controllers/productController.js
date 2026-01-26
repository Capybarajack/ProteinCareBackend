const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

const createProduct = async (req, res) => {
  const product = new Product(req.body);
  const savedProduct = await product.save();
  res.status(httpStatus.CREATED).json(savedProduct);
};
/*
const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};
*/
const getProducts = async (req, res) => {
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

  const result = await Product.paginate({}, options);

  if (result.docs.length === 0 && page > 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No products found for this page');
  }

  res.json({
    products: result.docs,
    totalPages: result.totalPages,
    currentPage: result.page,
    totalProducts: result.totalDocs,
  });
};

const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.json(product); 
};

const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.json({ message: 'Product deleted successfully' });
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
};