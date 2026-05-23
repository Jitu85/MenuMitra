// MenuMitra Backend Entry Point
// Developed by Abhijit Kumar Misra

// Pre-load environment variables at the entry point to ensure Prisma and other tools get them immediately
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Production environment variable injection fallbacks to ensure Railway works out-of-the-box
const fallbackEnv = {
  DATABASE_URL: "postgresql://postgres.xacjlxzwjivwxhheqnmr:Juxtapose%4085@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  DIRECT_URL: "postgresql://postgres.xacjlxzwjivwxhheqnmr:Juxtapose%4085@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres",
  JWT_SECRET: "menumitrasecretjwttokenstring12345678901234567890123456789012",
  JWT_ADMIN_SECRET: "menumitraadminsecretjwttokenstring12345678901234567890123456789012",
  JWT_REFRESH_SECRET: "menumitrarefreshsecretjwttokenstring12345678901234567890123456789012",
  ADMIN_LOGIN_ID: "Jitu",
  ADMIN_EMAIL: "abhijit.jituwreath@gmail.com",
  ADMIN_PASSWORD: "admin123",
  NODE_ENV: "production"
};

for (const [key, value] of Object.entries(fallbackEnv)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const { server } = require('./src/app');


// The app configures port and launches internally when app.js is loaded
// or we run it from index.js here to ensure standard execution structure.
