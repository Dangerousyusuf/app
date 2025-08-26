// PostgreSQL bağlantısı
import { Pool } from 'pg';

// Veritabanı bağlantı bilgileri
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '123',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Veritabanı bağlantısını test et
const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL veritabanına başarıyla bağlandı');
    client.release();
  } catch (error: any) {
    console.error('Veritabanı bağlantı hatası:', error.message);
    process.exit(1);
  }
};

export {
  pool,
  connectDB,
};