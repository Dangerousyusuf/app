# Veri Güncelleme (Data Update) Genel Klavuzu

Bu klavuz, sistemde herhangi bir veri türü için güncelleme işleminin genel süreçlerini kapsar.

## 📋 Genel Bakış

Veri güncelleme işlemi, kullanıcıların sistemdeki mevcut kayıtları değiştirmesini sağlar. Bu süreç **herhangi bir entity** için geçerlidir:
- **Permissions** (İzinler)
- **Users** (Kullanıcılar) 
- **Roles** (Roller)
- **Reports** (Raporlar)
- **Clubs** (Kulüpler)
- **Settings** (Ayarlar)
- ve diğer tüm veri türleri...

## 🏗️ Genel Sistem Mimarisi

```
Frontend (Update[Entity]Screen)
    ↓ (Form Validation)
[Entity]Service
    ↓ (HTTP PUT Request)
Backend API (/api/[entity]/:id)
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
│   └── [entity]Controller.js        # update[Entity] metodu
├── routes/[entity]/
│   └── [entity]Routes.js            # PUT /api/[entity]/:id endpoint
├── validators/
│   └── [entity]Validator.js         # update[Entity]Validation
└── middlewares/
    └── auth.js                      # JWT token kontrolü
```

### Frontend Yapısı
```
frontend/src/
├── screens/[entity]/
│   └── Update[Entity]Screen.js      # Ana güncelleme form ekranı
└── services/
    └── [entity]Service.js           # API çağrıları
```

### Örnekler:
- **Permissions**: `permissionsController.js`, `UpdatePermissionScreen.js`
- **Users**: `usersController.js`, `UpdateUserScreen.js`
- **Roles**: `rolesController.js`, `UpdateRoleScreen.js`

## 🔧 Genel Kod Şablonları

### Backend Controller Şablonu

```javascript
// [entity]Controller.js
const update[Entity] = async (req, res) => {
  try {
    console.log('update[Entity] çağrıldı, id:', req.params.id, 'req.body:', req.body);
    
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
    
    const { id } = req.params;
    const { field1, field2, field3 } = req.body;
    
    // ID geçerliliği kontrolü
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ID'
      });
    }
    
    // Kayıt varlığı kontrolü
    const checkQuery = 'SELECT id FROM [table_name] WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kayıt bulunamadı'
      });
    }
    
    // Duplicate kontrolü (unique field varsa)
    const duplicateQuery = 'SELECT id FROM [table_name] WHERE [unique_field] = $1 AND id != $2';
    const duplicateResult = await pool.query(duplicateQuery, [field1, id]);
    
    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bu değer zaten başka bir kayıtta kullanılıyor'
      });
    }
    
    // Güncelleme işlemi
    const updateQuery = `
      UPDATE [table_name] 
      SET field1 = $1, field2 = $2, field3 = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [field1, field2, field3, id]);
    
    res.status(200).json({
      success: true,
      message: '[Entity] başarıyla güncellendi',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('[Entity] güncelleme hatası:', error);
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
  async update[Entity](id, [entity]Data, token) {
    try {
      const response = await this.api.put(`/[entity]/${id}`, [entity]Data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('[Entity] güncelleme hatası:', error);
      throw error;
    }
  }
}
```

### Frontend Form Handler Şablonu

```javascript
// Update[Entity]Screen.js
const handleUpdate[Entity] = async () => {
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

    const response = await [Entity]Service.update[Entity]([entity]Id, [entity]Data, token);
    
    if (response.success) {
      Alert.alert('Başarılı', response.message || '[Entity] başarıyla güncellendi.');
      navigation.goBack();
    }
  } catch (error) {
    // Detaylı hata yönetimi
    let errorMessage = '[Entity] güncellenirken bir hata oluştu.';
    
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
const update[Entity]Validation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Geçerli bir ID gereklidir'),
    
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
# Başarılı [entity] güncelleme
curl -X PUT http://localhost:3000/api/[entity]/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "field1": "updated_value1",
    "field2": "updated_value2",
    "field3": "updated_value3"
  }'

# Validation hatası testi
curl -X PUT http://localhost:3000/api/[entity]/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "field1": "invalid",
    "field2": "",
    "field3": null
  }'

# Geçersiz ID testi
curl -X PUT http://localhost:3000/api/[entity]/999 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "field1": "test_value1",
    "field2": "test_value2",
    "field3": "test_value3"
  }'
```

### Database Test Şablonu
```sql
-- Güncellenen kayıtları kontrol et
SELECT * FROM [table_name] WHERE id = 1;

