// user router
const { json, Router } = require('express');
const jsonBodyParser = json();
const userRouter = Router();
const path = require('path');
const { format } = require('date-fns');

// service
const UserService = require('./user-service');

// for posting new users (i.e. sign up)
userRouter
  .post('/', jsonBodyParser, (req, res, next) => {

    const { password, user_name } = req.body;
    const userLogin = { password, user_name };

    for (const [key,value] of Object.entries(userLogin))
            if (value === undefined || value === null) 
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });

    const passwordError = UserService.validatePassword(password);

    if (passwordError)
      return res
        .status(400)
        .json({ 
          error: passwordError 
        });

    UserService.hasUserWithUserName(
        req.app.get('db'),
        user_name
      )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` });

        return UserService.hashPassword(password)
          .then(hashedPassword => {
            const formattedDate = format( new Date(), 'M/dd/yyyy, K:mm:s b' );
            console.log(`formatted date:`, formattedDate);
            const newUser = {
              user_name,
              password: hashedPassword,
              date_created: formattedDate
              
            };
            console.log(`newUser`, newUser);

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

module.exports = userRouter;