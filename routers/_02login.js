const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const bc = require("../utils/bc");
const expressSanitizer = require("express-sanitizer");

module.exports = router;

router.use(expressSanitizer());

// GET LOGIN PAGE //////////////////////////////
router.route("/login").get((req, res) => {
    console.log(" === GET > LOGIN ROUTE === ");
    console.log("House in session, ", req.session);
    if (req.session.email) {
        res.redirect("petition/signedPetition");
    } else {
        res.render("login", {
            layout: "main"
        });
    }
});

// POST LOGIN FORM //////////////////////////////
router.route("/login").post((req, res) => {
    console.log(" === LOGIN > POST ROUTE === ");
    console.log("LOGIN>POST: email is :", req.body.email);
    console.log("LOGIN>POST: password is :", req.body.password);
    console.log("LOGIN>POST: SESSION BEFORE LOG-IN :", req.session);
    // check if email and password are true
    if (req.body.email && req.body.password) {
        db.getUserInfo(req.body.email)
            .then(results => {
                // console.log("results after post login >", results);
                let userid = results.rows[0].id;
                let first = results.rows[0].first;
                let last = results.rows[0].last;
                let email = results.rows[0].email;
                // let created = results.rows[0].created;
                let signid = results.rows[0].signid;

                // sets users id, first, last, email etc  to sessions
                req.session.userId = userid;
                req.session.first = first;
                req.session.last = last;
                req.session.email = email;
                // req.session.created = created;
                req.session.signid = signid;
                console.log("LOGIN>POST: SESSION AFTER LOG-IN :", req.session);
                if (results.rows.length == 1) {
                    console.log("LOGIN > POST: NOW CHECK PASSWORD");
                    bc.checkPassword(
                        req.body.password,
                        results.rows[0].password
                    )
                        .then(pwCheck => {
                            console.log("pwChecking....", pwCheck);
                            console.log(
                                "Hashed password...",
                                results.rows[0].password
                            );
                            if (pwCheck) {
                                // password matches
                                req.session.userId = results.rows[0].id;
                                console.log("results after pwCheck ", results);
                                if (results.rows[0].signed) {
                                    // Petition signed, redirect > petition/signedPetition"
                                    req.session.signed = true;
                                    res.redirect("/petition/signedPetition");
                                } else {
                                    // Petition not signed, redirect to /petition
                                    req.session.signed = false;
                                    res.redirect("/petition");
                                }
                            } else {
                                console.log(
                                    "req.session.userId ",
                                    req.session.userId
                                );
                                console.log(
                                    "Password wrong, pwCheck is",
                                    pwCheck
                                );
                                res.render("login", {
                                    layout: "main",
                                    loggedin: req.session.userId,
                                    error: "Please enter a valid password"
                                });
                            }
                        })
                        .catch(err => {
                            console.log("ERROR", err);
                            console.log("PASSWORD IS INCORRECT");
                        });
                } else {
                    console.log("not a valid email");
                    res.render("login", {
                        layout: "main",
                        loggedin: req.session.userId,
                        error: "Please re-enter a valid email"
                    });
                }
            })
            .catch(err => {
                console.log("ERROR", err);
                res.render("login", {
                    layout: "main",
                    loggedin: req.session.userId,
                    error: err,
                    first: req.session.first
                });
            }); // end > catch
    } else {
        console.log("missing email or password");
        res.render("login", {
            layout: "main",
            error: "missing email or password",
            first: req.session.first
        });
    } // end of if/else (email && password)
});