-- Güncelleme öncesi ve sonrası karşılaştırma
SELECT * FROM [table_name] ORDER BY updated_at DESC LIMIT 5;
```

## 🔍 Genel Kontrol Listesi

### Backend Kontrolü
- [ ] PUT `/api/[entity]/:id` endpoint'i aktif mi?
- [ ] `update[Entity]Validation` middleware çalışıyor mu?
- [ ] JWT authentication kontrolü yapılıyor mu?
- [ ] ID parametresi doğru alınıyor mu?
- [ ] Kayıt varlığı kontrolü yapılıyor mu?
- [ ] Duplicate kontrolü çalışıyor mu? (gerekirse)
- [ ] Database güncelleme işlemi başarılı mı?

### Frontend Kontrolü
- [ ] `Update[Entity]Screen` yükleniyor mu?
- [ ] Mevcut veriler form alanlarına yükleniyor mu?
- [ ] Form alanları düzenlenebiliyor mu?
- [ ] Frontend validation aktif mi?
- [ ] API çağrısı doğru ID ile yapılıyor mu?
- [ ] Hata mesajları gösteriliyor mu?
- [ ] Başarılı işlem sonrası yönlendirme çalışıyor mu?

### Database Kontrolü
- [ ] `[table_name]` tablosu mevcut mu?
- [ ] ID kolonu primary key mi?
- [ ] Gerekli kolonlar var mı?
- [ ] Unique constraint'ler var mı? (gerekirse)
- [ ] `updated_at` kolonu güncelleniyor mu? (varsa)

## 🚨 Genel Hatalar ve Çözümleri

### 400 Bad Request
**Sebep**: Validation kurallarına uygun olmayan veri veya geçersiz ID
**Çözüm**: Frontend validation kurallarını backend ile uyumlu hale getir, ID kontrolü ekle

### 401 Unauthorized
**Sebep**: JWT token eksik veya geçersiz
**Çözüm**: Token'ın doğru gönderildiğini ve geçerli olduğunu kontrol et

### 404 Not Found
**Sebep**: Güncellenecek kayıt bulunamadı
**Çözüm**: ID'nin doğru olduğunu ve kaydın var olduğunu kontrol et

### 409 Conflict
**Sebep**: Duplicate kayıt (unique constraint ihlali)
**Çözüm**: Farklı değer kullan veya duplicate kontrolünü gözden geçir

### 500 Internal Server Error
**Sebep**: Database bağlantı hatası, SQL hatası veya sunucu hatası
**Çözüm**: Backend loglarını kontrol et, database bağlantısını doğrula, SQL sorgusunu kontrol et

## 📊 Adım Adım Uygulama Rehberi

### 1. Backend Güncelleme
```bash
# 1. Controller'da update metodu ekle
# backend/src/controllers/[entity]/[entity]Controller.js

# 2. Route'a PUT endpoint ekle
# backend/src/routes/[entity]/[entity]Routes.js

# 3. Validator'a update validation ekle
# backend/src/validators/[entity]Validator.js
```

### 2. Frontend Güncelleme
```bash
# 1. Update screen oluştur
# frontend/src/screens/[entity]/Update[Entity]Screen.js

# 2. Service'e update metodu ekle
# frontend/src/services/[entity]Service.js

# 3. Navigation'a update screen ekle
```

### 3. Database Hazırlama
```sql
-- updated_at kolonu ekle (yoksa)
ALTER TABLE [table_name] ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Trigger oluştur (otomatik updated_at güncellemesi için)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_[table_name]_updated_at BEFORE UPDATE
    ON [table_name] FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 📝 Gerçek Örnekler

