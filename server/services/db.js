const { Pool } = require('pg');

//create a connection pool to our Supabase PostgreSQL database
//a pool keeps multiple connections open so we don't reconnect on every query
const pool = new Pool({
  host: 'db.uowglqdombdvqovartpv.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD,// pulled from .env — never hardcode passwords
  ssl: { rejectUnauthorized: false }// required for Supabase SSL connections
});

//test the connection when the server starts
pool.connect((err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to Supabase database');
  }
});

module.exports = pool;