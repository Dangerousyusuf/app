# 📋 LİSTE ÇEKME KILAVUZU

## 🤖 YAPAY ZEKA OTOMATİK LİSTE ÇEKME PROTOKOLÜ

**Bu dosya gösterildiğinde ve "liste çek" komutu verildiğinde yapay zeka otomatik olarak liste çekme işlemlerini gerçekleştirir.**

### 🎯 GENEL AMAÇ:
**Bu kılavuz sadece permissions için değil, TÜM liste çekme işlemleri için kullanılabilir:**
- 👥 **Users** (Kullanıcılar)
- 🔐 **Permissions** (İzinler) - *Örnek olarak kullanıldı*
- 👔 **Roles** (Roller)
- 📊 **Reports** (Raporlar)
- 🏢 **Organizations** (Organizasyonlar)
- 📝 **Posts** (Gönderiler)
- 💼 **Projects** (Projeler)
- Ve diğer tüm liste türleri...

**Permissions sadece ÖRNEK olarak gösterilmiştir. Aynı yapı tüm listeler için geçerlidir!**

### ⚡ HIZLI LİSTE ÇEKME TALİMATI (YAPAY ZEKA İÇİN)
**Kullanıcı "liste çek" dediğinde şu adımları sırayla uygula:**

1. **Backend Kontrol** → İlgili endpoint çalışıyor mu? (örn: /users, /permissions, /roles)
2. **Frontend Kontrol** → Service dosyası doğru URL'ye bağlanıyor mu?
3. **API Test** → Direkt API çağrısı yap
4. **Hata Analizi** → Varsa hataları tespit et ve çöz

**Not:** Permissions burada sadece örnek, aynı adımlar tüm liste türleri için geçerli.

---

## 🛠️ LİSTE ÇEKME SİSTEM MİMARİSİ

### 📊 Veri Akışı (Genel - Tüm Liste Türleri İçin):
```
Frontend (React Native) 
    ↓ HTTP Request
[Entity]Service (örn: UsersService, PermissionsService, RolesService)
    ↓ Axios Call
Backend API (Express.js)
    ↓ SQL Query
PostgreSQL Database
    ↓ Data Response
Frontend UI (Liste Görünümü)
```

### 🔧 Gerekli Dosyalar (Örnek: Permissions - Diğer Listeler İçin Benzer):
- ✅ `backend/src/controllers/[entity]/[entity]Controller.js` (örn: permissions/permissionsController.js)
- ✅ `backend/src/config/db.js` (Ortak database config)
- ✅ `frontend/src/services/[entity]Service.js` (örn: permissionsService.js)
- ✅ `frontend/src/context/AuthContext.js` (Ortak auth context)
- ✅ `backend/src/routes/[entity].js` (örn: permissions.js)

**Not:** [entity] yerine users, roles, reports vb. gelir. Yapı aynıdır.

---

## 🔍 LİSTE ÇEKME KONTROL LİSTESİ

### 🤖 YAPAY ZEKA KONTROL TALİMATLARI:
**Her liste çekme işleminde bu kontrolleri yap:**

### 1. Backend API Kontrolü (Genel - Herhangi Bir Liste İçin)
```powershell
# Örnek endpoint testleri:
# Permissions için:
Invoke-WebRequest -Uri "http://localhost:3000/api/permissions" -Headers @{"Authorization"="Bearer test"} -Method GET

# Users için:
Invoke-WebRequest -Uri "http://localhost:3000/api/users" -Headers @{"Authorization"="Bearer test"} -Method GET

# Roles için:
Invoke-WebRequest -Uri "http://localhost:3000/api/roles" -Headers @{"Authorization"="Bearer test"} -Method GET
```
**Beklenen Sonuç**: 200 OK + JSON data

### 2. Database Bağlantı Kontrolü
```javascript
// db.js dosyasında pool export kontrolü
module.exports = {
  pool,
  connectDB,
};
```
**Kritik**: `{ pool }` destructuring ile import edilmeli!

