import jwt from 'jsonwebtoken';

const generateToken = (userId: number): string => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required for security');
  }
  
  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: '30d',
  });
};

export default generateToken;