const passport = require('passport');
const authService = require('../services/authService');
const emailService = require('../services/emailService');

const register = async (req, res) => {
  try {
    const { user } = await authService.register(req.body);
    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.', user: { email: user.email } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await authService.verifyEmail(token);
    res.json({ message: 'Email verified successfully', user: { email: user.email } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    try {
      const { accessToken, refreshToken } = await authService.login(user);
      res.json({ user: { email: user.email, role: user.role }, accessToken, refreshToken });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })(req, res, next);
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const accessToken = await authService.refreshAccessToken(refreshToken);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetToken = await authService.generateResetToken(email);
    await emailService.sendPasswordResetEmail(email, resetToken);
    // Here you would typically send an email with the reset token
    res.json({ message: 'Reset token generated and sent to email' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await authService.resetPassword(token, newPassword);
    res.json({ message: 'Password reset successfully', user: { email: user.email } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  resetPassword
};