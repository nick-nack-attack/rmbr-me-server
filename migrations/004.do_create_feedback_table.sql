CREATE TYPE feedback_type AS ENUM (
  'Bug',
  'New Feature',
  'Random'
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    text TEXT,
    category feedback_type,
	date_created TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_modified TIMESTAMPTZ NOT NULL DEFAULT now()
);
