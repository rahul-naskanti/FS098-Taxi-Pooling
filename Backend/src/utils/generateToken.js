const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, accountType: role },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d' // Token expires in 30 days
    }
  );
};

module.exports = generateToken;
