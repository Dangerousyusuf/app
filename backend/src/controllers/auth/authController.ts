import { Request, Response, NextFunction } from 'express';
import { authServiceInstance } from '../../services/auth';
import { LoginRequest, RegisterRequest, RegisterInput } from '../../types/auth';

const login = async (req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    // Validation
    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Kullanıcı bilgisi ve şifre gereklidir',
      });
      return;
    }

    // Call service
    const result = await authServiceInstance.authenticateUser(identifier, password);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Login endpoint hatası:', error.message);
    console.error('Hata stack:', error.stack);
    
    // Hata yanıtını düzenle
    res.status(500).json({
      success: false,
      message: error.message || 'Giriş işlemi sırasında bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const register = async (req: Request<{}, {}, RegisterRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Register endpoint çağrıldı, request body:', req.body);
    
    const { 
      user_name, 
      first_name, 
      last_name, 
      email, 
      phone, 
      password, 
      gender, 
      tc, 
      birth_date, 
      role 
    } = req.body;
    
    // Validation
    if (!user_name || !first_name || !last_name || !email || !phone || !password) {
      console.log('Validasyon hatası: Zorunlu alanlar eksik');
      res.status(400).json({
        success: false,
        message: 'Zorunlu alanlar eksik (kullanıcı adı, ad, soyad, email, telefon, şifre)',
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validasyon hatası: Geçersiz email formatı');
      res.status(400).json({
        success: false,
        message: 'Geçerli bir email adresi giriniz',
      });
      return;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      console.log('Validasyon hatası: Geçersiz telefon numarası formatı');
      res.status(400).json({
        success: false,
        message: 'Geçerli bir telefon numarası giriniz (10-11 rakam)',
      });
      return;
    }

    console.log('Validasyon başarılı, authService.registerUser çağrılıyor');
    
    // Call service
    const userData: RegisterInput = {
      user_name,
      first_name,
      last_name,
      email,
      phone,
      password,
      ...(gender && { gender }),
      ...(tc && { tc }),
      ...(birth_date && { birth_date }),
      ...(role && { role })
    };
    
    console.log('authService.registerUser için gönderilen veri:', userData);
    
    const result = await authServiceInstance.registerUser(userData);
    
    console.log('Kayıt başarılı, dönen sonuç:', result);

    res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Gelecekte implement edilecek
    res.status(200).json({
      success: true,
      message: 'Başarıyla çıkış yapıldı',
    });
  } catch (error: any) {
    next(error);
  }
};

export {
  login,
  register,
  logout,
};