### 3. Frontend Service Kontrolü (Genel - Tüm Service Dosyaları İçin)
```javascript
// Herhangi bir service dosyasında URL kontrolü:
// permissionsService.js, usersService.js, rolesService.js vb.
API_BASE_URL = 'http://localhost:3000/api'; // Backend portu!
```
**Kritik**: API Gateway değil, direkt Backend! (Tüm service dosyaları için geçerli)

### 4. Authentication Kontrolü
```javascript
// AuthContext token kontrolü
const token = await authService.getToken();
if (token) {
  // API çağrısı yap
}
```

---

## 🚨 YAYGIN HATALAR VE ÇÖZÜMLERİ

### 🤖 YAPAY ZEKA HATA ÇÖZÜM TALİMATLARI:

### ❌ "pool.query is not a function" Hatası
**Sebep**: Yanlış import
```javascript
// YANLIŞ
const pool = require('../../config/db');

// DOĞRU
const { pool } = require('../../config/db');
```

### ❌ "Network request failed" Hatası
**Sebep**: Yanlış API URL
```javascript
// YANLIŞ
API_BASE_URL = 'http://localhost:3001/api/v1'; // API Gateway

// DOĞRU
API_BASE_URL = 'http://localhost:3000/api'; // Backend
```

### ❌ "Request failed with status code 500" Hatası
**Sebep**: Backend'te SQL veya kod hatası
**Çözüm**: Backend loglarını kontrol et

### ❌ "Access token gereklidir" Hatası
**Sebep**: Authorization header eksik
**Çözüm**: AuthContext token kontrolü

---

## 📝 LİSTE ÇEKME DOSYA YAPISI (Genel - Tüm Liste Türleri İçin)

### 🗂️ Backend Dosyaları (Örnek: Permissions - Diğer Listeler İçin Benzer):
```
backend/src/
├── controllers/
│   ├── permissions/
│   │   └── permissionsController.js    # Permissions controller
│   ├── users/
│   │   └── usersController.js          # Users controller
│   ├── roles/
│   │   └── rolesController.js          # Roles controller
│   └── [entity]/
│       └── [entity]Controller.js       # Diğer entity'ler
├── config/
│   └── db.js                           # Database pool (Ortak)
├── routes/
│   ├── permissions.js                  # Permissions routes
│   ├── users.js                        # Users routes
│   ├── roles.js                        # Roles routes
│   └── [entity].js                     # Diğer entity routes
└── middlewares/
    └── auth.js                         # Token doğrulama (Ortak)
```

### 🗂️ Frontend Dosyaları (Örnek: Permissions - Diğer Listeler İçin Benzer):
```
frontend/src/
├── services/
│   ├── permissionsService.js           # Permissions API çağrıları
│   ├── usersService.js                 # Users API çağrıları
│   ├── rolesService.js                 # Roles API çağrıları
│   ├── [entity]Service.js              # Diğer entity services
│   └── authService.js                  # Token yönetimi (Ortak)
├── context/
│   └── AuthContext.js                  # Global auth state (Ortak)
└── screens/
    ├── PermissionsScreen.js            # Permissions liste UI
    ├── UsersScreen.js                  # Users liste UI
    ├── RolesScreen.js                  # Roles liste UI
    └── [Entity]Screen.js               # Diğer entity screens
```

**Not:** Her entity için aynı yapı kullanılır. Sadece dosya isimleri değişir.

---

## 🔧 DOSYA İÇERİKLERİ

## 💻 KOD ÖRNEKLERİ (Genel - Tüm Liste Türleri İçin)

