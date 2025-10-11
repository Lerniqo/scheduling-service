const { Client } = require('pg');

// Use the connection string from the error logs pattern
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_m0U5vmVTHaTy@ep-late-band-a58lg0fy.us-east-2.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString: connectionString
});

async function clearDatabase() {
  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Clear all data from the tables to remove NULL constraints issue
    console.log('Clearing session_attendees...');
    const result1 = await client.query('DELETE FROM session_attendees');
    console.log(`Deleted ${result1.rowCount} rows from session_attendees`);

    console.log('Clearing scheduled_sessions...');
    const result2 = await client.query('DELETE FROM scheduled_sessions');
    console.log(`Deleted ${result2.rowCount} rows from scheduled_sessions`);

    console.log('Clearing teacher_availability...');
    const result3 = await client.query('DELETE FROM teacher_availability');
    console.log(`Deleted ${result3.rowCount} rows from teacher_availability`);

    console.log('All tables cleared successfully!');
    
  } catch (error) {
    console.error('Error clearing database:', error.message);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

clearDatabase();