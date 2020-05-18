const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const bc = require("../utils/bc");

module.exports = router;

// GET USER PROFILE PAGE //////////////////////////////
router.route("/userProfile").get((req, res) => {
    // console.log(">>> GET > USER PROFILE req.session ", req.session);
    res.render("userProfile", {
        layout: "main",
        first: req.session.first
    });
});

// POST USER PROFILE PAGE //////////////////////////////
router.route("/userProfile").post((req, res) => {
    // console.log(">>> POST > USER PROFILE, req.body", req.body);
    let { city, age, url } = req.body;
    let currentUser = req.session.userId;
    if (
        url.startsWith("http://") &&
        url.startsWith("https://") &&
        url.startsWith("//")
    ) {
        url = "";
    }
    db.userProfileInfo(city, age, url, currentUser)
        .then(profileResults => {
            // console.log("Info Id is: ", profileResults);
            req.session.city = city;
            req.session.age = age;
            req.session.url = url;
            // console.log("userProfile req.session", req.session);
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("error in userProfile", err);
            res.render("userProfile", {
                layout: "main",
                error: "Sorry, please enter your details again"
            });
        });
});

// GET EDIT PROFILE ROUTE //////////////////////////////
router.route("/editProfile").get((req, res) => {
    console.log(">>> GET > EDIT PROFILE, req.session", req.session);
    if (req.session.userId) {
        db.getAllUserDetails(req.session.userId)
            .then(results => {
                const { first, last, city, age, url, email } = results.rows[0];
                console.log("results.rows[0]", results.rows[0]);
                res.render("editProfile", {
                    layout: "main",
                    first: first,
                    last: last,
                    city: city,
                    age: age,
                    url: url,
                    email: email
                });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.redirect("/login");
    }
});

// GET EDIT PROFILE PAGE //////////////////////////////
router.route("/editProfile").post((req, res) => {
    console.log(
        ">>> POST > EDIT PROFILE > req.body.password",
        req.body.password
    );
    console.log(">>> POST > EDIT PROFILE > req.body", req.body);
    if (req.session.userId) {
        const { first, last, email, city, age, url, password } = req.body;
        const { userId } = req.session;
        if (password) {
            bc.hashPassword(password)
                .then(hashedPassword => {
                    console.log(
                        "req.session.userId in post edit profile",
                        userId
                    );
                    Promise.all([
                        db.updateUserTable(
                            first,
                            last,
                            email,
                            hashedPassword,
                            userId
                        ),
                        db.updateUserProfileTable(city, age, url, userId)
                    ])
                        .then(results => {
                            req.session.first = first;
                            req.session.last = last;
                            req.session.email = email;
                            req.session.city = city;
                            req.session.age = age;
                            req.session.url = url;
                            console.log("password updated: ", hashedPassword);
                            res.redirect("/petition");

                            console.log(
                                "results after edit button clicked with password change: ",
                                results
                            );
                        })
                        .catch(err => {
                            console.log(err);
                            res.render("editProfile", {
                                layout: "main",
                                error: `Oops, something went wrong, there is an ${err}`
                            });
                        });
                })
                .catch(err => {
                    console.log("ERROR", err.message);
                });
        } else {
            Promise.all([
                db.updateUserTable(first, last, email, password, userId),
                db.updateUserProfileTable(city, age, url, userId)
            ])
                .then(results => {
                    req.session.first = first;
                    req.session.last = last;
                    req.session.email = email;
                    req.session.city = city;
                    req.session.age = age;
                    req.session.url = url;
                    console.log(
                        "req.session after update without password update",
                        req.session.userId,
                        req.session.signed
                    );
                    console.log(
                        "results after update without password update",
                        results
                    );
                    console.log(
                        "req.session after update without password update",
                        req.session
                    );

                    res.redirect("/petition");
                })
                .catch(err => {
                    console.log("POST PETITION EDITING error: ", err);
                    res.render("editProfile", {
                        layout: "main",
                        error: `Oops, something went wrong, there is an ${err}`
                    });
                });
        }
    } else {
        res.redirect("/login");
    }
});