### Permission Güncelleme Örneği
```javascript
// Backend - permissionsController.js
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, description, module } = req.body;
    
    // Kayıt varlığı kontrolü
    const checkQuery = 'SELECT id FROM permissions WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İzin bulunamadı'
      });
    }
    
    // Duplicate key kontrolü
    const duplicateQuery = 'SELECT id FROM permissions WHERE key = $1 AND id != $2';
    const duplicateResult = await pool.query(duplicateQuery, [key, id]);
    
    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bu anahtar zaten başka bir izinde kullanılıyor'
      });
    }
    
    // Güncelleme
    const updateQuery = `
      UPDATE permissions 
      SET key = $1, description = $2, module = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [key, description, module, id]);
    
    res.status(200).json({
      success: true,
      message: 'İzin başarıyla güncellendi',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('İzin güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İzin güncellenirken bir hata oluştu'
    });
  }
};
```

```javascript
// Frontend - UpdatePermissionScreen.js
const handleUpdatePermission = async () => {
  if (!key.trim()) {
    Alert.alert('Hata', 'Anahtar gereklidir.');
    return;
  }
  
  if (!/^[a-z_]+$/.test(key.trim())) {
    Alert.alert('Hata', 'Anahtar sadece küçük harf ve alt çizgi içerebilir.');
    return;
  }

  try {
    const permissionData = {
      key: key.trim(),
      description: description.trim(),
      module: module.trim()
    };

    const response = await PermissionsService.updatePermission(permissionId, permissionData, token);
    
    if (response.success) {
      Alert.alert('Başarılı', 'İzin başarıyla güncellendi.');
      navigation.goBack();
    }
  } catch (error) {
    let errorMessage = 'İzin güncellenirken bir hata oluştu.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    Alert.alert('Hata', errorMessage);
  }
};
```

### User Güncelleme Örneği
```javascript
// Backend - usersController.js
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    
    // Email duplicate kontrolü
    const duplicateQuery = 'SELECT id FROM users WHERE email = $1 AND id != $2';
    const duplicateResult = await pool.query(duplicateQuery, [email, id]);
    
    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }
    
    const updateQuery = `
      UPDATE users 
      SET username = $1, email = $2, role = $3
      WHERE id = $4
      RETURNING id, username, email, role, created_at
    `;
    
    const result = await pool.query(updateQuery, [username, email, role, id]);
    
    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken bir hata oluştu'
    });
  }
};
```

## 🔐 Güvenlik Standartları

- **Authentication**: Her istekte JWT token kontrolü
- **Authorization**: Kullanıcının güncelleme yetkisi kontrolü
- **Validation**: Hem frontend hem backend'de input validation
- **Sanitization**: XSS koruması için input temizleme
- **SQL Injection**: Parametreli query'ler kullanma
- **Rate Limiting**: API endpoint'lerinde istek sınırlaması
- **Audit Trail**: Güncelleme işlemlerini loglama

## 📈 Performans İpuçları

1. **Frontend**: Real-time validation ve optimistic updates
2. **Backend**: Database query optimizasyonu ve indexleme
3. **Database**: Gerekli index'leri ekleme ve query plan analizi
4. **API**: Response time monitoring ve caching
5. **Network**: Request payload optimizasyonu

## 🔄 Optimistic vs Pessimistic Updates

### Optimistic Update
```javascript
// Frontend'de hemen güncelle, hata varsa geri al
const handleOptimisticUpdate = async () => {
  // UI'ı hemen güncelle
  setLocalData(newData);
  
  try {
    await [Entity]Service.update[Entity](id, newData, token);
  } catch (error) {
    // Hata varsa eski veriyi geri yükle
    setLocalData(oldData);
    Alert.alert('Hata', 'Güncelleme başarısız.');
  }
};
```

### Pessimistic Update
```javascript
// Önce API çağrısı yap, başarılıysa UI'ı güncelle
const handlePessimisticUpdate = async () => {
  try {
    const response = await [Entity]Service.update[Entity](id, newData, token);
    if (response.success) {
      setLocalData(response.data);
    }
  } catch (error) {
    Alert.alert('Hata', 'Güncelleme başarısız.');
  }
};
```

## 📱 Platform Farklılıkları

### Web Platform
- **Form Validation**: HTML5 validation + custom validation
- **File Upload**: FileReader API kullanımı
- **Navigation**: React Router ile route parametreleri

### Mobile Platform (React Native)
- **Form Validation**: Custom validation hooks
- **File Upload**: ImagePicker ve DocumentPicker
- **Navigation**: React Navigation ile params

## 🧪 Test Stratejileri

### Unit Tests
```javascript
// Backend controller test
describe('update[Entity]', () => {
  it('should update [entity] successfully', async () => {
    const req = { params: { id: 1 }, body: { field1: 'new_value' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    await update[Entity](req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: '[Entity] başarıyla güncellendi',
      data: expect.any(Object)
    });
  });
});
```

### Integration Tests
```javascript
// API endpoint test
describe('PUT /api/[entity]/:id', () => {
  it('should update [entity] with valid data', async () => {
    const response = await request(app)
      .put('/api/[entity]/1')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ field1: 'updated_value' })
      .expect(200);
      
    expect(response.body.success).toBe(true);
  });
});
```

### E2E Tests
```javascript
// Frontend form test
describe('Update[Entity]Screen', () => {
  it('should update [entity] when form is submitted', async () => {
    render(<Update[Entity]Screen route={{ params: { id: 1 } }} />);
    
    fireEvent.changeText(screen.getByTestId('field1-input'), 'new_value');
    fireEvent.press(screen.getByTestId('update-button'));
    
    await waitFor(() => {
      expect(screen.getByText('Başarılı')).toBeTruthy();
    });
  });
});
```

## 📋 Troubleshooting Checklist

### Backend Sorunları
- [ ] Route doğru tanımlanmış mı? (`PUT /api/[entity]/:id`)
- [ ] Controller metodu export edilmiş mi?
- [ ] Validation middleware uygulanmış mı?
- [ ] Database bağlantısı çalışıyor mu?
- [ ] SQL sorgusu doğru mu?
- [ ] Error handling yapılmış mı?

### Frontend Sorunları
- [ ] Service metodu doğru URL'ye çağrı yapıyor mu?
- [ ] Authorization header gönderiliyor mu?
- [ ] Form validation çalışıyor mu?
- [ ] Error handling yapılmış mı?
- [ ] Navigation parametreleri doğru mu?
- [ ] State management doğru mu?

### Database Sorunları
- [ ] Tablo ve kolonlar mevcut mu?
- [ ] Primary key constraint'i var mı?
- [ ] Unique constraint'ler doğru mu?
- [ ] Index'ler optimize mi?
- [ ] Trigger'lar çalışıyor mu?

Bu klavuz, **herhangi bir veri türü** için güncelleme işleminin genel çerçevesini sağlar. Permission ve User örnekleri sadece referans olarak kullanılmıştır.