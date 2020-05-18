module.exports = {
    requireNoSignature
};

function requireNoSignature(req, res, next) {
    // id of users signature
    var signid = req.session.signid;
    // does users signature exist?
    var signed = req.session.signed;
    if (signid && signed) {
        console.log(">>> requireNoSignature > req.session.signid", signid);
        console.log(">>> requireNoSignature > req.session.signed", signed);
        console.log(">>> requireNoSignature > req.session", req.session);
        res.redirect("petition/signedPetition");
    } else {
        next();
    }
}
