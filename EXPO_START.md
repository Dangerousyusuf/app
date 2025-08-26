# 🚀 EXPO BAŞLATMA KILAVUZU

## 🤖 YAPAY ZEKA OTOMATIK BAŞLATMA PROTOKOLÜ

**Bu dosya gösterildiğinde ve "expo başlat" komutu verildiğinde yapay zeka otomatik olarak tüm servisleri başlatır.**

### ⚡ HIZLI BAŞLATMA TALİMATI (YAPAY ZEKA İÇİN)
**Kullanıcı "expo başlat" dediğinde şu komutları sırayla çalıştır:**

1. **Backend Başlat** (Port 3000):
   ```powershell
   cd backend && npm run dev
   ```

2. **API Gateway Başlat** (Port 4000):
   ```powershell
   cd api && npm run dev
   ```

3. **Frontend Expo Başlat**:
   ```powershell
   cd frontend && npm start
   ```

### 🔄 Başlatma Sırası (Kritik!)
1. **Backend** (Port 3000) - Veritabanı bağlantısı ve API endpoints
2. **API Gateway** (Port 4000) - Proxy ve middleware servisleri  
3. **Frontend** (Expo) - React Native uygulaması

---

## 🛠️ SERVİS BAŞLATMA KOMUTLARI

### 🤖 YAPAY ZEKA TALİMATLARI:
**"expo başlat" komutu geldiğinde bu komutları blocking=false ile çalıştır:**

### 1. Backend Başlatma (İlk Öncelik)
```powershell
cd backend && npm run dev
```
**Alternatif (Production):**
```powershell
cd backend && node server.js
```

### 2. API Gateway Başlatma (İkinci Öncelik)
```powershell
cd api && npm run dev
```
**Alternatif (Production):**
```powershell
cd api && node server.js
```

### 3. Frontend Expo Başlatma (Son Öncelik)
```powershell
cd frontend && npm start
```
**Sorun Durumunda:**
```powershell
cd frontend && npx expo start --clear
cd frontend && npx expo start --tunnel
```

---

## 🔍 SERVİS DURUM KONTROLLERİ

### 🤖 YAPAY ZEKA KONTROL TALİMATLARI:
**Her servis başlatıldıktan sonra bu kontrolleri yap:**

### Backend Kontrol (3000 portu)
- **Health Check**: http://localhost:3000/api/health
- **Başarı Logu**: "Server is running on port 3000"
- **Hata Durumu**: Port çakışması varsa farklı port dene

### API Gateway Kontrol (4000 portu)
- **Health Check**: http://localhost:4000/health
- **Swagger Docs**: http://localhost:4000/api-docs
- **Başarı Logu**: "API Gateway running"

### Frontend Kontrol
- **Expo DevTools**: Otomatik açılır
- **QR Code**: Terminal'de görüntülenir
- **Metro Bundler**: http://localhost:19002
- **Başarı Logu**: "Metro waiting on"

---

## 🚨 SORUN GİDERME

### 🤖 YAPAY ZEKA HATA ÇÖZÜM TALİMATLARI:
**Hata durumunda otomatik olarak şu çözümleri uygula:**

### Port Çakışması Çözümü
```powershell
# Port 3000 çakışması
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Port 4000 çakışması  
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Node Modules Hatası Çözümü
```powershell
# Sırayla tüm modülleri yeniden yükle
cd backend && npm install
cd ../api && npm install
cd ../frontend && npm install
```

### Expo Cache Sorunu Çözümü
```powershell
cd frontend && npx expo start --clear
cd frontend && npx expo start --tunnel
```

### Genel Reset Komutu
```powershell
# Tüm servisleri durdur ve yeniden başlat
taskkill /F /IM node.exe
taskkill /F /IM expo.exe
```

---

## 📱 MOBİL TEST KURULUMU

1. **Expo Go**: App Store/Play Store'dan indir
2. **QR Code**: Terminal'deki QR code'u tara
3. **Network**: Aynı WiFi ağında ol
4. **Tunnel Mode**: Sorun varsa `--tunnel` kullan

---

## 🔧 ENVIRONMENT DOSYALARI

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

### API Gateway (.env)
```env
PORT=4000
BACKEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

