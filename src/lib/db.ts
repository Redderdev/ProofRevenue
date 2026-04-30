// Database schema setup
import { Pool } from 'pg';

const rawConnectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL;

const isHostedPostgres = Boolean(
  process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.SUPABASE_DATABASE_URL
);

const sanitizeConnectionString = (value?: string): string | undefined => {
  if (!value) {
    return value;
  }

  try {
    const url = new URL(value);
    // Prevent URL sslmode options from overriding pg ssl config object.
    url.searchParams.delete('sslmode');
    url.searchParams.delete('ssl');
    return url.toString();
  } catch {
    return value;
  }
};

const connectionString = isHostedPostgres
  ? sanitizeConnectionString(rawConnectionString)
  : rawConnectionString;

const pool = new Pool({
  connectionString,
  // Supabase/Vercel hosted Postgres can present cert chains that are not in
  // the default trust store in serverless environments.
  ssl: isHostedPostgres
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

export const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        stripe_account_id VARCHAR(255),
        country VARCHAR(2),
        livemode BOOLEAN DEFAULT FALSE,
        connected_at TIMESTAMP,
        stripe_connect_attempted_at TIMESTAMP,
        stripe_connect_failed_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Certificates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(255) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        display_slug VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        data_status VARCHAR(50) DEFAULT 'pending',
        mrr BIGINT,
        arr BIGINT,
        total_revenue BIGINT,
        customers INTEGER,
        mrr_history JSONB,
        arr_history JSONB,
        snapshot_retry_count INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT FALSE,
        issued_at TIMESTAMP,
        verified_at TIMESTAMP,
        last_snapshot_at TIMESTAMP,
        next_refresh_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Audit log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor VARCHAR(255),
        action VARCHAR(255),
        target VARCHAR(255),
        ip_address VARCHAR(45),
        role VARCHAR(50),
        status VARCHAR(50),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Stripe events table (for webhook processing)
    await client.query(`
      CREATE TABLE IF NOT EXISTS stripe_events (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(255),
        data JSONB,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auth tokens table (for refresh token management)
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token_hash VARCHAR(255) NOT NULL,
        token_family VARCHAR(36),
        expires_at TIMESTAMP NOT NULL,
        revoked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Stripe connections table (stores encrypted OAuth tokens)
    await client.query(`
      CREATE TABLE IF NOT EXISTS stripe_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        stripe_user_id VARCHAR(255) NOT NULL UNIQUE,
        access_token_encrypted BYTEA NOT NULL,
        access_token_iv VARCHAR(32) NOT NULL,
        refresh_token_encrypted BYTEA,
        refresh_token_iv VARCHAR(32),
        livemode BOOLEAN DEFAULT FALSE,
        scope VARCHAR(255),
        account_name VARCHAR(255),
        account_url TEXT,
        account_country VARCHAR(2),
        connected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_token_refresh TIMESTAMP,
        expires_at TIMESTAMP,
        revoked_at TIMESTAMP,
        mrr BIGINT DEFAULT 0,
        arr BIGINT DEFAULT 0,
        active_customers INTEGER DEFAULT 0,
        last_metrics_fetch TIMESTAMP,
        metrics_fetch_error VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Revenue snapshots table (historical MRR/ARR data)
    await client.query(`
      CREATE TABLE IF NOT EXISTS revenue_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stripe_connection_id UUID NOT NULL REFERENCES stripe_connections(id) ON DELETE CASCADE,
        mrr BIGINT NOT NULL,
        arr BIGINT NOT NULL,
        active_customers INTEGER NOT NULL,
        snapshot_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, snapshot_date)
      );
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
      CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);
      CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(type);
      CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
      CREATE INDEX IF NOT EXISTS idx_stripe_connections_user_id ON stripe_connections(user_id);
      CREATE INDEX IF NOT EXISTS idx_stripe_connections_stripe_user_id ON stripe_connections(stripe_user_id);
      CREATE INDEX IF NOT EXISTS idx_revenue_snapshots_user_id ON revenue_snapshots(user_id);
      CREATE INDEX IF NOT EXISTS idx_revenue_snapshots_date ON revenue_snapshots(snapshot_date);
    `);

    await client.query('COMMIT');
    console.log('Database schema initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
