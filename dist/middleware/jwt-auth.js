// jwt authentication 
var AuthService = require('../auth/auth-service');
function requireAuth(req, res, next) {
    var authToken = req.get('Authorization') || '';
    var bearerToken;
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res
            .status(401)
            .json({ error: 'Missing bearer token' });
    }
    else {
        // slice off 'beaer ' from the token
        bearerToken = authToken.slice(7, authToken.length);
    }
    ;
    try {
        var payload = AuthService.verifyJwt(bearerToken);
        AuthService.getUserWithUsername(req.app.get('db'), payload.sub)
            .then(function (user) {
            if (!user)
                return res
                    .status(401)
                    .json({
                    error: 'Unauthorized request'
                });
            req.user = user;
            next();
        })
            .catch(function (err) {
            next(err);
        });
    }
    catch (error) {
        res
            .status(401)
            .json({
            error: 'Unauthorized request'
        });
    }
    ;
}
;
module.exports = {
    requireAuth: requireAuth
};
