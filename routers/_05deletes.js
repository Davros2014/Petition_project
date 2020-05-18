const express = require("express");
const router = express.Router();
const db = require("../utils/db");

module.exports = router;

// DELETE USER ROUTE ////////////////////////////
router.route("/deleteUser").post((req, res) => {
    console.log(">>> POST > DELETE USER session before delete: ", req.session);
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
    console.log(
        ">>> POST > DELETE SIGNATURE session before delete: ",
        req.session
    );
    if (req.session.signid) {
        db.deleteSignature(req.session.signid)
            .then(() => {
                delete req.session.signid;
                console.log(
                    ">>> POST > DELETE SIGNATURE session after delete: ",
                    req.session
                );
                req.session.signed = false;
                res.redirect("/petition");
                // console.log("session after delete: ", req.session);
            })
            .catch(err => console.log(err));
    } else {
        res.redirect("/petition");
    }
});
