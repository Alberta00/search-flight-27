import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { pool, initializeTimescaleDB } from '../config/database';

const MIGRATIONS_DIR = join(__dirname, 'migrations');

interface Migration {
  name: string;
  file: string;
}

async function getMigrations(): Promise<Migration[]> {
  try {
    const files = readdirSync(MIGRATIONS_DIR);

    // Filter for .sql files and sort them to ensure correct order
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    return sqlFiles.map(file => ({
      name: file.replace('.sql', ''),
      file: file
    }));
  } catch (error) {
    console.error('Error reading migrations directory:', error);
    return [];
  }
}

async function getExecutedMigrations(): Promise<string[]> {
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    const result = await pool.query('SELECT name FROM schema_migrations ORDER BY id');
    return result.rows.map((row) => row.name);
  } catch (error) {
    console.error('Error getting executed migrations:', error);
    return [];
  }
}

async function markMigrationAsExecuted(name: string): Promise<void> {
  await pool.query('INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', [
    name,
  ]);
}

async function runMigration(migration: Migration): Promise<void> {
  try {
    const sql = readFileSync(join(MIGRATIONS_DIR, migration.file), 'utf-8');

    console.log(`Running migration: ${migration.name}`);
    await pool.query(sql);
    await markMigrationAsExecuted(migration.name);
    console.log(`✅ Migration ${migration.name} completed`);
  } catch (error) {
    console.error(`❌ Migration ${migration.name} failed:`, error);
    throw error;
  }
}

async function migrate(direction: 'up' | 'down' = 'up'): Promise<void> {
  try {
    console.log('🔄 Starting database migrations...');

    // Initialize TimescaleDB if enabled
    await initializeTimescaleDB();

    if (direction === 'up') {
      const migrations = await getMigrations();
      const executed = await getExecutedMigrations();

      const pending = migrations.filter((m) => !executed.includes(m.name));

      if (pending.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }

      for (const migration of pending) {
        await runMigration(migration);
      }

      console.log('✅ All migrations completed');
    } else {
      console.log('⚠️  Down migrations not implemented yet');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const direction = (process.argv[2] as 'up' | 'down') || 'up';
  migrate(direction).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { migrate };

