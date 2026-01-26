const express = require('express');
const postController = require('../controllers/postController');
const passport = require('passport');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.get('/protected', 
    passport.authenticate('jwt', { session: false }),
    postController.getPosts);
router.get('/protectedadmin', 
    passport.authenticate('jwt', { session: false }),
    authorize(['admin']),
    postController.getPosts);
router.get('/:id', postController.getPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;