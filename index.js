// IMPORTS THE DATABASE FILE (where all of the db queries are written)
const db = require("./utils/db");
const bc = require("./utils/bc");

const { requireNoSignature } = require("./public/middleware/signatureReq");

// EXPRESS
const express = require("express");
const app = express();
exports.app = app;

app.use(express.static("./public"));

// EXPRESS Router
// const profileRouter = require("./routers/profile");
// app.use(profileRouter); -- refine once fixed

// FOR HEROKU if stuff in gitignore FILE
// process.env.NODE_ENV === "production"
//     ? (secrets = process.env)
//     : (secrets = require("./secrets.json"));

const bodyParser = require("body-parser");

// HANDLEBARS
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const csurf = require("csurf");

// BODYPARSER
app.use(
    // for form POST
    bodyParser.urlencoded({
        extended: false
    })
);
// FOR HEROKU
// const dbUrl = process.env.DATABSE_URL || `postgres:$[]`;

// USES COOKIE SESSION NOT PARSER

const cookieSession = require("cookie-session");
// how long cookie lasts - in this case 2 weeks (numbers in seconds)
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

//use after cookie and body parser
app.use(csurf());

// TOKEN ///////////////////////////////
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader(`X-FRAME-OPTIONS`, `DENY`);
    res.locals.loggedin = req.session.userId;
    // res.locals.first = req.session.first;
    // res.locals.loggedUser = req.session.first;
    next();
});

// GET HOME PAGE //////////////////////////////
app.get("/", (req, res) => {
    console.log("=== GET HOME PAGE WORKS === ");
    res.render("intro", {
        layout: "main"
    });
});

// GET REGISTRATION PAGE //////////////////////////////
app.get("/registration", (req, res) => {
    console.log("req.body, ", req.body);
    console.log("=== GET REGISTRATION PAGE === !");
    res.render("registration", {
        layout: "main"
    });
});

// POST REGISTRATION FORM //////////////////////////////
app.post("/registration", (req, res) => {
    console.log("=== REGISTRATION > POST === !");
    console.log("here is the password: ", req.body.password);
    bc.hashPassword(req.body.password)
        .then(hashedPassword => {
            // hash password
            console.log("#### password is", hashedPassword);
            db.registration(
                req.body.first,
                req.body.last,
                req.body.email,
                hashedPassword
            )
                .then(results => {
                    console.log("the results are", results);
                    let userid = results.rows[0].id;
                    req.session.userId = userid;
                    res.redirect("/userProfile");
                    console.log("the userid is", userid);
                })
                .catch(err => {
                    console.log(err);
                    res.render("registration", {
                        layout: "main",
                        error:
                            "Sorry, the information you supplied was incorrect or missing, please enter your details again"
                    });
                });
        })
        .catch(err => {
            console.log(err);
        });
});

// GET LOGIN PAGE //////////////////////////////
app.get("/login", (req, res) => {
    console.log(" === GET > LOGIN ROUTE === ");
    console.log("House in session, ", req.session);
    res.render("login", {
        layout: "main"
    });
});

