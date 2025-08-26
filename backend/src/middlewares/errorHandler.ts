import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Sunucu hatası';

  // Custom error handling
  if (err.message === 'Kullanıcı bulunamadı') {
    statusCode = 404;
    message = err.message;
  } else if (err.message === 'Geçersiz şifre') {
    statusCode = 401;
    message = err.message;
  } else if (err.message === 'Bu email adresi zaten kullanılıyor' || 
             err.message === 'Bu kullanıcı adı zaten kullanılıyor') {
    statusCode = 409; // Conflict
    message = err.message;
  } else if (err.message === 'Giriş işlemi sırasında bir hata oluştu' ||
             err.message === 'Kayıt işlemi sırasında bir hata oluştu') {
    statusCode = 500;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Geçersiz token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token süresi dolmuş';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
export { CustomError };