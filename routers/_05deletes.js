const express = require("express");
const router = express.Router();
const db = require("../utils/db");

module.exports = router;

//DELETE PROFILE PAGE

router.route("/deleteProfile").get((req, res) => {
    const { first, userId } = req.session;
    if (!userId) {
        res.redirect("/login");
    } else {
        res.render("deleteProfilePage", {
            layout: "main",
            first: first
        });
    }
});

// DELETE USER ROUTE ////////////////////////////
router.route("/deleteUser").post((req, res) => {
    db.deleteUser(req.session.userId)
        .then(() => {
            req.session = null;
            delete req.session;
            res.redirect("/");
        })
        .catch(err => console.log(err));
});

// DELETE SIGNATURE ROUTE ////////////////////////////
router.route("/deleteSignature").post((req, res) => {
    if (req.session.signid) {
        db.deleteSignature(req.session.signid)
            .then(() => {
                delete req.session.signid;
                req.session.signed = false;
                res.redirect("/petition");
            })
            .catch(err => console.log(err));
    } else {
        res.redirect("/petition");
    }
});
