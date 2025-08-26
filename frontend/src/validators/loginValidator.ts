// Form validasyon kuralları
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return 'Email adresi gereklidir';
  }
  
  if (!emailRegex.test(email)) {
    return 'Geçerli bir email adresi giriniz';
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Şifre gereklidir';
  }
  
  if (password.length < 6) {
    return 'Şifre en az 6 karakter olmalıdır';
  }
  
  return null;
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
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