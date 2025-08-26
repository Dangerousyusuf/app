# RFC: Full-Stack React Native & Node.js Proje Yapısı

## Genel Bakış

Bu dokümantasyon, React Native frontend, Node.js backend ve API Gateway'den oluşan üç katmanlı full-stack uygulamanın modüler yapısını ve dosya organizasyonunu açıklamaktadır. Proje, **Separation of Concerns**, **Modular Architecture** ve **Microservices Pattern** prensiplerine uygun olarak tasarlanmıştır.

## 🏗️ Mimari Prensipleri

### 1. Üç Katmanlı Modüler Ayrım
- **API Gateway** - Request routing, validation, rate limiting (TypeScript)
- **Backend** - Core business logic, database operations (TypeScript)
- **Frontend** - User interface, client-side logic (TypeScript)
- Her modülün kendi bağımlılıkları, konfigürasyonları ve build süreçleri
- API tabanlı iletişim (RESTful endpoints)

## 🏗️ Genel Mimari

### Üç Katmanlı Yapı

1. **API Gateway** (`/api`)
   - Port: 3001
   - Rol: Reverse proxy, rate limiting, authentication, API documentation
   - Teknoloji: Express.js + TypeScript + Swagger
   - Özellikler: JWT validation, CORS, Helmet security, Winston logging

2. **Backend Service** (`/backend`)
   - Port: 3002
   - Rol: İş mantığı, veritabanı işlemleri, dosya yükleme
   - Teknoloji: Express.js + TypeScript + PostgreSQL
   - Özellikler: bcrypt hashing, JWT auth, multer uploads, role-based access

3. **Frontend** (`/frontend`)
   - Platform: React Native + Expo
   - Teknoloji: TypeScript + React Navigation + SecureStore
   - Özellikler: Stack/Tab navigation, image picker, blur effects, QR reader

### 2. API Gateway Pattern
- Merkezi API yönetimi ve routing
- Request validation ve transformation
- Rate limiting ve security
- Backend servislerinin proxy'si
- Swagger dokümantasyonu
- **TypeScript desteği ile tip güvenliği**

### 3. Katmanlı Mimari (Backend)
- **Controller Layer**: HTTP isteklerini yönetir
- **Service Layer**: İş mantığını içerir
- **Data Layer**: Veritabanı işlemlerini gerçekleştirir

### 4. Component-Based Architecture (Frontend)
- **Screen Components**: Sayfa bileşenleri
- **Reusable Components**: Ortak kullanılan bileşenler
- **Context API**: Global state yönetimi

## 🛠️ Teknoloji Stack

### Frontend (React Native + TypeScript)
- **React Native**: Cross-platform mobil framework
- **TypeScript**: Tip güvenli JavaScript
- **Expo**: Development ve deployment platform
- **React Navigation**: Stack ve Tab navigasyon
- **React Context API**: Global state management
- **AsyncStorage**: Local data storage
- **Expo SecureStore**: Güvenli token storage
- **Expo Image Picker**: Resim seçme ve yükleme
- **Expo Image Manipulator**: Resim düzenleme
- **Expo Blur**: Blur efektleri
- **React Native SVG**: SVG desteği
- **Axios**: HTTP client
- **@types/react**: React TypeScript tipleri

### Backend (Node.js + TypeScript)
- **Express.js**: Web application framework
- **TypeScript**: Tip güvenli JavaScript
- **PostgreSQL**: İlişkisel veritabanı
- **JWT**: Token tabanlı kimlik doğrulama
- **bcrypt**: Güvenli şifre hashleme
- **Multer**: File upload middleware
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **Helmet**: Güvenlik middleware
- **Express Rate Limit**: API rate limiting
- **@types/express**: Express TypeScript tipleri
- **@types/node**: Node.js TypeScript tipleri
- **@types/bcrypt**: bcrypt TypeScript tipleri
- **@types/jsonwebtoken**: JWT TypeScript tipleri
- **@types/multer**: Multer TypeScript tipleri
- **@types/pg**: PostgreSQL TypeScript tipleri
- **ts-node**: TypeScript runtime
- **nodemon**: Development server

