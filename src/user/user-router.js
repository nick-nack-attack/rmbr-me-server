const express = require('express')
const path = require('path')
const UserService = require('./user-service')

const userRouter = express.Router()
const jsonBodyParser = express.json()

userRouter
  .post('/', jsonBodyParser, (req, res, next) => {

    const { password, user_name } = req.body

    for (const field of ['user_name', 'password'])
      if (!req.body[field])
        return res.status(400).json({ error: `Missing '${field}' in request body` })

    // TODO: check user_name doesn't start with spaces

    const passwordError = UserService.validatePassword(password)

    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UserService.hasUserWithUserName(
        req.app.get('db'),
        user_name
      )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` })

        return UserService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              date_created: 'now()',
            }
            return UserService.insertUser(
                req.app.get('db'),
                newUser
              )
              .then(user => {
                res.status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UserService.serializeUser(user))
              })
          })
      })
      .catch(next)
  })

module.exports = userRouter

// const sub = dbUser.user_name
// const payload = { user_id: dbUser.id }
// const user_id = dbUser.id
// res.send({
//     authToken: AuthService.createJwt(sub, payload),
//     user_id
// })