// POST LOGIN FORM //////////////////////////////
app.post("/login", (req, res) => {
    console.log(" === LOGIN > POST ROUTE === ");
    console.log("email is :", req.body.email);
    console.log("password is :", req.body.password);
    // check if email and password are true
    if (req.body.email && req.body.password) {
        db.getUserInfo(req.body.email)
            .then(results => {
                console.log("results after getUserInfo are : ", results);
                if (results.rows.length == 1) {
                    console.log("NOW CHECK PASSWORD");
                    console.log("result.rows.length is: ", results.rows.length);
                    console.log("req.body.password is: ", req.body.password);
                    console.log(
                        "result.rows[0].password: ",
                        results.rows[0].password
                    );
                    console.log("results are ", results);
                    bc.checkPassword(
                        req.body.password,
                        results.rows[0].password
                    )
                        .then(pwCheck => {
                            console.log(
                                "IS PETITION SIGNED ",
                                req.session.signed
                            );
                            console.log(
                                "Hashed password...",
                                results.rows[0].password
                            );
                            console.log("pwCheck ", pwCheck);

                            if (pwCheck) {
                                // password matches
                                req.session.userId = results.rows[0].id;
                                req.session.name = results.rows[0].first;
                                console.log(
                                    "Logged in > is there a signature ",
                                    results.rows[0].signed
                                );
                                if (results.rows[0].signed) {
                                    console.log(
                                        "Petition already signed, redirect to /petition/signedPetition"
                                    );
                                    req.session.signed = true;
                                    res.redirect("/petition/signedPetition");
                                } else {
                                    console.log(
                                        "Petition not yet signed, redirecting to /petition"
                                    );
                                    req.session.signed = false;
                                    res.redirect("/petition");
                                }
                            } else {
                                console.log(
                                    "req.session.userId ",
                                    req.session.userId
                                );
                                console.log(
                                    "req.session.userId ",
                                    req.session.userId
                                );
                                console.log("req.session.id ", req.session.id);
                                console.log(
                                    "Password wrong, pwCheck is",
                                    pwCheck
                                );
                                res.render("login", {
                                    layout: "main",
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
                        error: "Please re-enter a valid email"
                    });
                }
            })
            .catch(err => {
                console.log("ERROR", err);
                res.render("login", {
                    layout: "main",
                    error: err
                }); // end of render
            }); // end of catch
    } else {
        console.log("missing email or password");
        res.render("login", {
            layout: "main",
            error: "missing email or password"
        });
    } // end of if /else (email && pass)
});

// GET USER PROFILE PAGE //////////////////////////////
app.get("/userProfile", (req, res) => {
    console.log("=== GET > USER PROFILE ROUTE ===");
    res.render("userProfile", {
        layout: "main"
    });
});

// POST USER PROFILE PAGE //////////////////////////////
app.post("/userProfile", (req, res) => {
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
    // console.log("HERE IS req.body :", req.body);
    // console.log("HERE IS req.session :", req.session);
    // console.log("HERE IS req.session.userid :", req.session.userId);
    console.log("USER PROFILE PAGE CHECKS OUT ON POST");
    db.userProfileInfo(
        req.body.city,
        req.body.age,
        req.body.userUrl,
        req.session.userId
    )
        .then(profileResults => {
            console.log("Info Id is: ", profileResults);
            // console.log("Info Id is: ", infoId.rows[0].id);
            // console.log("Info Id is...", req.session.infoId);
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
// GET PETITION PAGE //////////////////////////////
app.get("/petition", requireNoSignature, (req, res) => {
    console.log(
        "this is the get request for body in the sign petition route",
        req.session
    );
    console.log(" === GET > SIGN PETITION ROUTE === ");
    console.log("signature id is ", req.session.sigid);
    console.log("req.session", req.session);
    // middleware checks if user has signed and redirects to signed page if so
    // otherwise runs next() > below
    res.render("petition", {
        layout: "main"
    });
    console.log(" === GET PETITION WORKS FINE === ");
});

// POST SIGNED PETITION //////////////////////////////
app.post("/petition", requireNoSignature, (req, res) => {
    console.log(" === PETITION > POST ROUTE === ");

    // console.log("post accept is ...", req.body.accept);
    // console.log("signature is ...", req.body.signature);
    // console.log("THIS IS....", req.session.userid);
    console.log("signature id is ", req.session.sigid);
    console.log("ID is :...", req.session.userId);
    // console.log("req.body", req.body);
    console.log("req.session", req.session);

    db.signeesDb(req.body.signature, req.session.userId)
        .then(sigid => {
            req.session.sigid = sigid.rows[0].id; // assigns id to cookies
            res.redirect("petition/signedPetition");
            console.log("sigid.rows[0].id", sigid.rows[0].id);
        })
        .catch(err => {
            console.log(err);
            res.render("petition", {
                layout: "main",
                error: "Sorry, please enter your details again"
            });
        });
});

// GET SIGNED PETITION //////////////////////////////
app.get("/petition/signedPetition", (req, res) => {
    console.log(" === GET > SIGNED PETITION ROUTE === ");
    console.log("check for this:", req.session);
    console.log("REQ > BODY:", req.body);
    db.placeSignature(req.session.userId)
        .then(results => {
            console.log("RESULTS ARE ...", results);
            console.log("number of signees so far is = ", results.rowCount);
            console.log("my name is = ", results.rows);

            console.log("results.rows::::", results.rows[0]);
            console.log("results.rowCount", results.rowCount);
            res.render("signedPetition", {
                layout: "main",
                signeesList: results.rows,
                signatureImg: results.rows[0].signature,
                signeesTotal: results.rowCount
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect(err, "petition/signedPetition", {
                layout: "main",
                error: "Sorry, please enter your details again"
            });
        });
});

// GET ALL SIGNEES PAGE //////////////////////////////
app.get("/petitionSignees", (req, res) => {
    console.log(" === GET > LIST OF SIGNEES ROUTE === ");
    console.log("req.session", req.session);
    console.log("req.session", req.params.city);
    db.getSignees()
        .then(results => {
            // console.log("hvyyv", results);
            return db
                .totalSignees()
                .then(data => {
                    res.render("petitionSignees", {
                        layout: "main",
                        signeesList: results.rows,
                        count: data.rows[0].count
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
});

// GET SIGNEES BY CITY PAGE //////////////////////////////
app.get("/petition/petitionSignees/:city", (req, res) => {
    console.log(" === GET > SIGNEES BY CITY ROUTE === ");
    const city = req.params.city;
    console.log("city is:", city);
    db.getSignersByCity(city)
        .then(results => {
            res.render("petitionSignees", {
                layout: "main",
                signeesList: results.rows
            });
        })
        .catch(err => {
            console.log(err);
        });
});
app.get("/editProfile", (req, res) => {
    console.log(" === GET > THE EDIT PAGE! === ");
    console.log("cookie userID > req.session.userid", req.session.userId);
    if (req.session.userId) {
        console.log("req.session.userid", req.session.userId);
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
app.post("/editProfile", (req, res) => {
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
                        res.redirect("/petition");
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
});

// LOGOUT USERS //////////////////////////////
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

// 404 MESSAGE //////////////////////////////
app.get("*", (req, res) => {
    // console.log("FOR ALL OTHER ROUTES THERE'S MASTERCARD");
    res.render("redirect404", {
        layout: "forAllElse"
    });
});

// APP LISTEN 8080 //////////////////////////////////
app.listen(process.env.PORT || 8080, () =>
    console.log("Hello, I've been expecting you, Mr Bond...")
);

// WITH SUPERTEST
// if (require.main == module) {
//     app.listen(process.env.PORT || 8080, () =>
//         console.log("Hello, I've been expecting you, Mr Bond...")
//     );
// }

// END OF FILE ////////////////////////////////
//
//
//
//
//
//
//
//
//
//
//
//
//

// NOTES & STUFF //////////////////////////////

// PROMISE ALL EXAMPLE

// Promise.all([
//     db.update(req.session.userId, req.body),
//     db.epsertUserProfile(req.session.userId, req.body)
// ]).then(function() {

//
// db.updateUser(req.session.userId, req.body).then(
//     () => db.upsertUserProfile(req.session.userId, req.body)).then(function(){
//
// })

//signers being name of signed page

// app.get("/cookie", (req, res) => {
//     // console.log("cookie monster...", res.cookie);
//     res.send(`
//         <!doctype html>
//         <title>Hello!</title>
//         <h1>Hello, please click the box below to accept cookies!!!</h1>
//         <form method="POST">
//             <input type="checkbox" name="accept"> I accept cookies</input>
//             <button>SUBMIT</button>
//         </form>
//     `);
// });

// app.get("/cookie-test", (req, res) => {
//     console.log("GET/ cookie test hit!");
//     req.session.signatureId = 20000; // WHAT TO WITH THIS????
//     // session comes from the middleware function we just pasted above
//     // req.session is an object - we can properties like a normal object using dot/bracket notation
//     // so what we're doing here is adding a property to our cookie that's called "cookie" and the value of "cookie" is true
//     req.session.cookie = true;
//     console.log("what's in my cookie is", req.session);
//     // res.statusCode = 404;
//     res.render("registration", {
//         layout: "main"
//     });
// });

// req.session.userId = 3;
// res.redirect('/petition/signers')

//with supertest
// if (require.main == module) {
//     app.listen(process.env.PORT || 8080, () =>
//         console.log("Hello, I've been expecting you, Mr Bond...")
//     );
// }
