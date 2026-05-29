import sql from 'mssql';
import { env } from '../config/env.js';

const config: sql.config = {
  server: env.db.server,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  options: {
    instanceName: env.db.instanceName,
    encrypt: env.db.encrypt,
    trustServerCertificate: env.db.trustServerCertificate
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

if (env.db.port) {
  config.port = env.db.port;
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export function getPool() {
  poolPromise ??= new sql.ConnectionPool(config).connect();
  return poolPromise;
}

export { sql };
