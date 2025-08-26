# Veri Kaydetme (Data Create) Genel Klavuzu

Bu klavuz, sistemde herhangi bir veri türü için kaydetme işleminin genel süreçlerini kapsar.

## 📋 Genel Bakış

Veri kaydetme işlemi, kullanıcıların sisteme yeni kayıtlar eklemesini sağlar. Bu süreç **herhangi bir entity** için geçerlidir:
- **Permissions** (İzinler)
- **Users** (Kullanıcılar) 
- **Roles** (Roller)
- **Reports** (Raporlar)
- **Clubs** (Kulüpler)
- **Settings** (Ayarlar)
- ve diğer tüm veri türleri...

## 🏗️ Genel Sistem Mimarisi

```
Frontend (Create[Entity]Screen)
    ↓ (Form Validation)
[Entity]Service
    ↓ (HTTP POST Request)
Backend API (/api/[entity])
    ↓ (Validation + Authentication)
[Entity]Controller
    ↓ (Database Operations)
PostgreSQL Database
```

## 📁 Genel Dosya Yapısı

### Backend Yapısı
```
backend/src/
├── controllers/[entity]/
│   └── [entity]Controller.js        # create[Entity] metodu
├── routes/[entity]/
│   └── [entity]Routes.js            # POST /api/[entity] endpoint
├── validators/
│   └── [entity]Validator.js         # create[Entity]Validation
└── middlewares/
    └── auth.js                      # JWT token kontrolü
```

### Frontend Yapısı
```
frontend/src/
├── screens/[entity]/
│   └── Create[Entity]Screen.js      # Ana form ekranı
└── services/
    └── [entity]Service.js           # API çağrıları
```

### Örnekler:
- **Permissions**: `permissionsController.js`, `CreatePermissionScreen.js`
- **Users**: `usersController.js`, `CreateUserScreen.js`
- **Roles**: `rolesController.js`, `CreateRoleScreen.js`

## 🔧 Genel Kod Şablonları

### Backend Controller Şablonu

