# JavaScript'ten TypeScript'e Dönüştürme Klavuzu

Bu klavuz, mevcut JavaScript dosyalarını TypeScript'e dönüştürme sürecinin detaylı adımlarını kapsar.

## 📋 Genel Bakış

JavaScript'ten TypeScript'e dönüştürme işlemi, kod güvenliğini artırmak ve tip kontrolü sağlamak için kritik bir süreçtir. Bu süreç **herhangi bir JavaScript dosyası** için geçerlidir:
- **Controllers** (Kontrolcüler)
- **Services** (Servisler)
- **Routes** (Rotalar)
- **Middlewares** (Ara yazılımlar)
- **Validators** (Doğrulayıcılar)
- **Utils** (Yardımcı fonksiyonlar)
- ve diğer tüm JavaScript modülleri...

## 🏗️ Dönüştürme Mimarisi

```
JavaScript Dosyası (.js)
    ↓ (Tip Tanımları Ekleme)
TypeScript Dosyası (.ts/.tsx)
    ↓ (Import/Export Güncelleme)
Bağımlılık Güncellemeleri
    ↓ (Konfigürasyon)
TSConfig & Package.json
    ↓ (Test & Çalıştırma)
Çalışan TypeScript Uygulaması
```

## 📁 Dosya Yapısı ve Uzantılar

### Backend Yapısı
```
backend/src/
├── controllers/[entity]/
│   ├── [entity]Controller.js → [entity]Controller.ts
│   └── index.js → index.ts
├── services/[entity]/
│   ├── [entity]Service.js → [entity]Service.ts
│   └── index.js → index.ts
├── routes/[entity]/
│   └── [entity]Routes.js → [entity]Routes.ts
├── types/
│   └── [entity].ts                    # YENİ - Tip tanımları
├── middlewares/
│   └── auth.js → auth.ts
└── validators/
    └── [entity]Validator.js → [entity]Validator.ts
```

### Frontend Yapısı
```
frontend/src/
├── screens/[entity]/
│   └── [Entity]Screen.js → [Entity]Screen.tsx
├── components/
│   └── [Component].js → [Component].tsx
├── services/
│   └── [entity]Service.js → [entity]Service.ts
└── types/
    └── [entity].ts                    # YENİ - Tip tanımları
```

## 🔧 Adım Adım Dönüştürme Süreci

### 0. Import/Export Uyumsuzluk Tespiti

#### A. Mevcut Dosyaları Analiz Et
```bash
# CommonJS export kullanan dosyaları bul
grep -r "module.exports" src/
grep -r "exports." src/

# ES6 import kullanan dosyaları bul
grep -r "import.*from" src/
grep -r "import {" src/

# Mixed kullanım tespiti
grep -l "require" src/**/*.ts | xargs grep -l "import.*from"
```

#### B. Uyumsuzluk Matrisi Oluştur
```
Dosya Adı          | Export Tipi | Import Tipi | Uyumsuzluk
-------------------|-------------|-------------|------------
generateToken.js   | CommonJS    | ES6         | ❌ EVET
authService.ts     | ES6         | Mixed       | ❌ EVET
db.js             | CommonJS    | CommonJS    | ✅ YOK
```

#### C. Kritik Uyumsuzlukları Tespit Et
- **"is not a function" Riski**: CommonJS export + ES6 import
- **Mixed Module Riski**: Aynı dosyada require + import
- **Path Resolution Riski**: .js uzantısı olmayan import'lar

#### D. Çözüm Stratejisi Belirle
1. **Tümünü CommonJS'e çevir** (Hızlı çözüm)
2. **Tümünü ES6'ya çevir** (Uzun vadeli çözüm)
3. **Hibrit yaklaşım** (Kademeli geçiş)

### 1. Ön Hazırlık

#### A. TypeScript Bağımlılıklarını Kontrol Et
```bash
# Backend için
cd backend
npm list typescript ts-node @types/node @types/express

# Frontend için
cd frontend
npm list typescript @types/react @types/react-native
```

#### B. TSConfig Dosyasını Kontrol Et
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2. Tip Tanımları Oluşturma

