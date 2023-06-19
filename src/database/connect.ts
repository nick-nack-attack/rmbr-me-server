import { DATABASE_URL } from '../config';

// utilities
import Knex from 'knex';

// database
export const db = Knex({
  client: 'pg',
  connection: DATABASE_URL
});

export let isConnected = false;

db.on('connected', () => { isConnected = true });
