//middleware.js
// next is a function we must call in every middleware function

module.exports = {
    requireNoSignature
};

function requireNoSignature(req, res, next) {
    if (req.session.sigid) {
        console.log(
            "req.session.sigid in requireNoSignature function",
            req.session.sigid
        );
        console.log("req.session in requireNoSignature function", req.session);
        res.render("signedPetition", {
            layout: "main",
            message: "You signed already, but thanks again for your support!"
        });
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
