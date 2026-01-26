const jwt = require('jsonwebtoken');
const ms = require('ms');
const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const config = require('../config/config');
const emailService = require('./emailService');

const generateToken = (userId, type) => {
    const expiresIn = type === 'access' ? config.jwt.accessExpiration : config.jwt.refreshExpiration;
    return jwt.sign({ userId, type }, config.jwt.secret, { expiresIn });
  };

const saveToken = async (userId, token, type) => {
  const expiresAt = new Date();
  if (type === 'access') {
    // Parse the access token expiration time
    const accessExpireTime = ms(config.jwt.accessExpiration);
    expiresAt.setMilliseconds(expiresAt.getMilliseconds() + accessExpireTime);
  } else {
    // Parse the refresh token expiration time
    const refreshExpireTime = ms(config.jwt.refreshExpiration);
    expiresAt.setMilliseconds(expiresAt.getMilliseconds() + refreshExpireTime);
  }

  await Token.create({
    userId,
    token,
    type,
    expiresAt,
  });
};

const register = async (userData) => {
  const user = await User.create(userData);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  await saveToken(user._id, verificationToken, 'verify');
  
  await emailService.sendVerificationEmail(user.email, verificationToken);

  return { user };
};

const verifyEmail = async (token) => {
  const savedToken = await Token.findOne({ token, type: 'verify' });
  if (!savedToken) {
    throw new Error('Invalid or expired verification token');
  }

  const user = await User.findById(savedToken.userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.isVerified = true;
  await user.save();

  await Token.deleteOne({ _id: savedToken._id });

  return user;
};

const login = async (user) => {
  const accessToken = generateToken(user._id, 'access');
  const refreshToken = generateToken(user._id, 'refresh');

  await saveToken(user._id, accessToken, 'access');
  await saveToken(user._id, refreshToken, 'refresh');

  return { user, accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, config.jwt.secret);
  const token = await Token.findOne({ userId: decoded.userId, token: refreshToken, type: 'refresh' });

  if (!token) {
    throw new Error('Invalid refresh token');
  }

  const accessToken = generateToken(decoded.userId, 'access');
  await saveToken(decoded.userId, accessToken, 'access');

  return accessToken;
};

const generateResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

  await Token.create({
    userId: user._id,
    token: hash,
    type: 'reset',
    expiresAt: new Date(Date.now() + ms(config.resetToken.expiration)),
  });

  return resetToken; // This unhashed token is sent to the user's email
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const passwordResetToken = await Token.findOne({ 
    token: hashedToken, 
    type: 'reset',
    expiresAt: { $gt: Date.now() }
  });

  if (!passwordResetToken) {
    throw new Error('Invalid or expired password reset token');
  }

  const user = await User.findById(passwordResetToken.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Delete the used token
  await Token.deleteOne({ _id: passwordResetToken._id });

  return user;
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshAccessToken,
  generateResetToken,
  resetPassword
};