import { Pool } from 'pg';

export function getDb() {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
    });
}
