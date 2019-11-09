// IMPORTS THE DATABASE FILE (where all of the db queries are written)
const db = require("./utils/db");
const bc = require("./utils/bc");

const { requireNoSignature } = require("./public/middleware/signatureReq");
// const profile = require("./routers/profile");

// EXPRESS
const express = require("express");
const app = express();
exports.app = app;

app.use(express.static("./public"));

// EXPRESS ROUTER
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
    res.locals.first = req.session.first;
    res.locals.loggedUser = req.session.first;
    res.locals.signid = req.session.signid;
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
app.post("/registration", (req, res) => {
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

// GET LOGIN PAGE //////////////////////////////
app.get("/login", (req, res) => {
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
app.post("/login", (req, res) => {
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

// GET USER PROFILE PAGE //////////////////////////////
app.get("/userProfile", (req, res) => {
    console.log("=== GET > USER PROFILE ROUTE ===");
    console.log(" req.session ", req.session);
    res.render("userProfile", {
        layout: "main",
        first: req.session.first
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
// GET PETITION PAGE //////////////////////////////
app.get("/petition", requireNoSignature, (req, res) => {
    console.log(" === GET > SIGN PETITION ROUTE === ");
    console.log("// if unsigned no signature ID at this point");
    console.log("req.session.sigid in get petition route", req.session.signid);
    console.log("req.session.signed in get petition route", req.session.signed);
    console.log("this is req.session in the sign petition route", req.session);
    // middleware checks if user has signed and redirects to signed page if so
    // otherwise runs next() > below
    res.render("petition", {
        layout: "main"
    });
});

// POST SIGNED PETITION //////////////////////////////
app.post("/petition", (req, res) => {
    console.log(" === PETITION > POST ROUTE === ");
    console.log("Req.session is ", req.session);
    console.log("UserId is :...", req.session.userId);
    // console.log("req.body", req.body);
    if (req.body.signature) {
        db.signeesDb(req.body.signature, req.session.userId)
            .then(signid => {
                console.log("signid, signid, signid, ", signid);
                req.session.signid = signid.rows[0].id; // assigns id to cookies
                res.redirect("petition/signedPetition");
                console.log("sigid.rows[0].id", signid.rows[0].id);
                console.log("signature id NOW is ", req.session.signid);
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.render("petition", {
            layout: "main",
            error: "Signature is empty, please sign"
            // first: req.session.first
        });
    }
});

// GET SIGNED PETITION //////////////////////////////
app.get("/petition/signedPetition", (req, res) => {
    console.log(" === GET > SIGNED PETITION ROUTE === ");
    console.log("check for this:", req.session);
    db.placeSignature(req.session.userId)
        .then(results => {
            res.render("signedPetition", {
                layout: "main",
                signeesList: results.rows,
                signatureImg: results.rows[0].signature,
                message:
                    "You signed already, but thanks again for your support!"
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

// DELETE SIGNATURE ROUTE ////////////////////////////
app.post("/deleteSignature", (req, res) => {
    console.log(" === POST > DELETE SIGNATURE ROUTE === ");
    console.log("session before delete: ", req.session);
    db.deleteSignature(req.session.signid)
        .then(() => {
            delete req.session.signid;
            res.redirect("/petition");
            console.log("session after delete: ", req.session);
        })
        .catch(err => console.log(err));
});

// DELETE USER ROUTE ////////////////////////////
app.post("/deleteUser", (req, res) => {
    console.log(" === POST > DELETE USE ROUTE === ");
    console.log("session before delete: ", req.session);
    db.deleteUser(req.session.userId)
        .then(() => {
            req.session = null;
            delete req.session;
            res.redirect("/");
        })
        .catch(err => console.log(err));
});

// GET ALL SIGNEES PAGE //////////////////////////////
app.get("/petitionSignees", (req, res) => {
    console.log(" === GET > LIST OF SIGNEES ROUTE === ");
    console.log("req.session", req.session);
    console.log("USERID at req.session.userId::::", req.session.userId);
    db.getSignees()
        .then(results => {
            return db
                .totalSignees()
                .then(data => {
                    let created = results.rows[0].created_at;
                    let createdLocal = created.toLocaleDateString();
                    res.render("petitionSignees", {
                        layout: "main",
                        signeesList: results.rows,
                        count: data.rows[0].count,
                        created: createdLocal,
                        first: res.locals.first
                    });
                    // console.log("contents of results::::", results);
                    console.log("contents of session::::", req.session);
                    console.log("results.rows[0].created_at", createdLocal);
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
            let created = results.rows[0].created_at;
            let createdLocal = created.toLocaleDateString();
            res.render("petitionSignees", {
                layout: "main",
                signeesList: results.rows,
                first: results.rows[0].first,
                created: createdLocal
            });
        })
        .catch(err => {
            console.log(err);
        });
});

// GET EDIT PROFILE ROUTE //////////////////////////////
app.get("/editProfile", (req, res) => {
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
