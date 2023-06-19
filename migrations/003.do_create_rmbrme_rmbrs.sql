CREATE TABLE rmbrs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    person_id INTEGER REFERENCES people(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_modified TIMESTAMPTZ NOT NULL DEFAULT now()
);
