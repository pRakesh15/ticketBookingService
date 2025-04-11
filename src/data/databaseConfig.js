import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    user: process.env.DB_USER || 'postgres.unecgfjkbujmqhctmytn',
    host: process.env.DB_HOST || 'aws-0-ap-south-1.pooler.supabase.com',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'Sidu@1234',
    port: parseInt(process.env.DB_PORT) || 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  });