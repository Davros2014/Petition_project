//middleware.js
// next is a function we must call in every middleware function

module.exports = {
    requireNoSignature
};

function requireNoSignature(req, res, next) {
    var sigid = req.session.sigid;
    var signed = req.session.signed;
    if (sigid || signed) {
        console.log(
            "req.session.sigid in requireNoSignature function",
            req.session.sigid
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

// function requireNoSignature(req, res, next) {
//     if (req.session.signatureId) {
//         console.log(
//             "req.session.signatureId in requireNoSignature function",
//             req.session.signatureId
//         );
//         res.redirect("/petition/signedPetition");
//     } else {
//         next();
//     }
// }
