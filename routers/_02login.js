const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const bc = require("../utils/bc");
const expressSanitizer = require("express-sanitizer");

module.exports = router;

router.use(expressSanitizer());

// GET LOGIN PAGE //////////////////////////////
router.route("/login").get((req, res) => {
    const { email, first, userId } = req.session;
    console.log(">>> GET > LOGIN > req.session", req.session);
    if (email) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main",
            first: first,
            loggedin: userId
        });
    }
});

// POST LOGIN FORM //////////////////////////////
router.route("/login").post((req, res) => {
    // console.log(">>> POST > LOGIN > req.body", req.body);
    const { email, password } = req.body;
    if (email && password) {
        db.getUserInfo(email)
            .then(results => {
                // console.log(
                //     ">>> POST > LOGIN > results after post login >",
                //     results
                // );
                if (results.rows.length === 1) {
                    let {
                        id,
                        first,
                        last,
                        email,
                        signed,
                        signid
                    } = results.rows[0];
                    let hashedPassword = results.rows[0].password;
                    let userId = results.rows[0].id;
                    // NOW CHECK PASSWORD
                    return bc
                        .checkPassword(password, hashedPassword)
                        .then(passwordCheck => {
                            if (passwordCheck) {
                                console.log("After passwordCheck ", results);
                                req.session = {
                                    id,
                                    first,
                                    last,
                                    email,
                                    userId,
                                    signid,
                                    signed
                                };
                                console.log("req.session", req.session);
                                if (signed) {
                                    req.session.signed = true;
                                    res.redirect("/petition");
                                } else {
                                    req.session.signed = false;
                                    res.redirect("/petition");
                                }
                            } else {
                                console.log("Password was: ", passwordCheck);
                                res.render("login", {
                                    layout: "main",
                                    loggedin: req.session.userId,
                                    first: req.session.first,
                                    error: "Please enter a valid password"
                                });
                            }
                        })
                        .catch(err => {
                            console.log("ERROR, PASSWORD IS INCORRECT", err);
                            res.sendStatus(500);
                        });
                } else {
                    // not a valid email
                    res.render("login", {
                        layout: "main",
                        loggedin: req.session.userId,
                        error: "Please re-enter a valid email"
                    });
                }
            })
            // no email found
            .catch(err => {
                console.log("ERROR", err);
                res.render("login", {
                    layout: "main",
                    loggedin: req.session.userId,
                    error:
                        "Sorry, the email does not appear to exist on our system",
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

///////////////
