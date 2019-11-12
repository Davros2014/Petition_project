const express = require("express");
const router = express.Router();
const db = require("../utils/db");

module.exports = router;

// DELETE SIGNATURE ROUTE ////////////////////////////
router.route("/deleteSignature").post((req, res) => {
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
router.route("/deleteUser").post((req, res) => {
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
