// replaced by jwt
// left here for reference
var AuthService = require('../auth/auth-service');
function requireAuth(req, res, next) {
    var authToken = req.get('Authorization') || '';
    var basicToken;
    if (!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' });
    }
    else {
        basicToken = authToken.slice('basic '.length, authToken.length);
    }
    ;
    var _a = AuthService.parseBasicToken(basicToken), tokenUsername = _a[0], tokenPassword = _a[1];
    if (!tokenUsername || !tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    ;
    AuthService.getUserWithUsername(req.app.get('db'), tokenUsername)
        .then(function (user) {
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized request' });
        }
        return AuthService.comparePasswords(tokenPassword, user.password)
            .then(function (passwordsMatch) {
            if (!passwordsMatch) {
                return res.status(401).json({ error: 'Unauthorized request' });
            }
            req.user = user;
            next();
        });
    })
        .catch(next);
}
;
module.exports = {
    requireAuth: requireAuth
};
