const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

const createProperty = async (req, res) => {
  const property = new Property(req.body);
  const savedProperty = await property.save();
  res.status(httpStatus.CREATED).json(savedProperty);
};
/*
const getProperties = async (req, res) => {
  const properties = await Property.find();
  res.json(properties);
};
*/
const getProperties = async (req, res) => {
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

  const result = await Property.paginate({}, options);

  if (result.docs.length === 0 && page > 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No properties found for this page');
  }

  res.json({
    properties: result.docs,
    totalPages: result.totalPages,
    currentPage: result.page,
    totalProperties: result.totalDocs,
  });
};

const getProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  res.json(property); 
};

const updateProperty = async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  res.json(property);
};

const deleteProperty = async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Property not found');
  }
  res.json({ message: 'Property deleted successfully' });
};

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty
};