#### A. Entity Tiplerini Tanımla
```typescript
// types/[entity].ts
import { Request } from 'express';

// Ana entity interface'i
export interface [Entity] {
  id: number;
  field1: string;
  field2: string;
  field3?: string; // Opsiyonel alan
  created_at: Date;
  updated_at: Date;
}

// Create için input tipi
export interface Create[Entity]Input {
  field1: string;
  field2: string;
  field3?: string;
}

// Update için input tipi
export interface Update[Entity]Input {
  field1?: string;
  field2?: string;
  field3?: string;
}

// API Response tipi
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// Authenticated Request tipi
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
  };
}

// Service Interface
export interface [Entity]ServiceInterface {
  get[Entity]ById(id: number): Promise<[Entity] | null>;
  create[Entity](data: Create[Entity]Input): Promise<[Entity]>;
  update[Entity](id: number, data: Update[Entity]Input): Promise<[Entity] | null>;
  delete[Entity](id: number): Promise<boolean>;
}
```

### 3. Controller Dönüştürme

#### A. JavaScript Controller Örneği
```javascript
// [entity]Controller.js (ÖNCE)
const { validationResult } = require('express-validator');
const pool = require('../../config/database');

const create[Entity] = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veri',
        errors: errors.array()
      });
    }
    
    const { field1, field2 } = req.body;
    
    const insertQuery = `
      INSERT INTO [table_name] (field1, field2, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [field1, field2]);
    
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

module.exports = {
  create[Entity]
};
```

#### B. TypeScript Controller Örneği
```typescript
// [entity]Controller.ts (SONRA)
import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../../config/database';
import { 
  AuthenticatedRequest, 
  ApiResponse, 
  [Entity], 
  Create[Entity]Input 
} from '../../types/[entity]';

export const create[Entity] = async (
  req: AuthenticatedRequest, 
  res: Response<ApiResponse<[Entity]>>, 
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz veri',
        errors: errors.array()
      });
      return;
    }
    
    const { field1, field2 }: Create[Entity]Input = req.body;
    
    const insertQuery = `
      INSERT INTO [table_name] (field1, field2, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [field1, field2]);
    
    res.status(201).json({
      success: true,
      message: '[Entity] başarıyla oluşturuldu',
      data: result.rows[0] as [Entity]
    });
    
  } catch (error) {
    console.error('[Entity] oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// Named export
export { create[Entity] };

// Default export
export default {
  create[Entity]
};
```

### 4. Service Dönüştürme

#### A. JavaScript Service Örneği
```javascript
// [entity]Service.js (ÖNCE)
const pool = require('../../config/database');

class [Entity]Service {
  async get[Entity]ById(id) {
    const query = 'SELECT * FROM [table_name] WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  
  async create[Entity](data) {
    const { field1, field2 } = data;
    const query = `
      INSERT INTO [table_name] (field1, field2, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [field1, field2]);
    return result.rows[0];
  }
}

module.exports = new [Entity]Service();
```

#### B. TypeScript Service Örneği
```typescript
// [entity]Service.ts (SONRA)
import { pool } from '../../config/database';
import { 
  [Entity], 
  Create[Entity]Input, 
  Update[Entity]Input, 
  [Entity]ServiceInterface 
} from '../../types/[entity]';

class [Entity]Service implements [Entity]ServiceInterface {
  async get[Entity]ById(id: number): Promise<[Entity] | null> {
    const query = 'SELECT * FROM [table_name] WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] as [Entity] || null;
  }
  
