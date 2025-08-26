# HTTPS Migration Guide

Bu dokümantasyon, uygulamanın HTTP'den HTTPS'e geçiş sürecini ve güvenlik yapılandırmalarını açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Altyapı Değişiklikleri](#altyapı-değişiklikleri)
3. [Backend Değişiklikleri](#backend-değişiklikleri)
4. [API Gateway Değişiklikleri](#api-gateway-değişiklikleri)
5. [Frontend Değişiklikleri](#frontend-değişiklikleri)
6. [Güvenlik Yapılandırmaları](#güvenlik-yapılandırmaları)
7. [Environment Değişkenleri](#environment-değişkenleri)
8. [Deployment Checklist](#deployment-checklist)
9. [Troubleshooting](#troubleshooting)

## 🎯 Genel Bakış

### Yapılan Değişiklikler

- ✅ NGINX TLS sonlandırma konfigürasyonu
- ✅ Backend HTTPS yönlendirme ve trust proxy ayarları
- ✅ API Gateway güvenlik middleware'i
- ✅ Frontend güvenli token storage (SecureStore)
- ✅ Kapsamlı güvenlik başlıkları (HSTS, CSP, vb.)
- ✅ Environment değişkenleri güncelleme

### Güvenlik İyileştirmeleri

- **HSTS (HTTP Strict Transport Security)**: 1 yıl süreyle HTTPS zorunluluğu
- **CSP (Content Security Policy)**: XSS saldırılarına karşı koruma
- **Secure Cookies**: HTTPS üzerinden güvenli cookie iletimi
- **Certificate Pinning**: Man-in-the-middle saldırılarına karşı koruma (gelecek)
- **Token Validation**: JWT token format ve süre kontrolü

## 🏗️ Altyapı Değişiklikleri

### NGINX Konfigürasyonu

#### 1. TLS Sonlandırma (`infra/nginx/app.conf`)

```nginx
# SSL/TLS Configuration
ssl_certificate /etc/ssl/certs/app.crt;
ssl_certificate_key /etc/ssl/private/app.key;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# Security headers (HTTPS enforced)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

#### 2. HTTP Yönlendirme (`infra/nginx/http-redirect.conf`)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### SSL Sertifika Kurulumu

```bash
# Let's Encrypt ile ücretsiz SSL sertifikası
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Otomatik yenileme
sudo crontab -e
# Ekle: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Backend Değişiklikleri

### 1. Trust Proxy Konfigürasyonu (`backend/src/app.ts`)

```typescript
// Trust proxy for HTTPS termination
if (process.env.TRUST_PROXY !== 'false') {
  app.set('trust proxy', 1);
}

// HTTPS redirect middleware (production only)
if (process.env.FORCE_HTTPS === 'true' && process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

### 2. Güvenlik Middleware (`backend/src/middleware/security.ts`)

- **Helmet.js** ile kapsamlı güvenlik başlıkları
- **HSTS** yapılandırması (production'da aktif)
- **CSP** politikaları
- **Custom security headers**
- **Cookie güvenlik ayarları**

### 3. CORS Güvenlik Güncellemesi

```typescript
// Production: Only allow HTTPS origins
if (process.env.NODE_ENV === 'production' && !origin.startsWith('https://')) {
  return callback(new Error('Only HTTPS origins allowed in production'));
}
```

## 🌐 API Gateway Değişiklikleri

### 1. Güvenlik Middleware (`api/v1/middlewares/security.js`)

- **Helmet.js** entegrasyonu
- **HTTPS validation** middleware
- **Custom security headers**
- **Cookie security configuration**

### 2. Server Konfigürasyonu (`api/server.js`)

```javascript
// Apply security middleware (before other middleware)
app.use(securityMiddleware());
app.use(customSecurityHeaders);
app.use(validateSecurity);
```

## 📱 Frontend Değişiklikleri

### 1. Güvenli Token Storage (`frontend/src/config/security.ts`)

```typescript
// Mobile: SecureStore (Keychain/Keystore)
// Web: AsyncStorage (TODO: HttpOnly cookies)
const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (isMobile && SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync(key, value, {
        requireAuthentication: false,
        keychainService: 'app-keychain',
      });
    } else {
      await AsyncStorage.setItem(key, value);
    }
  }
};
```

### 2. HTTPS URL Enforcement

```typescript
// API URLs - HTTPS enforced for production
export const API_BASE_URL = __DEV__ 
  ? `http://${getNetworkIP()}:3001`
  : process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.yourdomain.com';
```

### 3. Token Validation

```typescript
// JWT format validation
isValidToken(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

// Token expiration check
isTokenExpired(token: string): boolean {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const now = Math.floor(Date.now() / 1000);
  return payload.exp && payload.exp < now;
}
```

## 🔒 Güvenlik Yapılandırmaları

### 1. HTTP Security Headers

| Header | Değer | Açıklama |
|--------|-------|----------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | 1 yıl HTTPS zorunluluğu |
| `X-Frame-Options` | `DENY` | Clickjacking koruması |
| `X-Content-Type-Options` | `nosniff` | MIME type sniffing koruması |
| `X-XSS-Protection` | `1; mode=block` | XSS koruması |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer bilgisi kontrolü |
| `Content-Security-Policy` | Özel politika | XSS ve injection koruması |
| `Permissions-Policy` | Kısıtlı izinler | Tarayıcı API'leri kontrolü |

### 2. Cookie Security

```typescript
const secureCookieConfig = {
  secure: true,        // Sadece HTTPS
  httpOnly: true,      // JavaScript erişimi yok
  sameSite: 'strict',  // CSRF koruması
  maxAge: 24 * 60 * 60 * 1000, // 24 saat
  domain: 'yourdomain.com'
};
```

### 3. Token Storage Strategy

| Platform | Storage | Güvenlik Seviyesi |
|----------|---------|-------------------|
| iOS | Keychain (SecureStore) | ⭐⭐⭐⭐⭐ |
| Android | Keystore (SecureStore) | ⭐⭐⭐⭐⭐ |
| Web (Dev) | AsyncStorage | ⭐⭐ |
| Web (Prod) | HttpOnly Cookies (TODO) | ⭐⭐⭐⭐ |

## 🔧 Environment Değişkenleri

### Production Environment

```bash
# HTTPS Configuration
FORCE_HTTPS=true
TRUST_PROXY=true
CORS_ALLOWLIST=https://yourdomain.com,https://www.yourdomain.com

# API URLs
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
EXPO_PUBLIC_BACKEND_URL=https://backend.yourdomain.com

# Security
COOKIE_DOMAIN=yourdomain.com
JWT_SECRET=your-super-secure-secret-key

# Database (SSL required)
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

### Development Environment

```bash
# Development (HTTP allowed)
FORCE_HTTPS=false
TRUST_PROXY=false
CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:3000

# Local API URLs
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3000
```

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] SSL sertifikası kuruldu ve test edildi
- [ ] NGINX konfigürasyonu güncellendi
- [ ] Environment değişkenleri production için ayarlandı
- [ ] Database SSL bağlantısı yapılandırıldı
- [ ] CORS allowlist production domainleri içeriyor

### Post-Deployment

- [ ] HTTPS yönlendirme çalışıyor
- [ ] Security headers mevcut (SSL Labs testi)
- [ ] Mobile app SecureStore kullanıyor
- [ ] API endpoints HTTPS üzerinden erişilebilir
- [ ] Token validation çalışıyor
- [ ] HSTS preload listesine eklendi (opsiyonel)

### Security Testing

```bash
# SSL Labs test
curl -I https://yourdomain.com

# Security headers kontrolü
curl -I https://api.yourdomain.com/health

# HSTS test
curl -I http://yourdomain.com
```

## 🔍 Troubleshooting

### Yaygın Sorunlar

#### 1. Mixed Content Errors

**Sorun**: HTTP kaynakları HTTPS sayfasında yüklenmiyor

**Çözüm**:
```typescript
// Tüm URL'leri HTTPS'e zorla
const enforceHttps = (url: string): string => {
  return url.replace('http://', 'https://');
};
```

#### 2. CORS Errors in Production

**Sorun**: CORS policy hatası

**Çözüm**:
```bash
# CORS_ALLOWLIST'e production domain ekle
CORS_ALLOWLIST=https://yourdomain.com,https://www.yourdomain.com
```

#### 3. Token Storage Issues

**Sorun**: SecureStore erişim hatası

**Çözüm**:
```typescript
// Fallback mechanism
try {
  await SecureStore.setItemAsync(key, value);
} catch (error) {
  console.warn('SecureStore failed, using AsyncStorage fallback');
  await AsyncStorage.setItem(key, value);
}
```

#### 4. NGINX SSL Configuration

**Sorun**: SSL handshake hatası

**Çözüm**:
```nginx
# Modern SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

### Debug Commands

```bash
# SSL sertifika kontrolü
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# NGINX konfigürasyon testi
nginx -t

# SSL Labs online test
# https://www.ssllabs.com/ssltest/

# Security headers test
# https://securityheaders.com/
```

## 🚀 Gelecek İyileştirmeler

### Kısa Vadeli (1-2 ay)

- [ ] Web için HttpOnly cookies implementasyonu
- [ ] Certificate pinning (mobile)
- [ ] Biometric authentication (mobile)
- [ ] Rate limiting per user

### Orta Vadeli (3-6 ay)

- [ ] OAuth 2.0 / OpenID Connect
- [ ] Multi-factor authentication (MFA)
- [ ] Session management improvements
- [ ] Advanced threat detection

### Uzun Vadeli (6+ ay)

- [ ] Zero-trust architecture
- [ ] Advanced monitoring ve alerting
- [ ] Compliance certifications (SOC 2, ISO 27001)
- [ ] Bug bounty program

## 📚 Referanslar

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [NGINX SSL Best Practices](https://nginx.org/en/docs/http/configuring_https_servers.html)

---

**Son Güncelleme**: 2024-01-15  
**Versiyon**: 1.0  
**Hazırlayan**: Development Team

> ⚠️ **Önemli**: Bu dokümantasyon production deployment öncesi mutlaka gözden geçirilmeli ve güncel tutulmalıdır.