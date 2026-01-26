const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();
const passport = require('passport');
const authorize = require('../middlewares/authorize');


router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct   );
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct );    
module.exports = router;