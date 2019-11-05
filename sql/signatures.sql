-- SIGNATURES TABLE

DROP TABLE IF EXISTS signatures CASCADE;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    signature TEXT NOT NULL
);

-- WITH INTEGER NOT INT
-- CREATE TABLE signatures(
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
--     signature TEXT NOT NULL
-- );

-- INSERT INTO signatures (signature, user_id)
-- VALUES ('signature', 3);

-- Example for multple rows and less repetition
-- INSERT INTO public."Item" ("Id", name)
-- VALUES ('1', 'name1'),
-- ('2', 'name2'),
-- ('3','name3')


-- SELECT songs.name AS song_name, singers.name AS singer_name
-- FROM signers JOIN songs ON singers.id = songs.singer_id;
