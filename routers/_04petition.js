const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { requireNoSignature } = require("../public/middleware/signatureReq");

module.exports = router;

// GET PETITION PAGE //////////////////////////////
router.route("/petition").get(requireNoSignature, (req, res) => {
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
router.route("/petition").post((req, res) => {
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
router.route("/petition/signedPetition").get((req, res) => {
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

// GET ALL SIGNEES PAGE //////////////////////////////
router.route("/petitionSignees").get((req, res) => {
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
router.route("/petition/petitionSignees/:city").get((req, res) => {
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
                created: createdLocal,
                city: results.rows[0].city
            });
        })
        .catch(err => {
            console.log(err);
        });
});