### 🔧 Backend Controller Şablonu ([entity]Controller.js):
```javascript
const { pool } = require('../../config/db'); // ✅ Doğru import (Ortak)
const { validationResult } = require('express-validator');

// Permissions örneği:
const getAllPermissions = async (req, res) => {
  try {
    const query = `
      SELECT id, key, description, module, created_at
      FROM permissions
      ORDER BY module, key
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      message: 'İzinler başarıyla getirildi',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('İzinler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İzinler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Users örneği:
const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT id, username, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      message: 'Kullanıcılar başarıyla getirildi',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Genel şablon (herhangi bir entity için):
const getAll[Entity] = async (req, res) => {
  try {
    const query = `
      SELECT * FROM [table_name]
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      message: '[Entity] başarıyla getirildi',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('[Entity] getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: '[Entity] getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getAllPermissions,
  getAllUsers,
  getAll[Entity],
  // diğer metodlar...
};
```

### 📄 permissionsController.js (Backend - Detaylı Örnek)

### 📄 Frontend Service Şablonu ([entity]Service.js):
```javascript
import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API base URL - Platform'a göre otomatik seçim (Tüm service dosyaları için aynı)
let API_BASE_URL;
if (Platform.OS === 'web') {
  // Web tarayıcı için localhost - Backend portu 3000
  API_BASE_URL = 'http://localhost:3000/api';
} else {
  // Expo Go ve gerçek cihazlar için IP adresi
  const debuggerHost = Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    API_BASE_URL = `http://${ip}:3000/api`;
  } else {
    // Fallback IP adresi - Backend portu 3000
    API_BASE_URL = 'http://172.20.10.5:3000/api';
  }
}

// Permissions Service Örneği:
class PermissionsService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAllPermissions(token) {
    try {
      const response = await this.api.get('/permissions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('İzinler getirme hatası:', error);
      throw error;
    }
  }
}

// Users Service Örneği:
class UsersService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAllUsers(token) {
    try {
      const response = await this.api.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Kullanıcılar getirme hatası:', error);
      throw error;
    }
  }
}

