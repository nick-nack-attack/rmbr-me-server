CREATE TABLE rmbrme_users (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL UNIQUE, 
    password TEXT NOT NULL,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now()
);