---

## 🎯 HIZLI BAŞLATMA (Otomatik)

### 🤖 YAPAY ZEKA OTOMATIK BAŞLATMA SCRIPT'İ:
**"expo başlat" komutu geldiğinde bu script'i çalıştır:**

```powershell
# 1. Backend (Development Mode)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 2. API Gateway (2 saniye bekle)
Start-Sleep 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api; npm run dev"

# 3. Frontend (2 saniye daha bekle)
Start-Sleep 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
```

### 🔄 Alternatif Tek Komut Başlatma:
```powershell
# Tüm servisleri aynı anda başlat
concurrently "cd backend && npm run dev" "cd api && npm run dev" "cd frontend && npm start"
```

---

## 🔄 OTOMATIK BAŞLATMA TETİKLEYİCİSİ

### 🤖 YAPAY ZEKA BAŞLATMA PROTOKOLÜ:
**Kullanıcı şu komutları verdiğinde otomatik başlat:**
- "expo başlat"
- "expoyu başlat" 
- "servisleri başlat"
- "uygulamayı çalıştır"

### 📋 BAŞLATMA ADIM LİSTESİ:
1. ✅ **Backend başlat** → `cd backend && npm run dev` (blocking=false)
2. ✅ **2 saniye bekle** → Veritabanı bağlantısı için
3. ✅ **API Gateway başlat** → `cd api && npm run dev` (blocking=false)
4. ✅ **2 saniye bekle** → API hazır olması için
5. ✅ **Frontend başlat** → `cd frontend && npm start` (blocking=false)
6. ✅ **Durum kontrol et** → Health check'leri çalıştır
7. ✅ **QR code sun** → Expo QR code'unu kullanıcıya göster
8. ✅ **Hata varsa çöz** → Otomatik troubleshooting

### 🎯 BAŞLATMA KOŞULLARI:
- **Dosya**: `EXPO_START.md` (bu dosya)
- **Komutlar**: "expo başlat", "expoyu başlat", "servisleri başlat"
- **Lokasyon**: `d:\Users\Yusuf\Desktop\app\`
- **Mod**: Development (npm run dev)

---

## 📋 GELİŞTİRİCİ NOTLARI

### 🤖 YAPAY ZEKA İÇİN ÖNEMLİ NOTLAR:
- **Sıra Kritik**: Backend → API Gateway → Frontend (değiştirme!)
- **Bekleme Süreleri**: Her servis arası 2 saniye bekle
- **Port Kontrolü**: 3000, 4000, 19002 portları kontrol et
- **Database**: PostgreSQL aktif olmalı (kontrol et)
- **Environment**: .env dosyaları mevcut (kontrol et)
- **Blocking**: Tüm komutlar blocking=false ile çalıştır
- **Hata Yönetimi**: Port çakışması durumunda process'leri öldür

### 🎯 BAŞARI KRİTERLERİ:
- ✅ Backend: "Server is running on port 3000" logu
- ✅ API Gateway: "API Gateway running" logu
- ✅ Frontend: Expo QR code görünür
- ✅ Health Check: Tüm endpoint'ler yanıt veriyor

### 🚨 HATA DURUMLARI:
- ❌ Port çakışması → Process'i öldür, yeniden başlat
- ❌ Node modules hatası → npm install çalıştır
- ❌ Expo cache sorunu → --clear flag'i kullan
- ❌ Database bağlantı hatası → PostgreSQL servisini kontrol et

---

**Dosya Güncelleme Tarihi**: 28 Temmuz 2025  
**Expo Başlatma Protokolü**: v2.0.0 (AI Optimized)  
**Durum**: ✅ Yapay Zeka Hazır  
**Tetikleyici**: "expo başlat" komutu + bu dosya referansı