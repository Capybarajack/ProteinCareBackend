const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

// upload pics

const config = require('../config/config');

const multer = require('multer');

const multerS3 = require('multer-s3');

const { S3Client } = require('@aws-sdk/client-s3');

const { Upload } = require('@aws-sdk/lib-storage');

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

// image upload

// Configure AWS SDK

const s3Client = new S3Client({
 region: config.s3.region,
 credentials: {
   accessKeyId: config.s3.accessKeyId,
   secretAccessKey: config.s3.secretAccessKey,
 },
});

const upload = multer({
 storage: multerS3({
   s3: s3Client,
   bucket: config.s3.bucket,
   acl: 'public-read',
   contentType: multerS3.AUTO_CONTENT_TYPE,
   metadata: function (req, file, cb) {
     cb(null, { fieldName: file.fieldname });
   },
   key: function (req, file, cb) {
     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
     cb(null, 'images/' + uniqueSuffix + '-' + file.originalname);
   },
 }),
});

const imageupload = async (req, res) => {
 const singleUpload = upload.single('image');
 singleUpload(req, res, (err) => {
   if (err) {
     // Directly send the error response if multer throws an error
     return res.status(httpStatus.BAD_REQUEST).json({
       message: `Error uploading file: ${err.message}`
     });
   }

   // If the file has been uploaded and multer-s3 has set the location, send success response
   if (req.file && req.file.location) {
     res.status(200).json({
       message: 'Image uploaded successfully',
       url: req.file.location
     });
   } else {
     // If there is no file or location, respond with an error
     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
       message: 'Failed to upload image. No file was uploaded or no location is available.'
     });
   }
 });
};


module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  imageupload
};