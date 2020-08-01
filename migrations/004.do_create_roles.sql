CREATE TYPE types_of_roles AS ENUM (
  'Admin',
  'End-User'
);

CREATE TABLE "roles" (
    id SERIAL PRIMARY KEY,
    role types_of_roles,
    date_created TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "rmbrme_users" ADD COLUMN "role" REFERENCES roles(id) ON DELETE CASCADE NOT NULL,

