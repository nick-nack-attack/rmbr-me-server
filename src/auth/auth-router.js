const express = require('express');
const AuthService = require('./auth-service');
const { requireAuth } = require('../middleware/jwt-auth');

const authRouter = express.Router();
const jsonBodyParser = express.json()

authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
    const { user_name, password } = req.body
    const loginUser = { user_name, password }
    for (const [key, value] of Object.entries(loginUser))
        if (value == null)
            return res.status(400).json({
                error: `Missing '${key}' in request body`
            })
    AuthService.getUserWithUsername(
        req.app.get('db'),
        loginUser.user_name
        )
        .then(dbUser => {
            if (!dbUser)
                return res.status(400).json({
                    error: 'Incorrect username or password'
                })
                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch)
                            return res.status(400).json({
                                error: 'Incorrect username or password',
                            })
                        try {
                            const sub = dbUser.user_name
                            const payload = { user_id: dbUser.id }
                            const user_id = dbUser.id
                            res.send({
                                authToken: AuthService.createJwt(sub, payload),
                                user_id
                            })
                        }
                        catch(err) {
                            console.log(err)
                        }
                    })
        })
        .catch(next)
})


authRouter
    .post('/refresh', requireAuth, (req, res) => {
    const sub = req.user.user_name
    const payload = { user_id: req.user.id }
    const user_id = payload.user_id
    res.send({
        authToken: AuthService.createJwt(sub, payload),
        user_id
    })
})

module.exports = authRouter