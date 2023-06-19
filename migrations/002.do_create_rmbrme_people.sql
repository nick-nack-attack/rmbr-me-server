CREATE TYPE person_type AS ENUM (
  'Friend',
  'Family',
  'Work'
);

CREATE TABLE people (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL ,
    category person_type,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    first_met TIMESTAMPTZ,
    last_contact TIMESTAMPTZ,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_modified TIMESTAMPTZ NOT NULL DEFAULT now()
);
