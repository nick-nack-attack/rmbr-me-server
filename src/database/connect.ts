import { DATABASE_URL } from '../config';

// utilities
import * as knex from 'knex';

// database
export const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

export let isConnected = false;

db.on('connected', () => { isConnected = true });
