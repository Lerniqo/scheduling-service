async function fixTimezoneSchema() {
  // Simple database client without external dependencies
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  console.log('Using native database operations...');

  try {
    await client.connect();
    console.log('Connected to database');

    // Delete any records with null start_time or end_time
    console.log('Deleting records with null timestamps...');
    const deleteResult = await client.query(`
      DELETE FROM scheduled_sessions 
      WHERE start_time IS NULL OR end_time IS NULL
    `);
    console.log(`Deleted ${deleteResult.rowCount} records with null timestamps`);

    // Check if we need to alter column types to timestamptz
    console.log('Checking current column types...');
    const columnInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'scheduled_sessions' 
      AND column_name IN ('start_time', 'end_time')
    `);
    
    console.log('Current column types:', columnInfo.rows);

    // Convert timestamp columns to timestamptz if needed
    for (const row of columnInfo.rows) {
      if (row.data_type === 'timestamp without time zone') {
        console.log(`Converting ${row.column_name} to timestamptz...`);
        await client.query(`
          ALTER TABLE scheduled_sessions 
          ALTER COLUMN ${row.column_name} TYPE timestamptz 
          USING ${row.column_name} AT TIME ZONE 'UTC'
        `);
        console.log(`✅ Converted ${row.column_name} to timestamptz`);
      } else if (row.data_type === 'timestamp with time zone') {
        console.log(`✅ ${row.column_name} is already timestamptz`);
      }
    }

    // Also fix teacher_availability table
    console.log('Fixing teacher_availability table...');
    const availabilityColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teacher_availability' 
      AND column_name IN ('start_time', 'end_time')
    `);

    for (const row of availabilityColumns.rows) {
      if (row.data_type === 'timestamp without time zone') {
        console.log(`Converting availability ${row.column_name} to timestamptz...`);
        await client.query(`
          ALTER TABLE teacher_availability 
          ALTER COLUMN ${row.column_name} TYPE timestamptz 
          USING ${row.column_name} AT TIME ZONE 'UTC'
        `);
        console.log(`✅ Converted availability ${row.column_name} to timestamptz`);
      }
    }

    console.log('✅ Schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the fix
fixTimezoneSchema()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });