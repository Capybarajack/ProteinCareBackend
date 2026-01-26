const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Implement logout logic here
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;