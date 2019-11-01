var spicedPg = require("spiced-pg");
// var db = spicedPg("postgres:postgres:postgres@localhost:5432/salt-petition");

const dbUrl =
    process.env.DATABASE_URL ||
    "postgres:postgres:postgres@localhost:5432/salt-petition";
const db = spicedPg(dbUrl);

//////////////////////////////////////////////////////
// GET USERINFO //////////////////////////////////////
//////////////////////////////////////////////////////
// module.exports.getUserInfo = function getUserInfo(email) {
//     return db.query(
//         `
//         SELECT signature FROM signatures WHERE user_id = $1;`,
//         [email]
//     );
// };

// module.exports.getUserInfo = function getUserInfo(email) {
//     return db.query(
//         `
//         SELECT users.id AS id, users.first AS first, users.last AS last, users.email AS email, users.password AS password, signatures.signature AS signed
//         FROM users
//         LEFT OUTER JOIN signatures
//         ON users.id = signatures.user_id
//         WHERE email = $1
//         `,
//         [email]
//     );
// };

//////////////////////////////////////////////////////
// ENTER SIGNATURE INFO INTO SIGNATURE TABLE /////////
//////////////////////////////////////////////////////
module.exports.placeSignature = function placeSignature(user_id) {
    return db.query(
        `
        SELECT signature FROM signatures WHERE user_id = $1;`,
        [user_id]
    );
};

// GET LIST OF signees
// SELECT (all properties that you require)
// FROM signatures (the table you wish to add to - in this case that has a signature)
// LEFT OUTER JOIN user_profile ON signatures.user_id = user_profile.user_id -
// LEFT OUTER JOIN users ON signatures.user_id = users.id

//////////////////////////////////////////////////////
// GET SIGNEES ///////////////////////////////////////
//////////////////////////////////////////////////////
module.exports.getSignees = function getSignees() {
    return db.query(
        `
       SELECT first, last, city, age, url
       FROM signatures
       LEFT OUTER JOIN profile ON signatures.user_id = profile.user_id
       LEFT OUTER JOIN users ON signatures.user_id = users.id`
    );
}; // SELECTS all user data from

//////////////////////////////////////////////////////
// SIGNATURE LIST COUNT //////////////////////////////
//////////////////////////////////////////////////////
module.exports.totalSignees = function totalSignees() {
    return db.query(
        `
       SELECT COUNT(*) FROM signatures;
       `
    );
};
//test
// SELECT first, last, city, age, url, signature
// FROM user_profile
// LEFT OUTER JOIN signatures ON user_profile.user_id = signatures.user_id
// LEFT OUTER JOIN users ON signatures.user_id = users.id

module.exports.getSignersByCity = function getSignersByCity(city) {
    return db.query(
        `
       SELECT first, last, city, age
       FROM signatures
       LEFT OUTER JOIN profile ON signatures.user_id = profile.user_id
       LEFT OUTER JOIN users ON signatures.user_id = users.id
       WHERE LOWER(city) = LOWER($1)`,
        [city]
    );
};

//////////////////////////////////////////////////////
// GET ALL USERS DETAILS /////////////////////////////
//////////////////////////////////////////////////////

module.exports.getAllUserDetails = function getAllUserDetails(user_id) {
    return db.query(
        `
       SELECT first, last, city, age, url, email, password
       FROM users
       LEFT JOIN profile ON users.id = profile.user_id
       WHERE users.id = $1`,
        [user_id]
    );
};

//////////////////////////////////////////////////////
// SIGNEES ///////////////////////////////////////////
//////////////////////////////////////////////////////

module.exports.signeesDb = function signeesDb(signature, user_id) {
    return db.query(
        `
        INSERT INTO signatures (signature, user_id)
        VALUES ($1, $2) RETURNING id;
        `,
        [signature, user_id]
    );
};

//////////////////////////////////////////////////////
// REGISTRATION //////////////////////////////////////
//////////////////////////////////////////////////////

module.exports.registration = function registration(
    first,
    last,
    email,
    password
) {
    return db.query(
        `
    INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4) RETURNING id
    `,
        [first, last, email, password]
    );
};

//////////////////////////////////////////////////////
// USER PROFILE > POST USERPROFILE ROUTE /////////////
//////////////////////////////////////////////////////

module.exports.userProfileInfo = function userProfileInfo(
    city,
    age,
    url,
    user_id
) {
    return db.query(
        `
    INSERT INTO profile (city, age, url, user_id )
    VALUES ($1, $2, $3, $4)
    `,
        [city, age, url, user_id]
    );
};

//////////////////////////////////////////////////////
// UPDATE USER TABLE  > POST EDIT PROFILE ROUTE //////
//////////////////////////////////////////////////////

// UPDATE USERS TABLE >> DO UPDATE
module.exports.updateUserTable = function updateUserTable(
    first,
    last,
    email,
    password,
    id
) {
    return db.query(
        `
    UPDATE users SET first = $1, last = $2, email = $3, password = $4
    WHERE id = $5  RETURNING first, last, email, password;
    `,
        [first, last, email, password, id]
    );
};

//////////////////////////////////////////////////////
// UPDATE PROFILE TABLE  > POST EDIT PROFILE ROUTE ///
//////////////////////////////////////////////////////

// UPDATE PROFILE TABLE >> DO UPSERT
module.exports.updateUserProfileTable = function updateUserProfileTable(
    city,
    age,
    url,
    user_id
) {
    return db.query(
        `
    INSERT INTO profile (city, age, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET city = $1, age = $2, url = $3;
    `,
        [city, age, url, user_id]
    );
};

//////////////////////////////////////////////////////
// GET USER INFO /////////////////////////////////////
//////////////////////////////////////////////////////

// GET USER INFO
module.exports.getUserInfo = function getUserInfo(email) {
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
};
