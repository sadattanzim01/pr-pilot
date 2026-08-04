const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.uowglqdombdvqovartpv.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%NazmuS%2012',
  ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to Supabase database');
  }
});

module.exports = pool;