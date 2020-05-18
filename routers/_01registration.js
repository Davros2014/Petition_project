const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const bc = require("../utils/bc");
const expressSanitizer = require("express-sanitizer");

module.exports = router;

router.use(expressSanitizer());

// GET REGISTRATION PAGE //////////////////////////////
router.route("/registration").get((req, res) => {
    console.log(">>> GET > REGISTRATION > req.session!", req.session);
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
    console.log(">>> POST > REGISTRATION > req.body:", req.body);
    console.log(">>> POST > REGISTRATION > req.session:", req.session);
    const { first, last, email, password } = req.body;
    bc.hashPassword(password)
        .then(hashedPassword => {
            db.registration(first, last, email, hashedPassword)
                .then(results => {
                    console.log("the results are", results);
                    let userId = results.rows[0].id;
                    req.session = { userId, first, last, email };
                    console.log(
                        ">>> POST > REGISTRATION > req.session:",
                        req.session
                    );
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
