CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role INTEGER NOT NULL DEFAULT 1,
    user_name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now()
);
