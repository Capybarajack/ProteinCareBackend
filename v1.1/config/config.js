const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  mongoose: {
    url: process.env.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },
  jwt:{
    secret: process.env.JWT_SECRET,
    accessExpiration: process.env.ACCESS_TOKEN_EXPIRE,
    refreshExpiration: process.env.REFRESH_TOKEN_EXPIRE,
  },
  resetToken: {
    expiration: process.env.RESET_TOKEN_EXPIRE || '1h',
  },
  clientUrl: process.env.CLIENT_URL,
};