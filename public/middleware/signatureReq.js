//middleware.js
// next is a function we must call in every middleware function

module.exports = {
    requireNoSignature
};

function requireNoSignature(req, res, next) {
    var signid = req.session.signid;
    // var signed = req.session.signed;
    if (signid) {
        console.log(
            "req.session.signid in requireNoSignature function",
            req.session.signid
        );
        console.log(
            "req.session.signed in requireNoSignature function",
            req.session.signed
        );
        console.log("req.session in requireNoSignature function", req.session);
        res.redirect("petition/signedPetition");
    } else {
        next();
    }
}
