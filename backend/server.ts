import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import app from './src/app';
import { connectDB } from './src/config/db';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

// Veritabanı bağlantısını başlat ve sunucuyu çalıştır
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📱 Network API URL: http://172.20.10.5:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error('❌ Sunucu başlatılamadı:', err);
    process.exit(1);
  });