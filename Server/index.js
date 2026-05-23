// MenuMitra Backend Entry Point
// Developed by Abhijit Kumar Misra

// Pre-load environment variables at the entry point to ensure Prisma and other tools get them immediately
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { server } = require('./src/app');

// The app configures port and launches internally when app.js is loaded
// or we run it from index.js here to ensure standard execution structure.
