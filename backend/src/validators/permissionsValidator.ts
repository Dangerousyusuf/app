import { body, param, ValidationChain } from 'express-validator';

// İzin oluşturma validasyonu
const createPermissionValidation: ValidationChain[] = [
  body('key')
    .notEmpty()
    .withMessage('İzin anahtarı gereklidir')
    .isLength({ min: 3, max: 100 })
    .withMessage('İzin anahtarı 3-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('İzin anahtarı sadece harf, rakam, nokta, alt çizgi ve tire içerebilir'),
    
  body('description')
    .notEmpty()
    .withMessage('İzin açıklaması gereklidir')
    .isLength({ min: 5, max: 500 })
    .withMessage('İzin açıklaması 5-500 karakter arasında olmalıdır'),
    
  body('module')
    .notEmpty()
    .withMessage('Modül gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Modül 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Modül sadece harf, rakam, alt çizgi ve tire içerebilir')
];

// İzin güncelleme validasyonu
const updatePermissionValidation: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Geçerli bir izin ID\'si gereklidir'),
    
  body('key')
    .notEmpty()
    .withMessage('İzin anahtarı gereklidir')
    .isLength({ min: 3, max: 100 })
    .withMessage('İzin anahtarı 3-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('İzin anahtarı sadece harf, rakam, nokta, alt çizgi ve tire içerebilir'),
    
  body('description')
    .notEmpty()
    .withMessage('İzin açıklaması gereklidir')
    .isLength({ min: 5, max: 500 })
    .withMessage('İzin açıklaması 5-500 karakter arasında olmalıdır'),
    
  body('module')
    .notEmpty()
    .withMessage('Modül gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Modül 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Modül sadece harf, rakam, alt çizgi ve tire içerebilir')
];

// ID validasyonu
const idValidation: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Geçerli bir izin ID\'si gereklidir')
];

// Modül validasyonu
const moduleValidation: ValidationChain[] = [
  param('module')
    .notEmpty()
    .withMessage('Modül gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Modül 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Modül sadece harf, rakam, alt çizgi ve tire içerebilir')
];

export {
  createPermissionValidation,
  updatePermissionValidation,
  idValidation,
  moduleValidation
};