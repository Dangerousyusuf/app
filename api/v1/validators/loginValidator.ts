import { Request, Response, NextFunction } from 'express';
import ResponseFormatter from '../../utils/responseFormatter';

// Type definitions
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface RegisterRequestBody {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
}

interface LoginRequestBody {
  identifier: string;
  password: string;
}

// Form validasyon kuralları
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return 'Email adresi gereklidir';
  }
  
  if (!emailRegex.test(email)) {
    return 'Geçerli bir email adresi giriniz';
  }
  
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Şifre gereklidir';
  }
  
  if (password.length < 6) {
    return 'Şifre en az 6 karakter olmalıdır';
  }
  
  return null;
};

const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }
  
  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Express middleware for register validation
const validateRegister = (req: Request<{}, {}, RegisterRequestBody>, res: Response, next: NextFunction): void | Response => {
  const { user_name, first_name, last_name, email, password, phone } = req.body;
  const errors: Record<string, string> = {};
  
  // Required fields validation
  if (!user_name) errors.user_name = 'Kullanıcı adı gereklidir';
  if (!first_name) errors.first_name = 'Ad gereklidir';
  if (!last_name) errors.last_name = 'Soyad gereklidir';
  if (!email) errors.email = 'Email gereklidir';
  if (!password) errors.password = 'Şifre gereklidir';
  if (!phone) errors.phone = 'Telefon numarası gereklidir';
  
  // Email validation
  if (email) {
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
  }
  
  // Password validation
  if (password) {
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
  }
  
  // Phone validation
  if (phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      errors.phone = 'Geçerli bir telefon numarası giriniz (10-11 rakam)';
    }
  }
  
  if (Object.keys(errors).length > 0) {
    const validationErrors = Object.entries(errors).map(([field, message]) => ({ field, message }));
    return ResponseFormatter.validationError(res, validationErrors, 'Validasyon hatası');
  }
  
  next();
};

// Express middleware for login validation
const validateLogin = (req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction): void | Response => {
  const { identifier, password } = req.body;
  const errors: Record<string, string> = {};
  
  if (!identifier) {
    errors.identifier = 'Kullanıcı adı veya email gereklidir';
  }
  
  if (!password) {
    errors.password = 'Şifre gereklidir';
  }
  
  if (Object.keys(errors).length > 0) {
    const validationErrors = Object.entries(errors).map(([field, message]) => ({ field, message }));
    return ResponseFormatter.validationError(res, validationErrors, 'Validasyon hatası');
  }
  
  next();
};

export {
  validateEmail,
  validatePassword,
  validateLoginForm,
  validateRegister,
  validateLogin
};