### API Gateway (Express.js + TypeScript) ✅ GÜNCEL
- **Express.js**: Routing ve middleware
- **TypeScript**: Tip güvenli JavaScript ✅ YENİ
- **CORS**: Cross-origin resource sharing
- **Rate limiting**: API güvenliği
- **Request logging**: İstek takibi
- **Security Middleware**: Helmet, HTTPS redirect
- **Swagger**: API dokümantasyonu
- **@types/express**: Express TypeScript tipleri ✅ YENİ
- **ts-node**: TypeScript runtime ✅ YENİ

### 3. Katmanlı Mimari (Backend)
- **Controller Layer**: HTTP isteklerini yönetir
- **Service Layer**: İş mantığını içerir
- **Data Layer**: Veritabanı işlemlerini gerçekleştirir

### 4. Component-Based Architecture (Frontend)
- **Screen Components**: Sayfa bileşenleri
- **Reusable Components**: Ortak kullanılan bileşenler
- **Context API**: Global state yönetimi

## 🛠️ Teknoloji Stack

### Frontend (React Native + TypeScript)
- **React Native**: Mobil uygulama framework
- **TypeScript**: Tip güvenli JavaScript
- **Expo**: Development ve deployment platform
- **React Navigation**: Navigasyon yönetimi
- **React Context API**: State management
- **AsyncStorage**: Local storage
- **React Native Paper**: UI component library
- **@types/react**: React TypeScript tipleri
- **@types/react-native**: React Native TypeScript tipleri

### Backend (Node.js + TypeScript)
- **Express.js**: Web framework
- **TypeScript**: Tip güvenli JavaScript
- **PostgreSQL**: İlişkisel veritabanı
- **JWT**: Authentication token
- **bcrypt**: Şifre hashleme
- **multer**: File upload middleware
- **express-validator**: Input validation
- **dotenv**: Environment variables
- **@types/express**: Express TypeScript tipleri
- **@types/node**: Node.js TypeScript tipleri
- **@types/bcrypt**: bcrypt TypeScript tipleri
- **@types/jsonwebtoken**: JWT TypeScript tipleri
- **ts-node**: TypeScript runtime
- **nodemon**: Development server

### API Gateway (Express.js + TypeScript)
- **Express.js**: Routing ve middleware
- **TypeScript**: Tip güvenli JavaScript
- **CORS**: Cross-origin resource sharing
- **Express Rate Limit**: API güvenliği ve throttling
- **Helmet**: Güvenlik headers
- **Morgan**: Request logging
- **Winston**: Structured logging
- **Swagger**: API dokümantasyonu
- **JWT**: Token validation
- **Multer**: File upload handling
- **Axios**: Backend proxy iletişimi
- **@types/express**: Express TypeScript tipleri
- **@types/node**: Node.js TypeScript tipleri
- **@types/jsonwebtoken**: JWT TypeScript tipleri
- **ts-node**: TypeScript runtime

## Proje Mimarisi

### 🏗️ Genel Yapı
```
app/
├── frontend/          # 📱 React Native Expo uygulaması
├── backend/           # 🔧 Node.js Express API sunucusu
├── .expo/             # Expo global konfigürasyonları
├── .vercel/           # Deployment konfigürasyonları
├── package.json       # Root package.json (workspace)
├── package-lock.json  # Root lock dosyası
├── README.md          # Proje dokümantasyonu
└── RFC_PROJECT_STRUCTURE.md  # Bu dosya
```

## 🌐 API Gateway Yapısı (Express.js + TypeScript)

