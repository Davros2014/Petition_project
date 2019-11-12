const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const bc = require("../utils/bc");

module.exports = router;

// GET USER PROFILE PAGE //////////////////////////////
router.route("/userProfile").get((req, res) => {
    console.log("=== GET > USER PROFILE ROUTE ===");
    console.log(" req.session ", req.session);
    res.render("userProfile", {
        layout: "main",
        first: req.session.first
    });
});

// POST USER PROFILE PAGE //////////////////////////////
router.route("/userProfile").post((req, res) => {
    console.log("=== USER PROFILE > POST ROUTE ===");
    console.log("url is ....", req.body.userUrl);
    let url = req.body.userUrl;
    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://") &&
        !url.startsWith("//")
    ) {
        url = "";
    }
    console.log("USER PROFILE PAGE CHECKS OUT ON POST");
    db.userProfileInfo(
        req.body.city,
        req.body.age,
        req.body.userUrl,
        req.session.userId
    )
        .then(profileResults => {
            console.log("Info Id is: ", profileResults);
            res.redirect("/petition");
        })
        .catch(err => {
            console.log(err);
            res.render("userProfile", {
                layout: "main",
                error:
                    "* Sorry, there is a problem, please try entering your details again"
            });
        });
});

// GET EDIT PROFILE ROUTE //////////////////////////////
router.route("/editProfile").get((req, res) => {
    console.log(" === GET > THE EDIT PAGE! === ");
    console.log("cookie userID > req.session.userId", req.session.userId);
    if (req.session.userId) {
        console.log("req.session.userId", req.session.userId);
        db.getAllUserDetails(req.session.userId)
            .then(results => {
                console.log("first name is ", results.rows[0].first);
                res.render("editProfile", {
                    layout: "main",
                    first: results.rows[0].first,
                    last: results.rows[0].last,
                    city: results.rows[0].city,
                    age: results.rows[0].age,
                    url: results.rows[0].url,
                    email: results.rows[0].email
                });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.render("intro", {
            layout: "main"
        });
    }
});

// GET EDIT PROFILE PAGE //////////////////////////////
router.route("/editProfile").post((req, res) => {
    console.log(" === EDIT PROFILE > POST ROUTE === ");
    console.log("req.body.password", req.body.password);
    if (req.body.password) {
        bc.hashPassword(req.body.password)
            .then(hashedPassword => {
                console.log(
                    "req.session Id in edit profile > post route: ",
                    req.session.userId
                );
                Promise.all([
                    db.updateUserTable(
                        req.body.first,
                        req.body.last,
                        req.body.email,
                        hashedPassword,
                        req.session.userId
                    ),
                    db.updateUserProfileTable(
                        req.body.city,
                        req.body.age,
                        req.body.url,
                        req.session.userId
                    )
                ])
                    .then(results => {
                        req.session.first = req.body.first;
                        res.redirect("/editProfile");
                        console.log(
                            "results after edit button clicked: ",
                            results
                        );
                    })
                    .catch(err => {
                        console.log(err);
                        res.render("editProfile", {
                            layout: "main",
                            // userData: results.rows[0],
                            error: `Oops, something went wrong, there is an ${err}`
                        });
                    });
            })
            .catch(err => {
                console.log("ERROR", err.message);
            });
    } else {
        Promise.all([
            db.updateUserTable(
                req.body.first,
                req.body.last,
                req.body.email,
                req.body.password,
                req.session.userId
            ),
            db.updateUserProfileTable(
                req.body.city,
                req.body.age,
                req.body.url,
                req.session.userId
            )
        ])
            .then(results => {
                console.log("update response: ", results);
                // req.session.first = req.body.first;
                res.redirect("/editProfile");
            })
            .catch(err => {
                console.log("POST PETITION EDITING error: ", err);
                res.render("editProfile", {
                    layout: "main",
                    error: `Oops, something went wrong, there is an ${err}`
                });
            });
    }
});
