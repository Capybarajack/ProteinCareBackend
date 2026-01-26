const express = require('express');
const postRoutes = require('./postRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.use('/posts', postRoutes);
router.use('/auth', authRoutes);

module.exports = router;