const express = require('express');
const postRoutes = require('./postRoutes');
const authRoutes = require('./authRoutes');
const propertyRoutes = require('./propertyRoutes');
const product = require('./productRoutes');
const visionRoutes = require('./visionRoutes');

const router = express.Router();

router.use('/posts', postRoutes);
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/products', product);
router.use('/vision', visionRoutes);

module.exports = router;
