-- REGISTRATION TABLE

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- INSERT INTO users (first, last, email, password)
-- VALUES ('firstName', 'LastName', 'email', 'password');
-- take id from users table and store in the the cookie
