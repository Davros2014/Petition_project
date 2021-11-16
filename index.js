// EXPRESS
const express = require("express");
const port = process.env.PORT || 8080;
const app = express();
const petition = "Petition";
exports.app = app;

app.use(express.static("./public"));

//IMPORT EXPRESS ROUTERS
const _01registration = require("./routers/_01registration"),
    _02login = require("./routers/_02login"),
    _03profile = require("./routers/_03profile"),
    _04petition = require("./routers/_04petition"),
    _05deletes = require("./routers/_05deletes");

// FOR HEROKU if stuff in gitignore FILE
// process.env.NODE_ENV === "production"
//     ? (secrets = process.env)
//     : (secrets = require("./secrets.json"));

const bodyParser = require("body-parser");

// HANDLEBARS
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// BODYPARSER
app.use(
    // for form POST
    bodyParser.urlencoded({
        extended: false
    })
);

const csurf = require("csurf");

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
// app.use(csurf({ cookie: true }));
app.use(csurf());

// CSRF TOKEN ///////////////////////////////
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader(`X-FRAME-OPTIONS`, `DENY`);
    res.locals.loggedin = req.session.userId;
    res.locals.first = req.session.first;
    next();
});

//USE routers
app.use(_01registration);
app.use(_02login);
app.use(_03profile);
app.use(_04petition);
app.use(_05deletes);

// GET HOME PAGE //////////////////////////////
app.get("/", (req, res) => {
    if (!req.session.userId) {
        res.render("intro", {
            layout: "main"
        });
    } else {
        res.redirect("/petition");
    }
});

// LOGOUT USERS //////////////////////////////
app.get("/logout", (req, res) => {
    req.session = null;
    res.locals.user = null;
    res.redirect("/");
});

// 404 MESSAGE //////////////////////////////
app.get("*", (req, res) => {
    res.render("redirect404", {
        layout: "forAllElse"
    });
    // } else {
    //     res.redirect("/petition");
    // }
});

// APP LISTEN 8080 //////////////////////////////////
app.listen(port, () =>
    console.log(
        `Hello, I've been expecting you, Project ${petition}...listening on port ${port}`
    )
);
