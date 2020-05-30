CREATE TYPE occurrence AS ENUM (
  'Past',
  'Current'
);

CREATE TABLE rmbrme_rmbrs (
    id SERIAL PRIMARY KEY,
    rmbr_title TEXT NOT NULL,
    rmbr_text TEXT,
    category occurrence,
    person_id INTEGER REFERENCES rmbrme_people(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES rmbrme_users(id) ON DELETE CASCADE NOT NULL,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_modified TIMESTAMPTZ NOT NULL DEFAULT now()
);