-- USER PROFILE  TABLE

DROP TABLE IF EXISTS profile CASCADE;

CREATE TABLE profile (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    age INT,
    url VARCHAR(255),
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);
-- ORIGINAL WITH CITY VARCHAR(255)

-- CREATE TABLE profile (
--     id SERIAL PRIMARY KEY,
--     city VARCHAR(255),
--     age INT,
--     url VARCHAR,
--     user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
-- );
-- REFERENCES users(id) UNIQUE

-- WITH INTEGER NOT INT on user_id
-- CREATE TABLE profile (
--     id SERIAL PRIMARY KEY,
--     city VARCHAR(23),
--     age INT,
--     url VARCHAR,
--     user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
-- );

-- INSERT INTO user_profile (city, age, url, user_id)
-- VALUES ('city', 34, 'url', 21);


--INSERT ABOVE DATA INTO USERS TABLE
-- for cites if user writes berlin, Berlin, BERLIN etc etc WHERE LOWER(city) = LOWER($1);
