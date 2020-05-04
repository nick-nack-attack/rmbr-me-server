CREATE TYPE person_type AS ENUM (
  'Friend',
  'Family',
  'Co-Worker'
);

CREATE TABLE rmbrme_people (
    id SERIAL PRIMARY KEY,
    person_name TEXT NOT NULL ,
    type_of_person person_type,
    user_id INTEGER REFERENCES rmbrme_users(id) ON DELETE CASCADE NOT NULL,
    first_met TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_contact TIMESTAMPTZ,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_modified TIMESTAMPTZ NOT NULL DEFAULT now()
);