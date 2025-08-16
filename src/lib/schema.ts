import pool from './postgres';

const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds

async function connectWithRetry(retryCount = 0): Promise<any> {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Failed to connect to database. Retrying in ${RETRY_DELAY / 1000} seconds... (${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(res => setTimeout(res, RETRY_DELAY));
      return connectWithRetry(retryCount + 1);
    } else {
      console.error('Could not connect to the database after multiple retries. Aborting.');
      throw error;
    }
  }
}

async function createSchema() {
  let client;
  try {
    client = await connectWithRetry();
    console.log('Successfully connected to the database.');

    // Create ENUM types for status fields
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'disk_status') THEN
          CREATE TYPE disk_status AS ENUM ('online', 'degraded', 'faulted', 'offline', 'unavailable');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pool_topology_type') THEN
          CREATE TYPE pool_topology_type AS ENUM ('stripe', 'mirror', 'raidz1', 'raidz2', 'raidz3');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pool_status') THEN
          CREATE TYPE pool_status AS ENUM ('online', 'degraded', 'faulted');
        END IF;
      END$$;
    `);

    // Create tables
    await client.query(`
      DROP TABLE IF EXISTS logs CASCADE;
      DROP TABLE IF EXISTS disks CASCADE;
      DROP TABLE IF EXISTS vdevs CASCADE;
      DROP TABLE IF EXISTS pools CASCADE;

      CREATE TABLE IF NOT EXISTS pools (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        status pool_status NOT NULL,
        size BIGINT NOT NULL, -- in GB
        allocated BIGINT NOT NULL, -- in GB
        free BIGINT NOT NULL, -- in GB
        error_analysis_is_anomaly BOOLEAN,
        error_analysis_explanation TEXT,
        remote_address TEXT NOT NULL
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS vdevs (
        id SERIAL PRIMARY KEY,
        pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
        type pool_topology_type NOT NULL
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS disks (
        id SERIAL PRIMARY KEY,
        vdev_id INTEGER NOT NULL REFERENCES vdevs(id) ON DELETE CASCADE,
        zfs_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        path TEXT,
        model TEXT NOT NULL,
        status disk_status NOT NULL,
        read_errors INTEGER NOT NULL DEFAULT 0,
        write_errors INTEGER NOT NULL DEFAULT 0,
        checksum_errors INTEGER NOT NULL DEFAULT 0,
        size BIGINT, -- in GB
        temperature INTEGER, -- in Celsius
        smart_data TEXT,
        smart_analysis TEXT
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        telegram_bot_token TEXT,
        telegram_chat_id TEXT,
        google_ai_api_key TEXT,
        notifications_pool_degraded BOOLEAN DEFAULT TRUE,
        notifications_pool_faulted BOOLEAN DEFAULT TRUE,
        notifications_disk_errors BOOLEAN DEFAULT FALSE,
        notifications_smart_failures BOOLEAN DEFAULT TRUE
      );
    `);

    // Insert default settings only if they don't exist
    await client.query(`
        INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Database schema created/verified successfully.');
  } catch (error) {
    console.error('Error creating/verifying database schema:', error);
    process.exit(1); // Exit with an error code
  } finally {
    if (client) {
      client.release();
    }
  }
}

createSchema().finally(() => pool.end());