### Dizin Organizasyonu
```
api/
├── .env                    # Environment variables
├── .env.example            # Environment template
├── package.json            # API Gateway dependencies
├── package-lock.json       # Lock file
├── tsconfig.json           # TypeScript configuration
├── server.ts               # Main server entry point
├── dist/                   # Compiled TypeScript output
├── docs/                   # API documentation
│   └── swagger.yaml        # Swagger API specifications
├── utils/                  # Utility functions
│   ├── httpClient.ts       # Backend communication client
│   ├── logger.ts           # Winston logging system
│   └── responseFormatter.ts # Response formatting utilities
└── v1/                     # API v1 endpoints
    ├── config/             # Configuration files
    │   ├── environment.ts  # Environment configuration
    │   ├── express.ts      # Express app configuration
    │   ├── swagger.ts      # Swagger setup
    │   └── urls.ts         # URL constants
    ├── controllers/        # Proxy controllers
    │   ├── auth/           # Authentication proxy
    │   ├── profile/        # Profile proxy
    │   └── user/           # User management proxy
    ├── middlewares/        # Gateway middlewares
    │   ├── authMiddleware.ts    # JWT validation
    │   ├── cors.ts             # CORS configuration
    │   ├── errorHandler.ts     # Error handling
    │   ├── rateLimiter.ts      # Rate limiting
    │   └── security.ts         # Security headers (Helmet)
    ├── routes/             # API Gateway routes
    │   ├── auth/           # Authentication routes
    │   ├── permissions/    # Permission routes
    │   ├── profile/        # Profile routes
    │   ├── roles/          # Role routes
    │   ├── settings.ts     # Settings routes
    │   ├── user/           # User routes
    │   └── index.ts        # Route aggregation
    ├── types/              # TypeScript type definitions
    │   ├── api.ts          # API-specific types
    │   ├── common.ts       # Common types
    │   └── index.ts        # Type exports
    ├── validators/         # Request validation
    │   ├── loginValidator.ts # Login validation
    │   └── index.ts        # Validator exports
    └── index.ts            # V1 API entry point
```

## 🔧 Backend Yapısı (Node.js + TypeScript)

### Dizin Organizasyonu
```
backend/
├── .env                    # Environment variables
├── env.example             # Environment template
├── package.json            # Backend dependencies
├── package-lock.json       # Lock file
├── tsconfig.json           # TypeScript configuration
├── server.ts               # Main server entry point
├── check_gym_data.ts       # Database utility script
├── run_migration.ts        # Migration runner
├── run_specific_migration.ts # Specific migration runner
├── update_password.js      # Password update utility
├── uploads/                # File upload storage
│   └── images/             # Image uploads
│       ├── avatars/        # User avatars
│       └── logos/          # Club/gym logos
└── src/                    # Source code
    ├── app.ts              # Express app configuration
    ├── config/             # Configuration files
    │   ├── db.ts           # PostgreSQL connection
    │   └── index.ts        # Config exports
    ├── controllers/        # HTTP request handlers
    │   ├── auth/           # Authentication controllers
    │   ├── clubs/          # Club management controllers
    │   ├── gyms/           # Gym management controllers
    │   ├── permissions/    # Permission controllers
    │   ├── profile/        # Profile controllers
    │   ├── roles/          # Role controllers
    │   ├── settings/       # Settings controllers
    │   └── user/           # User controllers
    ├── middleware/         # Single middleware (legacy)
    │   └── security.ts     # Security middleware
    ├── middlewares/        # Middleware collection
    │   ├── authMiddleware.ts    # JWT authentication
    │   ├── errorHandler.ts     # Error handling
    │   └── index.ts            # Middleware exports
    ├── migrations/         # Database migrations (empty)
    ├── routes/             # API route definitions
    │   ├── auth/           # Authentication routes
    │   ├── clubs/          # Club routes
    │   ├── gyms/           # Gym routes
    │   ├── permissions/    # Permission routes
    │   ├── profile/        # Profile routes
    │   ├── roles/          # Role routes
    │   ├── settings/       # Settings routes
    │   ├── user/           # User routes
    │   └── index.ts        # Route aggregation
    ├── services/           # Business logic layer
    │   ├── auth/           # Authentication services
    │   ├── permissions/    # Permission services
    │   ├── profile/        # Profile services
    │   ├── settings/       # Settings services
    │   └── user/           # User services
    ├── types/              # TypeScript type definitions
    │   ├── auth.ts         # Authentication types
    │   ├── clubs.ts        # Club types
    │   ├── gyms.ts         # Gym types
    │   ├── permissions.ts  # Permission types
    │   ├── profile.ts      # Profile types
    │   ├── roles.ts        # Role types
    │   └── user.ts         # User types
    ├── utils/              # Utility functions
    │   ├── generateToken.ts # JWT token generation
    │   └── index.ts        # Utility exports
    └── validators/         # Input validation
        └── permissionsValidator.ts # Permission validation
```

