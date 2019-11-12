const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const bc = require("../utils/bc");
const expressSanitizer = require("express-sanitizer");

module.exports = router;

router.use(expressSanitizer());

// GET REGISTRATION PAGE //////////////////////////////
router.route("/registration").get((req, res) => {
    console.log("req.session, ", req.session);
    console.log("=== GET REGISTRATION PAGE === !");
    if (!req.session.userId) {
        res.render("registration", {
            layout: "main",
            loggedin: req.session.userId
        });
    } else {
        res.redirect("/petition");
    }
});

// POST REGISTRATION FORM //////////////////////////////
router.route("/registration").post((req, res) => {
    console.log("=== REGISTRATION > POST === !");
    console.log("here is the password: ", req.body.password);
    bc.hashPassword(req.body.password)
        .then(hashedPassword => {
            // hash password
            console.log("# Hashed password is", hashedPassword);
            db.registration(
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPassword
            )
                .then(results => {
                    console.log("the results are", results);
                    let userid = results.rows[0].id;
                    let first = req.body.first;
                    let last = req.body.last;
                    let email = req.body.email;
                    // sets users id, first, last, email etc  to sessions
                    req.session.userId = userid;
                    req.session.first = first;
                    req.session.last = last;
                    req.session.email = email;
                    res.redirect("/userProfile");
                })
                .catch(err => {
                    console.log(err);
                    res.render("registration", {
                        layout: "main",
                        error:
                            "Sorry, the email you supplied is invalid or or already in use, please enter your details again"
                    });
                });
        })
        .catch(err => {
            console.log(err);
        });
});