  async create[Entity](data: Create[Entity]Input): Promise<[Entity]> {
    const { field1, field2 } = data;
    const query = `
      INSERT INTO [table_name] (field1, field2, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [field1, field2]);
    return result.rows[0] as [Entity];
  }
  
  async update[Entity](id: number, data: Update[Entity]Input): Promise<[Entity] | null> {
    const fields = Object.keys(data).filter(key => data[key] !== undefined);
    if (fields.length === 0) return null;
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => data[field])];
    
    const query = `
      UPDATE [table_name] 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] as [Entity] || null;
  }
  
  async delete[Entity](id: number): Promise<boolean> {
    const query = 'DELETE FROM [table_name] WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}

export default new [Entity]Service();
```

### 5. Routes Dönüştürme

#### A. JavaScript Routes Örneği
```javascript
// [entity]Routes.js (ÖNCE)
const express = require('express');
const { create[Entity] } = require('../controllers/[entity]/[entity]Controller');
const { create[Entity]Validation } = require('../validators/[entity]Validator');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/', authMiddleware, create[Entity]Validation, create[Entity]);

module.exports = router;
```

#### B. TypeScript Routes Örneği
```typescript
// [entity]Routes.ts (SONRA)
import express from 'express';
import { create[Entity] } from '../controllers/[entity]/[entity]Controller';
import { create[Entity]Validation } from '../validators/[entity]Validator';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

router.post('/', authMiddleware, create[Entity]Validation, create[Entity]);

export default router;
```

### 6. Frontend Component Dönüştürme

#### A. JavaScript Component Örneği
```javascript
// Create[Entity]Screen.js (ÖNCE)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import [Entity]Service from '../../services/[entity]Service';

const Create[Entity]Screen = ({ navigation }) => {
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  
  const handleCreate = async () => {
    try {
      const data = { field1, field2 };
      const response = await [Entity]Service.create[Entity](data);
      
      if (response.success) {
        Alert.alert('Başarılı', response.message);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };
  
  return (
    <View>
      <TextInput 
        value={field1}
        onChangeText={setField1}
        placeholder="Field 1"
      />
      <TextInput 
        value={field2}
        onChangeText={setField2}
        placeholder="Field 2"
      />
      <TouchableOpacity onPress={handleCreate}>
        <Text>Oluştur</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Create[Entity]Screen;
```

#### B. TypeScript Component Örneği
```typescript
// Create[Entity]Screen.tsx (SONRA)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import [Entity]Service from '../../services/[entity]Service';
import { Create[Entity]Input, ApiResponse, [Entity] } from '../../types/[entity]';

type RootStackParamList = {
  Create[Entity]: undefined;
  [Entity]List: undefined;
};

type Create[Entity]ScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Create[Entity]'
>;

interface Props {
  navigation: Create[Entity]ScreenNavigationProp;
}

const Create[Entity]Screen: React.FC<Props> = ({ navigation }) => {
  const [field1, setField1] = useState<string>('');
  const [field2, setField2] = useState<string>('');
  
  const handleCreate = async (): Promise<void> => {
    try {
      const data: Create[Entity]Input = { field1, field2 };
      const response: ApiResponse<[Entity]> = await [Entity]Service.create[Entity](data);
      
      if (response.success) {
        Alert.alert('Başarılı', response.message);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };
  
  return (
    <View>
      <TextInput 
        value={field1}
        onChangeText={setField1}
        placeholder="Field 1"
      />
      <TextInput 
        value={field2}
        onChangeText={setField2}
        placeholder="Field 2"
      />
      <TouchableOpacity onPress={handleCreate}>
        <Text>Oluştur</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Create[Entity]Screen;
```

## 🔍 Kontrol Listesi

### Dönüştürme Öncesi Kontroller
- [ ] TypeScript bağımlılıkları yüklü mü?
- [ ] TSConfig dosyası mevcut mu?
- [ ] Mevcut JavaScript dosyaları çalışıyor mu?
- [ ] Test dosyaları var mı?

### Dönüştürme Sırası
1. [ ] Tip tanımları oluştur (`types/[entity].ts`)
2. [ ] Service dosyalarını dönüştür (`.js` → `.ts`)
3. [ ] Controller dosyalarını dönüştür (`.js` → `.ts`)
4. [ ] Routes dosyalarını dönüştür (`.js` → `.ts`)
5. [ ] Index dosyalarını dönüştür (`.js` → `.ts`)
6. [ ] Frontend component'leri dönüştür (`.js` → `.tsx`)
7. [ ] Eski JavaScript dosyalarını sil

### Dönüştürme Sonrası Kontroller
- [ ] Tüm import/export'lar çalışıyor mu?
- [ ] TypeScript hataları var mı?
- [ ] Uygulama çalışıyor mu?
- [ ] API endpoint'leri çalışıyor mu?
- [ ] Frontend ekranları yükleniyor mu?

### Import/Export Uyumsuzluk Kontrolleri
- [ ] Aynı dosyada hem `require` hem `import` kullanılmış mı?
- [ ] CommonJS export olan dosyalar ES6 import ile çağrılmış mı?
- [ ] "is not a function" hataları var mı?
- [ ] `generateToken_1.generateToken` gibi garip import isimleri var mı?
- [ ] Mixed module system uyarıları var mı?
- [ ] Tüm bağımlılıklar tutarlı import sistemi kullanıyor mu?
- [ ] TypeScript derleyici import hatası veriyor mu?

## 🚨 Yaygın Hatalar ve Çözümleri

### 1. MODULE_NOT_FOUND Hatası
**Sebep**: Import path'leri yanlış veya eksik
**Çözüm**: 
```typescript
// Yanlış
import controller from './controller';

// Doğru
import controller from './controller.js'; // Node.js için
// veya
import controller from './controller'; // TypeScript için
```

### 2. Type Errors
**Sebep**: Tip tanımları eksik veya yanlış
**Çözüm**:
```typescript
// Yanlış
const data = req.body;

// Doğru
const data: Create[Entity]Input = req.body;
```

### 3. Default Export Sorunları
**Sebep**: CommonJS ve ES6 module karışımı
**Çözüm**:
```typescript
// Her iki export türünü de kullan
export const myFunction = () => {};
export default { myFunction };
```

### 4. Package.json Script Hatası
**Sebep**: ts-node kullanılmıyor
**Çözüm**:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node server.js"
  }
}
```

### 5. Import/Export Uyumsuzluk Hataları
**Sebep**: ES6 import ile CommonJS export karışımı
**Çözüm**:
```typescript
// CommonJS export olan dosya için
// generateToken.js: module.exports = generateToken;

// Yanlış - TypeScript'te hata verir
import generateToken from './generateToken';

// Doğru - CommonJS require kullan
const generateToken = require('./generateToken');

// Veya dosyayı ES6'ya çevir
// generateToken.js → generateToken.ts
// export default generateToken;
```

### 6. "is not a function" Hataları
**Sebep**: TypeScript'in CommonJS import'ları yanlış yorumlaması
**Belirti**: `(0, generateToken_1.generateToken) is not a function`
**Çözüm**:
```typescript
// Sorunlu durum
const generateToken = require('./generateToken'); // CommonJS
import bcrypt from 'bcryptjs'; // ES6

// Çözüm 1: Tümünü CommonJS yap
const generateToken = require('./generateToken');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

// Çözüm 2: Tümünü ES6 yap (dosyaları .ts'e çevir)
import generateToken from './generateToken';
import bcrypt from 'bcryptjs';
import { pool } from './db';
```

### 7. Mixed Module System Hatası
**Sebep**: Aynı dosyada hem require hem import kullanımı
**Çözüm**:
```typescript
// Yanlış - Karışık kullanım
const express = require('express');
import { pool } from './db';

// Doğru - Tutarlı kullanım
const express = require('express');
const { pool } = require('./db');

// Veya
import express from 'express';
import { pool } from './db';
```

## 📊 Performans İpuçları

1. **Kademeli Dönüştürme**: Tüm dosyaları aynı anda dönüştürme
2. **Tip Güvenliği**: `any` tipini mümkün olduğunca kullanma
3. **Interface Kullanımı**: Class yerine interface tercih et
4. **Strict Mode**: TSConfig'de strict mode'u aktif et
5. **Linting**: ESLint + TypeScript kurallarını kullan

## 🔐 Güvenlik Standartları

- **Tip Güvenliği**: Tüm API endpoint'lerinde tip kontrolü
- **Input Validation**: Runtime validation ile tip kontrolü birleştir
- **Error Handling**: Tip güvenli hata yönetimi
- **Authentication**: Tip güvenli JWT token kontrolü

## 📝 Gerçek Örnek: Profile Dönüştürme

### Dönüştürülen Dosyalar
1. `profileService.js` → `profileService.ts`
2. `profileController.js` → `profileController.ts`
3. `profile/index.js` → `profile/index.ts`
4. `types/profile.ts` (yeni oluşturuldu)

### Güncellenen Konfigürasyonlar
1. `package.json` - ts-node desteği eklendi
2. `tsconfig.json` - TypeScript konfigürasyonu
3. `profileRoutes.js` - import yapısı güncellendi

### Sonuç
- ✅ Backend başarıyla çalışıyor
- ✅ API endpoint'leri çalışıyor
- ✅ Tip güvenliği sağlandı
- ✅ MODULE_NOT_FOUND hatası çözüldü

## 🚨 Ek Sorunlar ve Çözümleri

### 8. ts-node Cache Sorunları
**Sebep**: TypeScript derleyici cache'i eski bilgileri tutuyor
**Belirti**: Dosya güncellendiği halde eski hatalar devam ediyor
**Çözüm**:
```bash
# Cache'i temizle
npx ts-node --clear-cache

# Veya node_modules/.cache klasörünü sil
rm -rf node_modules/.cache

# Serveri yeniden başlat
npm run dev
```

### 9. Multer File Upload Tip Sorunları
**Sebep**: Multer file objesi için tip tanımı eksik
**Belirti**: `req.file` için TypeScript hatası
**Çözüm**:
```typescript
// types/auth.ts veya ilgili tip dosyasında
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
  };
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}
```

### 10. Express Response Tip Sorunları
**Sebep**: Response generic tipi eksik
**Belirti**: `res.json()` için tip uyarıları
**Çözüm**:
```typescript
// Controller'da
import { Response } from 'express';
import { ApiResponse, Gym } from '../../types/gyms';

export const getGyms = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Gym[]>>, // Generic tip belirt
  next: NextFunction
): Promise<void> => {
  // ...
};
```

### 11. Database Query Result Tip Sorunları
**Sebep**: PostgreSQL query sonucu `any` tipinde
**Belirti**: `result.rows[0]` için tip güvenliği yok
**Çözüm**:
```typescript
// Type assertion kullan
const result = await pool.query(query, [id]);
return result.rows[0] as Gym || null;

// Veya interface ile tip güvenliği sağla
interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

const result: QueryResult<Gym> = await pool.query(query, [id]);
```

### 12. CommonJS/ES6 Module Karışımı
**Sebep**: Aynı projede hem `require` hem `import` kullanımı
**Belirti**: "Cannot use import statement outside a module" hatası
**Çözüm**:
```typescript
// Tutarlılık sağla - Tümünü CommonJS yap
const express = require('express');
const { pool } = require('./config/database');
const authMiddleware = require('./middlewares/authMiddleware');

// Veya tümünü ES6 yap (dosyaları .ts'e çevir)
import express from 'express';
import { pool } from './config/database';
import { authMiddleware } from './middlewares/authMiddleware';
```

### 13. Path Resolution Sorunları
**Sebep**: TypeScript import path'lerini yanlış çözümlüyor
**Belirti**: "Module not found" hatası
**Çözüm**:
```typescript
// tsconfig.json'da baseUrl ve paths ayarla
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@types/*": ["types/*"],
      "@controllers/*": ["controllers/*"]
    }
  }
}

// Import'larda kullan
import { Gym } from '@types/gyms';
import { gymController } from '@controllers/gyms/gymController';
```

### 14. Validation Result Tip Sorunları
**Sebep**: express-validator result tipi belirsiz
**Belirti**: `errors.array()` için tip uyarısı
**Çözüm**:
```typescript
import { validationResult, ValidationError } from 'express-validator';

const errors = validationResult(req);
if (!errors.isEmpty()) {
  const errorArray: ValidationError[] = errors.array();
  return res.status(400).json({
    success: false,
    message: 'Geçersiz veri',
    errors: errorArray
  });
}
```

### 15. Async/Await Return Type Sorunları
**Sebep**: Promise return tipi eksik
**Belirti**: "Promise<void>" bekleniyor ama "void" dönüyor
**Çözüm**:
```typescript
// Yanlış
export const createGym = async (req, res) => {
  // ...
  res.json(response); // return eksik
};

// Doğru
export const createGym = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Gym>>
): Promise<void> => {
  // ...
  res.json(response);
  return; // Explicit return
};
```

### 16. Environment Variables Tip Sorunları
**Sebep**: process.env değerleri string | undefined
**Belirti**: "Possibly undefined" uyarıları
**Çözüm**:
```typescript
// types/env.ts oluştur
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
      JWT_SECRET: string;
    }
  }
}

export {};

// Kullanımda
const port = process.env.PORT || '3000'; // Artık tip güvenli
```

### 17. Router.use() Middleware Tip Sorunları
**Sebep**: Middleware function bekleniyor ama Object geliyor
**Belirti**: "Router.use() requires a middleware function but got a Object"
**Çözüm**:
```typescript
// routes/index.js'de
// Yanlış - TypeScript default export
const gymsRoutes = require('./gyms/gymsRoutes');
router.use('/gyms', gymsRoutes); // Object gelir

// Doğru - .default ekle
const gymsRoutes = require('./gyms/gymsRoutes').default;
router.use('/gyms', gymsRoutes); // Function gelir

// Veya ES6 import kullan
import gymsRoutes from './gyms/gymsRoutes';
router.use('/gyms', gymsRoutes);
```

### 18. Type Definition Eksikliği
**Sebep**: Üçüncü parti kütüphane tipleri yok
**Belirti**: "Could not find a declaration file" hatası
**Çözüm**:
```bash
# @types paketlerini yükle
npm install --save-dev @types/express @types/node @types/bcryptjs @types/jsonwebtoken @types/multer

# Veya kendi tip tanımını oluştur
// types/custom.d.ts
declare module 'some-package' {
  export function someFunction(): void;
}
```

### 19. Strict Mode Sorunları
**Sebep**: tsconfig.json'da strict: true aktif
**Belirti**: Çok fazla tip hatası
**Çözüm**:
```json
// Kademeli geçiş için
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true,
    "strictNullChecks": false,
    "strictFunctionTypes": false
  }
}

// Sonra kademeli olarak aktif et
```

### 20. Build/Compile Sorunları
**Sebep**: TypeScript derleyici konfigürasyonu yanlış
**Belirti**: "Cannot compile" hataları
**Çözüm**:
```json
// package.json scripts güncelle
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.js",
    "build": "tsc",
    "start": "node dist/server.js",
    "type-check": "tsc --noEmit"
  }
}

// TypeScript check komutu
npx tsc --noEmit
```

## 🔧 Hızlı Sorun Giderme Checklist

### Dönüştürme Sırasında Hata Alıyorsan:
1. [ ] `npx tsc --noEmit` çalıştır - tip hatalarını gör
2. [ ] `npm run dev` yeniden başlat - cache temizle
3. [ ] Import/export tutarlılığını kontrol et
4. [ ] Tip tanımları eksik mi kontrol et
5. [ ] tsconfig.json konfigürasyonu doğru mu?

### Runtime Hatası Alıyorsan:
1. [ ] Console'da tam hata mesajını oku
2. [ ] MODULE_NOT_FOUND → import path'leri kontrol et
3. [ ] "is not a function" → CommonJS/ES6 karışımı kontrol et
4. [ ] "Router.use() requires middleware" → .default ekle
5. [ ] Cache temizle ve yeniden başlat

### API Test Etmek İçin:
```powershell
# PowerShell'de test komutu
Invoke-WebRequest -Uri "http://localhost:3000/api/endpoint" -Method GET -Headers @{"Authorization"="Bearer token"; "Content-Type"="application/json"}
```

## 🎯 Sonuç

Bu klavuz, **herhangi bir JavaScript dosyasını** TypeScript'e dönüştürmek için gerekli tüm adımları ve karşılaşılabilecek sorunları kapsar. Her dönüştürme işlemi için bu adımları takip ederek güvenli ve tip güvenli kod elde edebilirsiniz.

**Önemli**: Dönüştürme işlemi sırasında her adımda test yapın ve hataları anında çözün. Kademeli yaklaşım benimseyin ve tüm dosyaları aynı anda dönüştürmeyin.

**Hatırlatma**: Bu klavuz gerçek projede karşılaşılan sorunlar ve çözümleri içerir. Her yeni sorunla karşılaştığınızda bu klavuzu güncelleyin.