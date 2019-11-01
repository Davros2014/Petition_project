var bcrypt = require("bcryptjs");

// will be called in POST registration route
module.exports.hashPassword = function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};

// var bcrypt = require("bcryptjs");

// textEnteredInLoginForm - is the password entered in the registration field
// checkPassword should be called in the POST / login route
module.exports.checkPassword = function checkPassword(
    textEnteredInLoginForm,
    hashedPasswordFromDatabase
) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch); // id doesMatch is true then password matches to the one on the database
                }
            }
        );
    });
};

// signatureId 2 corresponds with ID from signatures not userid
// userId: 3 corresponds with the ID from users!!

// {
// signatureId: 2,
// userId: 3
// }
//
// req.session.userId = 3