```javascript
// [entity]Controller.js
const create[Entity] = async (req, res) => {
  try {
    console.log('create[Entity] çağrıldı, req.body:', req.body);
    
    // Validation hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation hataları:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veri',
        errors: errors.array()
      });
    }
    
    const { field1, field2, field3 } = req.body;
    
    // Duplicate kontrolü (gerekirse)
    const checkQuery = 'SELECT id FROM [table_name] WHERE [unique_field] = $1';
    const checkResult = await pool.query(checkQuery, [field1]);
    
    if (checkResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bu kayıt zaten mevcut'
      });
    }
    
    // Yeni kayıt oluştur
    const insertQuery = `
      INSERT INTO [table_name] (field1, field2, field3, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [field1, field2, field3]);
    
    res.status(201).json({
      success: true,
      message: '[Entity] başarıyla oluşturuldu',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('[Entity] oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};
```

### Frontend Service Şablonu

```javascript
// [entity]Service.js
class [Entity]Service {
  async create[Entity]([entity]Data, token) {
    try {
      const response = await this.api.post('/[entity]', [entity]Data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('[Entity] oluşturma hatası:', error);
      throw error;
    }
  }
}
```

### Frontend Form Handler Şablonu

```javascript
// Create[Entity]Screen.js
const handleCreate[Entity] = async () => {
  // Frontend validation
  if (!field1.trim()) {
    Alert.alert('Hata', 'Field1 gereklidir.');
    return;
  }
  
  if (field1.trim().length < MIN_LENGTH || field1.trim().length > MAX_LENGTH) {
    Alert.alert('Hata', `Field1 ${MIN_LENGTH}-${MAX_LENGTH} karakter arasında olmalıdır.`);
    return;
  }
  
  // Regex validation (gerekirse)
  if (!/^[ALLOWED_PATTERN]+$/.test(field1.trim())) {
    Alert.alert('Hata', 'Field1 geçersiz karakterler içeriyor.');
    return;
  }

  try {
    const [entity]Data = {
      field1: field1.trim(),
      field2: field2.trim(),
      field3: field3
    };

    const response = await [Entity]Service.create[Entity]([entity]Data, token);
    
    if (response.success) {
      Alert.alert('Başarılı', response.message || '[Entity] başarıyla oluşturuldu.');
      navigation.goBack();
    }
  } catch (error) {
    // Detaylı hata yönetimi
    let errorMessage = '[Entity] oluşturulurken bir hata oluştu.';
    
    if (error.response && error.response.data) {
      if (error.response.data.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors.map(err => err.msg).join('\n');
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    Alert.alert('Hata', errorMessage);
  }
};
```

## ✅ Genel Validation Şablonu

### Backend Validation Şablonu

```javascript
// [entity]Validator.js
const create[Entity]Validation = [
  body('field1')
    .notEmpty()
    .withMessage('Field1 gereklidir')
    .isLength({ min: MIN_LENGTH, max: MAX_LENGTH })
    .withMessage(`Field1 ${MIN_LENGTH}-${MAX_LENGTH} karakter arasında olmalıdır`)
    .matches(/^[ALLOWED_PATTERN]+$/)
    .withMessage('Field1 geçersiz karakterler içeriyor'),
    
  body('field2')
    .notEmpty()
    .withMessage('Field2 gereklidir')
    .isLength({ min: MIN_LENGTH, max: MAX_LENGTH })
    .withMessage(`Field2 ${MIN_LENGTH}-${MAX_LENGTH} karakter arasında olmalıdır`),
    
  body('field3')
    .notEmpty()
    .withMessage('Field3 gereklidir')
];
```

## 🧪 Genel Test Şablonları

### Backend API Test Şablonu
```bash
# Başarılı [entity] oluşturma
curl -X POST http://localhost:3000/api/[entity] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "field1": "test_value1",
    "field2": "test_value2",
    "field3": "test_value3"
  }'

# Validation hatası testi
curl -X POST http://localhost:3000/api/[entity] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "field1": "invalid",
    "field2": "",
    "field3": null
  }'
```

### Database Test Şablonu
```sql
-- Oluşturulan kayıtları kontrol et
SELECT * FROM [table_name] ORDER BY created_at DESC LIMIT 5;

-- Belirli kriterdeki kayıtları listele
SELECT * FROM [table_name] WHERE field1 = 'test_value';
```

## 🔍 Genel Kontrol Listesi

### Backend Kontrolü
- [ ] POST `/api/[entity]` endpoint'i aktif mi?
- [ ] `create[Entity]Validation` middleware çalışıyor mu?
- [ ] JWT authentication kontrolü yapılıyor mu?
- [ ] Database bağlantısı çalışıyor mu?
- [ ] Validation hataları doğru dönüyor mu?
- [ ] Duplicate kontrolü çalışıyor mu? (gerekirse)

### Frontend Kontrolü
- [ ] `Create[Entity]Screen` yükleniyor mu?
- [ ] Form alanları çalışıyor mu?
- [ ] Frontend validation aktif mi?
- [ ] API çağrısı yapılıyor mu?
- [ ] Hata mesajları gösteriliyor mu?
- [ ] Başarılı işlem sonrası yönlendirme çalışıyor mu?

### Database Kontrolü
- [ ] `[table_name]` tablosu mevcut mu?
- [ ] Gerekli kolonlar var mı?
- [ ] Unique constraint'ler var mı? (gerekirse)
- [ ] Timestamp alanları (`created_at`, `updated_at`) çalışıyor mu?

## 🚨 Genel Hatalar ve Çözümleri

### 400 Bad Request
**Sebep**: Validation kurallarına uygun olmayan veri
**Çözüm**: Frontend validation kurallarını backend ile uyumlu hale getir

### 401 Unauthorized
**Sebep**: JWT token eksik veya geçersiz
**Çözüm**: Token'ın doğru gönderildiğini ve geçerli olduğunu kontrol et

### 409 Conflict
**Sebep**: Duplicate kayıt (unique constraint ihlali)
**Çözüm**: Farklı değer kullan veya mevcut kaydı güncelle

### 500 Internal Server Error
**Sebep**: Database bağlantı hatası veya sunucu hatası
**Çözüm**: Backend loglarını kontrol et, database bağlantısını doğrula

## 📊 Adım Adım Uygulama Rehberi

### 1. Backend Oluşturma
```bash
# 1. Controller oluştur
touch backend/src/controllers/[entity]/[entity]Controller.js

# 2. Route oluştur
touch backend/src/routes/[entity]/[entity]Routes.js

# 3. Validator oluştur
touch backend/src/validators/[entity]Validator.js
```

### 2. Frontend Oluşturma
```bash
# 1. Screen oluştur
touch frontend/src/screens/[entity]/Create[Entity]Screen.js

# 2. Service oluştur (yoksa)
touch frontend/src/services/[entity]Service.js
```

### 3. Database Hazırlama
```sql
-- Tablo oluştur
CREATE TABLE [table_name] (
  id SERIAL PRIMARY KEY,
  field1 VARCHAR(100) NOT NULL,
  field2 TEXT NOT NULL,
  field3 VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Unique constraint ekle (gerekirse)
ALTER TABLE [table_name] ADD CONSTRAINT unique_field1 UNIQUE (field1);
```

## 📝 Gerçek Örnekler

### Permission Örneği (Mevcut)
- **Controller**: `permissionsController.js` → `createPermission`
- **Route**: `/api/permissions` → POST
- **Screen**: `CreatePermissionScreen.js`
- **Fields**: `key`, `description`, `module`

### User Örneği (Gelecek)
- **Controller**: `usersController.js` → `createUser`
- **Route**: `/api/users` → POST
- **Screen**: `CreateUserScreen.js`
- **Fields**: `username`, `email`, `password`, `role`

### Role Örneği (Gelecek)
- **Controller**: `rolesController.js` → `createRole`
- **Route**: `/api/roles` → POST
- **Screen**: `CreateRoleScreen.js`
- **Fields**: `name`, `description`, `permissions[]`

## 🔐 Güvenlik Standartları

- **Authentication**: Her istekte JWT token kontrolü
- **Validation**: Hem frontend hem backend'de input validation
- **Sanitization**: XSS koruması için input temizleme
- **SQL Injection**: Parametreli query'ler kullanma
- **Rate Limiting**: API endpoint'lerinde istek sınırlaması

## 📈 Performans İpuçları

1. **Frontend**: Real-time validation
2. **Backend**: Database query optimizasyonu
3. **Database**: Gerekli index'leri ekleme
4. **API**: Response time monitoring
5. **Caching**: Sık kullanılan verileri cache'leme

Bu klavuz, **herhangi bir veri türü** için kaydetme işleminin genel çerçevesini sağlar. Permission sadece bir örnek olarak kullanılmıştır.