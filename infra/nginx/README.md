# NGINX HTTPS Configuration

Bu dizin, uygulamanın HTTPS TLS sonlandırma konfigürasyonunu içerir.

## Dosyalar

- `app.conf`: Ana HTTPS konfigürasyonu (TLS sonlandırma, proxy ayarları)
- `http-redirect.conf`: HTTP'den HTTPS'e yönlendirme konfigürasyonu

## Kurulum

### 1. SSL Sertifikası Hazırlama

#### Let's Encrypt ile (Ücretsiz)
```bash
# Certbot kurulumu (Ubuntu/Debian)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Sertifika oluşturma
sudo certbot --nginx -d your-domain.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

#### Manuel Sertifika
```bash
# Sertifika dosyalarını yerleştir
sudo cp your-domain.crt /etc/ssl/certs/
sudo cp your-domain.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/your-domain.key
```

### 2. NGINX Konfigürasyonu

```bash
# Konfigürasyon dosyalarını kopyala
sudo cp app.conf /etc/nginx/sites-available/
sudo cp http-redirect.conf /etc/nginx/sites-available/

# Siteleri etkinleştir
sudo ln -s /etc/nginx/sites-available/app.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/http-redirect.conf /etc/nginx/sites-enabled/

# Varsayılan siteyi devre dışı bırak
sudo rm /etc/nginx/sites-enabled/default

# Konfigürasyonu test et
sudo nginx -t

# NGINX'i yeniden başlat
sudo systemctl reload nginx
```

### 3. Domain Ayarları

Konfigürasyon dosyalarında `your-domain.com` kısımlarını gerçek domain adınızla değiştirin:

```bash
sed -i 's/your-domain.com/yourdomain.com/g' app.conf
sed -i 's/your-domain.com/yourdomain.com/g' http-redirect.conf
```

## Test

### SSL Test
```bash
# SSL Labs test
curl -I https://your-domain.com

# Sertifika bilgilerini kontrol et
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### HTTP Redirect Test
```bash
# HTTP'den HTTPS'e yönlendirme testi
curl -I http://your-domain.com
# Response: 301 Moved Permanently
# Location: https://your-domain.com/
```

## Güvenlik Kontrolleri

- [ ] HSTS header aktif
- [ ] SSL Labs A+ rating
- [ ] HTTP'den HTTPS'e yönlendirme çalışıyor
- [ ] API Gateway proxy çalışıyor
- [ ] Güvenlik başlıkları mevcut

## Sorun Giderme

### NGINX Logları
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Port Kontrolü
```bash
# NGINX'in 80 ve 443 portlarını dinlediğini kontrol et
sudo netstat -tlnp | grep nginx

# API Gateway'in 4000 portunda çalıştığını kontrol et
sudo netstat -tlnp | grep :4000
```

### SSL Sertifika Yenileme
```bash
# Let's Encrypt otomatik yenileme
sudo crontab -e
# Ekle: 0 12 * * * /usr/bin/certbot renew --quiet
```