var spicedPg = require("spiced-pg");
// var db = spicedPg("postgres:postgres:postgres@localhost:5432/salt-petition");

const dbUrl =
    process.env.DATABASE_URL ||
    "postgres:postgres:postgres@localhost:5432/salt-petition";
const db = spicedPg(dbUrl);

module.exports = {
    registration,
    getUserInfo,
    placeSignature,
    getSignees,
    totalSignees,
    getSignersByCity,
    getAllUserDetails,
    signeesDb,
    userProfileInfo,
    updateUserTable,
    updateUserProfileTable
};

//////////////////////////////////////////////////////
// REGISTRATION //////////////////////////////////////
//////////////////////////////////////////////////////
function registration(first, last, email, password) {
    return db.query(
        `
    INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4) RETURNING id
    `,
        [first, last, email, password]
    );
}

//////////////////////////////////////////////////////
// GET USER INFO /////////////////////////////////////
//////////////////////////////////////////////////////
function getUserInfo(email) {
    return db.query(
        `
        SELECT users.id AS id, users.first AS first, users.last AS last, users.email AS email, users.password AS password, signatures.signature AS signed
        FROM users
        LEFT OUTER JOIN signatures
        ON users.id = signatures.user_id
        WHERE email = $1
        `,
        [email]
    );
}

//////////////////////////////////////////////////////
// ENTER SIGNATURE INFO INTO SIGNATURE TABLE /////////
//////////////////////////////////////////////////////
function placeSignature(user_id) {
    return db.query(
        `
        SELECT signature FROM signatures WHERE user_id = $1;`,
        [user_id]
    );
}

//////////////////////////////////////////////////////
// GET SIGNEES ///////////////////////////////////////
//////////////////////////////////////////////////////
function getSignees() {
    return db.query(
        `
       SELECT first, last, city, age, url
       FROM signatures
       LEFT OUTER JOIN profile ON signatures.user_id = profile.user_id
       LEFT OUTER JOIN users ON signatures.user_id = users.id`
    );
}

//////////////////////////////////////////////////////
// SIGNATURE LIST COUNT //////////////////////////////
//////////////////////////////////////////////////////
function totalSignees() {
    return db.query(
        `
       SELECT COUNT(*) FROM signatures;
       `
    );
}

//////////////////////////////////////////////////////
// GET SIGNERS BY CITY LIST  /////////////////////////
//////////////////////////////////////////////////////
function getSignersByCity(city) {
    return db.query(
        `
       SELECT first, last, city, age
       FROM signatures
       LEFT OUTER JOIN profile ON signatures.user_id = profile.user_id
       LEFT OUTER JOIN users ON signatures.user_id = users.id
       WHERE LOWER(city) = LOWER($1)`,
        [city]
    );
}

//////////////////////////////////////////////////////
// GET ALL USERS DETAILS /////////////////////////////
//////////////////////////////////////////////////////
function getAllUserDetails(user_id) {
    return db.query(
        `
       SELECT first, last, city, age, url, email, password
       FROM users
       LEFT JOIN profile ON users.id = profile.user_id
       WHERE users.id = $1`,
        [user_id]
    );
}

//////////////////////////////////////////////////////
// SIGNEES ///////////////////////////////////////////
//////////////////////////////////////////////////////
function signeesDb(signature, user_id) {
    return db.query(
        `
        INSERT INTO signatures (signature, user_id)
        VALUES ($1, $2) RETURNING id;
        `,
        [signature, user_id]
    );
}

//////////////////////////////////////////////////////
// USER PROFILE > POST USERPROFILE ROUTE /////////////
//////////////////////////////////////////////////////
function userProfileInfo(city, age, url, user_id) {
    return db.query(
        `
    INSERT INTO profile (city, age, url, user_id )
    VALUES ($1, $2, $3, $4)
    `,
        [city, age, url, user_id]
    );
}

//////////////////////////////////////////////////////
// UPDATE USER TABLE  > POST EDIT PROFILE ROUTE //////
//////////////////////////////////////////////////////
function updateUserTable(first, last, email, password, user_id) {
    if (password) {
        return db.query(
            `
            UPDATE users
            SET first = $1, last = $2, email = $3, password = $4
            WHERE id = $5
            `,
            [first, last, email, password, user_id]
        );
    } else {
        return db.query(
            `
            UPDATE users
            SET first = $1, last = $2, email = $3
            WHERE id = $4
            `,
            [first, last, email, user_id]
        );
    }
}

//////////////////////////////////////////////////////
// UPDATE PROFILE TABLE  > POST EDIT PROFILE ROUTE ///
//////////////////////////////////////////////////////
function updateUserProfileTable(city, age, url, user_id) {
    return db.query(
        `
    INSERT INTO profile (city, age, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE
    SET city = $1, age = $2, url = $3;
    `,
        [city, age, url, user_id]
    );
}
