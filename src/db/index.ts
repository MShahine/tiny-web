import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

// Singleton function to ensure only one db instance is created
function singleton<Value>(name: string, value: () => Value): Value {
  const globalAny: any = global;
  globalAny.__singletons = globalAny.__singletons || {};

  if (!globalAny.__singletons[name]) {
    globalAny.__singletons[name] = value();
  }

  return globalAny.__singletons[name];
}

// Function to create the database connection and apply migrations if needed
function createDatabaseConnection() {
  const poolConnection = mysql.createPool({
    uri: process.env.DATABASE_URL!,
    connectionLimit: 10,
    timeout: 60000,
    reconnect: true,
    idleTimeout: 300000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    queueLimit: 0
  });
  return drizzle(poolConnection);
}

const db = singleton('db', createDatabaseConnection);

export { db, schema };

export * from './schema'
