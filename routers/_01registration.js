const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const bc = require("../utils/bc");
const expressSanitizer = require("express-sanitizer");

module.exports = router;

router.use(expressSanitizer());

// GET REGISTRATION PAGE //////////////////////////////
router.route("/registration").get((req, res) => {
    if (!req.session.userId) {
        res.render("registration", {
            layout: "main",
            loggedin: req.session.userId,
            first: req.session.first
        });
    } else {
        res.redirect("/petition");
    }
});

// POST REGISTRATION FORM //////////////////////////////
router.route("/registration").post((req, res) => {
    const { first, last, email, password } = req.body;
    bc.hashPassword(password)
        .then(hashedPassword => {
            db.registration(first, last, email, hashedPassword)
                .then(results => {
                    let userId = results.rows[0].id;
                    req.session = { userId, first, last, email };
                    res.redirect("/userProfile");
                })
                .catch(err => {
                    console.log(err);
                    res.render("registration", {
                        layout: "main",
                        error: err
                    });
                });
        })
        .catch(err => {
            console.log(err);
        });
});
