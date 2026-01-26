const express = require('express');
const postRoutes = require('./postRoutes');
const authRoutes = require('./authRoutes');
const propertyRoutes = require('./propertyRoutes');
const product = require('./productRoutes');
const router = express.Router();

router.use('/posts', postRoutes);
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/products', product);

module.exports = router;