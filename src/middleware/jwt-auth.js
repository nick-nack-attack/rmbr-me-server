const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next) {

    const authToken = req.get('Authorization') || ''

    let bearerToken;

    if (!authToken.toLowerCase().startsWith('bearer ')) {
            return res
                .status(401)
                .json({ error: 'Missing bearer token!!!' })
        }
    else { bearerToken = authToken.slice(7, authToken.length)  }
    console.log('bearer:', bearerToken)
    try {
        console.log('trying!!!')
        const payload = AuthService.verifyJwt(bearerToken)
        console.log('payload:', payload)
        AuthService.getUserWithUsername(
                req.app.get('db'),
                payload.sub
            )
            .then(user => {
                if(!user)
                    return res.status(401)
                        .json({ error: 'Unauthorized request 1' })
                    req.user = user
                    next()          
            })
            .catch(err => {
                console.log(err)
                next(err)
            })
        }
    catch (error) {
        res
        .status(401)
        .json({ error: 'Unauthorized request 2 from jwt' })
    }
}

module.exports = {
    requireAuth
}