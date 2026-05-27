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

// Run Prisma migrations at startup (production only), then start the server
async function main() {
  if (process.env.NODE_ENV === 'production') {
    try {
      const { execSync } = require('child_process');
      console.log('[Startup] Running prisma migrate deploy...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: __dirname });
      console.log('[Startup] Prisma migrations complete.');
    } catch (err) {
      console.error('[Startup] Prisma migrate warning (may be harmless):', err.message);
      // Don't crash — tables may already exist
    }
  }

  require('./src/app');
}

main().catch(err => {
  console.error('[Startup] Fatal error:', err);
  process.exit(1);
});