## 📱 Frontend Yapısı (React Native + TypeScript)

### Dizin Organizasyonu
```
frontend/
├── .env                    # Environment variables
├── .env.example            # Environment template
├── .expo/                  # Expo configuration
│   ├── README.md           # Expo documentation
│   ├── devices.json        # Device configurations
│   └── web/                # Web build cache
├── .gitignore              # Git ignore rules
├── App.tsx                 # Main app component
├── app.json                # Expo app configuration
├── index.ts                # App entry point
├── package.json            # Frontend dependencies
├── package-lock.json       # Lock file
├── tsconfig.json           # TypeScript configuration
├── assets/                 # Static assets
│   ├── adaptive-icon.png   # Android adaptive icon
│   ├── favicon.png         # Web favicon
│   ├── icon.png            # App icon
│   └── splash-icon.png     # Splash screen icon
└── src/                    # Source code
    ├── components/         # Reusable UI components
    │   ├── CustomButton.tsx     # Custom button component
    │   ├── LeftSidebar.tsx      # Left navigation sidebar
    │   ├── RightSidebar.tsx     # Right navigation sidebar
    │   ├── Sidebar.tsx          # Main sidebar component
    │   └── index.ts             # Component exports
    ├── config/             # Configuration files
    │   ├── api.ts          # API configuration
    │   └── security.ts     # Security configuration
    ├── constants/          # App constants
    │   ├── colors.ts       # Color definitions
    │   ├── sizes.ts        # Size definitions
    │   └── index.ts        # Constant exports
    ├── context/            # React Context providers
    │   ├── AuthContext.tsx      # Authentication context
    │   ├── ThemeContext.tsx     # Theme context
    │   └── index.ts             # Context exports
    ├── navigation/         # Navigation configuration
    │   ├── AppNavigator.tsx     # Main navigation setup
    │   └── index.ts             # Navigation exports
    ├── screens/            # Screen components
    │   ├── auth/           # Authentication screens
    │   ├── clubs/          # Club management screens
    │   ├── gyms/           # Gym management screens
    │   ├── main/           # Main app screens
    │   ├── permissions/    # Permission screens
    │   ├── profile/        # Profile screens
    │   ├── roles/          # Role screens
    │   ├── search/         # Search screens
    │   ├── settings/       # Settings screens
    │   ├── users/          # User management screens
    │   └── index.ts        # Screen exports
    ├── services/           # API service layer
    │   ├── authService.ts       # Authentication API
    │   ├── clubService.ts       # Club API
    │   ├── clubsOwnersService.ts # Club owners API
    │   ├── clubsService.ts      # Clubs API
    │   ├── gymsService.ts       # Gyms API
    │   ├── permissionsService.ts # Permissions API
    │   ├── roleService.ts       # Role API
    │   ├── rolesService.ts      # Roles API
    │   ├── settingsService.ts   # Settings API
    │   ├── userService.ts       # User API
    │   └── index.ts             # Service exports
    ├── types/              # TypeScript type definitions
    │   └── index.ts        # Type exports
    └── validators/         # Input validation
        ├── loginValidator.ts    # Login validation
        └── index.ts             # Validator exports
```