// Genel Service Şablonu:
class [Entity]Service {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAll[Entity](token) {
    try {
      const response = await this.api.get('/[entity_endpoint]', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('[Entity] getirme hatası:', error);
      throw error;
    }
  }
}

// Export örnekleri:
export default new PermissionsService();
// export default new UsersService();
// export default new [Entity]Service();
```

---

## 🎯 LİSTE ÇEKME TEST KOMUTLARI (Genel - Tüm Liste Türleri İçin)

### 🤖 YAPAY ZEKA TEST TALİMATLARI:
**"liste çek" komutu geldiğinde bu testleri çalıştır:**

### 1. Backend API Test (Herhangi Bir Entity İçin)
```powershell
# Permissions endpoint direkt test
Invoke-WebRequest -Uri "http://localhost:3000/api/permissions" -Headers @{"Authorization"="Bearer test"} -Method GET

# Users endpoint test
Invoke-WebRequest -Uri "http://localhost:3000/api/users" -Headers @{"Authorization"="Bearer test"} -Method GET

# Roles endpoint test
Invoke-WebRequest -Uri "http://localhost:3000/api/roles" -Headers @{"Authorization"="Bearer test"} -Method GET

# Genel şablon:
Invoke-WebRequest -Uri "http://localhost:3000/api/[entity_endpoint]" -Headers @{"Authorization"="Bearer test"} -Method GET
```

### 2. Database Bağlantı Test (Herhangi Bir Tablo İçin)
```powershell
# Backend loglarını kontrol et
# "PostgreSQL veritabanına başarıyla bağlandı" mesajını ara
```

### 3. Frontend Service Test (Genel - Tüm Entity'ler İçin)
```javascript
// Browser console'da permissions test
fetch('http://localhost:3000/api/permissions', {
  headers: { 'Authorization': 'Bearer test' }
})
.then(res => res.json())
.then(data => console.log(data));

// Browser console'da users test
fetch('http://localhost:3000/api/users', {
  headers: { 'Authorization': 'Bearer test' }
})
.then(res => res.json())
.then(data => console.log(data));

// Genel şablon:
fetch('http://localhost:3000/api/[entity_endpoint]', {
  headers: { 'Authorization': 'Bearer test' }
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 🔄 OTOMATİK LİSTE ÇEKME PROTOKOLÜ

### 🤖 YAPAY ZEKA LİSTE ÇEKME PROTOKOLÜ:
**Kullanıcı şu komutları verdiğinde otomatik kontrol et:**
- "liste çek"
- "permissions çek"
- "izinleri getir"
- "liste yükle"

### 📋 LİSTE ÇEKME ADIM LİSTESİ:
1. ✅ **Backend durumu kontrol** → Port 3000 aktif mi?
2. ✅ **Database bağlantısı kontrol** → PostgreSQL çalışıyor mu?
3. ✅ **API endpoint test** → /permissions yanıt veriyor mu?
4. ✅ **Frontend service kontrol** → Doğru URL kullanılıyor mu?
5. ✅ **Token kontrolü** → AuthContext token var mı?
6. ✅ **Network test** → API çağrısı başarılı mı?
7. ✅ **Hata analizi** → Varsa hataları tespit et
8. ✅ **Çözüm uygula** → Otomatik düzeltmeler yap

### 🎯 LİSTE ÇEKME KOŞULLARI:
- **Dosya**: `LIST_FETCH_GUIDE.md` (bu dosya)
- **Komutlar**: "liste çek", "permissions çek", "izinleri getir"
- **Lokasyon**: `d:\Users\Yusuf\Desktop\app\`
- **Gereksinimler**: Backend + Database aktif

---

## 🚦 LİSTE ÇEKME DURUM KODLARİ

### ✅ Başarılı Durumlar:
- **200 OK**: Liste başarıyla getirildi
- **Veri Formatı**: `{success: true, data: [...], count: N}`
- **Frontend Log**: "İzinler başarıyla yüklendi"

### ❌ Hata Durumları:
- **500 Internal Server Error**: Backend hatası
- **401 Unauthorized**: Token eksik/geçersiz
- **Network Error**: Bağlantı sorunu
- **CORS Error**: Cross-origin sorunu

---

## 📱 PLATFORM FARKLILIKLARI

### 🌐 Web Platform:
- **URL**: `http://localhost:3000/api`
- **CORS**: Backend'te ayarlanmalı
- **DevTools**: F12 ile console kontrol

### 📱 Mobile Platform (Expo):
- **URL**: `http://{IP}:3000/api`
- **Network**: Aynı WiFi ağında olmalı
- **Debug**: Expo DevTools kullan

---

## 🔧 ENVIRONMENT AYARLARI

### Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_jwt_secret
```

### Database (PostgreSQL)
```sql
-- Permissions tablosu
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Örnek veri
INSERT INTO permissions (key, description, module) VALUES
('can_manage_permissions', 'İzin yönetimi', 'permissions'),
('can_view_users', 'Kullanıcı görüntüleme', 'users');
```

---

## 📋 GELİŞTİRİCİ NOTLARI

### 🤖 YAPAY ZEKA İÇİN ÖNEMLİ NOTLAR:
- **Import Hatası**: `{ pool }` destructuring kullan!
- **URL Hatası**: API Gateway değil, Backend URL'i kullan!
- **Token Kontrolü**: Her API çağrısında Authorization header ekle
- **Platform Farkı**: Web ve mobile için farklı URL'ler
- **Error Handling**: Try-catch blokları ekle
- **Logging**: Console.log ile debug bilgileri

### 🎯 BAŞARI KRİTERLERİ:
- ✅ Backend: "İzinler başarıyla getirildi" response
- ✅ Frontend: Liste UI'da veriler görünür
- ✅ Console: Hata logu yok
- ✅ Network: 200 OK status code

### 🚨 KRİTİK HATALAR:
- ❌ `pool.query is not a function` → Import hatası
- ❌ `Network request failed` → URL hatası
- ❌ `Request failed with status code 500` → Backend hatası
- ❌ `Access token gereklidir` → Auth hatası

---

**Dosya Güncelleme Tarihi**: 4 Ağustos 2025  
**Liste Çekme Protokolü**: v1.0.0 (AI Optimized)  
**Durum**: ✅ Yapay Zeka Hazır  
**Tetikleyici**: "liste çek" komutu + bu dosya referansı