const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }  // Access token expires in 15 minutes
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }  // Refresh token expires in 7 days
  );

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
