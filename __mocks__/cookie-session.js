let tempSession,
    session = {};

module.exports = () => (req, res, next) => {
    //anonymous function that mocks the cookie session middleware
    req.session = tempSession || session;
    tempSession = null;
    next();
};
// mock session can be used for multiple tests. mocksessionOnce is literally ONCE
module.exports.mockSession = sess => (session = sess);

module.exports.mockSessionOnce = sess => (tempSession = sess);

// mockSession({
//     userId: 9
// });
