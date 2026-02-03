const express = require('express');
const propertyController = require('../controllers/propertyController');
const router = express.Router();
const passport = require('passport');
const authorize = require('../middlewares/authorize');


router.post('/', propertyController.createProperty);
router.post('/imageupload', propertyController.imageupload);
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getProperty   );
router.put('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty );

module.exports = router;