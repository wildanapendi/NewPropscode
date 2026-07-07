import pool from './config/db.js';

const run = async () => {
  try {
    console.log('Adding final_price to orders table...');
    await pool.query('ALTER TABLE orders ADD COLUMN final_price DECIMAL(15,2) DEFAULT NULL;');
    console.log('Migration successful!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column final_price already exists, continuing...');
    } else {
      console.error('Migration failed:', err.message);
    }
  } finally {
    process.exit(0);
  }
};

run();
