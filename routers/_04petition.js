const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { requireNoSignature } = require("../public/middleware/signatureReq");

module.exports = router;

// GET PETITION PAGE //////////////////////////////
router.route("/petition").get(requireNoSignature, (req, res) => {
    const { first, userId } = req.session;
    res.render("petition", {
        layout: "main",
        first: first,
        loggedin: userId
    });
});

// POST SIGNED PETITION //////////////////////////////
router.route("/petition").post((req, res) => {
    if (req.body.signature) {
        db.signeesDb(req.body.signature, req.session.userId)
            .then(signedResults => {
                req.session.signid = signedResults.rows[0].id;
                req.session.signed = true;
                res.redirect("petition/signedPetition");
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        res.render("petition", {
            layout: "main",
            error: "Signature is empty, please sign"
        });
    }
});

// GET SIGNED PETITION //////////////////////////////
router.route("/petition/signedPetition").get((req, res) => {
    db.placeSignature(req.session.userId)
        .then(results => {
            res.render("signedPetition", {
                layout: "main",
                signeesList: results.rows,
                signatureImg: results.rows[0].signature,
                message:
                    "You signed already, but thanks again for your support!",
                first: req.session.first
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
router.route("/petitionSignees").get((req, res) => {
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
                        first: req.session.first
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
router.route("/petition/petitionSignees/:city").get((req, res) => {
    const city = req.params.city;
    db.getSignersByCity(city)
        .then(results => {
            let created = results.rows[0].created_at;
            let createdLocal = created.toLocaleDateString();
            res.render("petitionSignees", {
                layout: "main",
                // signeesList: results.rows,
                first: results.rows[0].first,
                created: createdLocal,
                city: city
            });
        })
        .catch(err => {
            console.log(err);
        });
});
