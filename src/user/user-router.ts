// user router
import {json, Router} from 'express';
import * as path from 'path';
import {format} from 'date-fns';

// service
import UserService from './user-service';

const userRouter = Router();
const jsonBodyParser = json();

// for posting new users (i.e. sign up)
userRouter
  .route('/')
  .get((req, res, next) => {

  })
  .post(jsonBodyParser, (req, res, next) => {
    // set variables
    const userLogin = {
      user_name: req.body.user_name,
      password: req.body.password
    };
    // check for missing values
    for (const [key, value] of Object.entries(userLogin))
      if (value === undefined || value === null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    // check to see if password passes validation
    const passwordError = UserService.validatePassword(userLogin.password);
    if (passwordError)
      return res
        .status(400)
        .json({
          error: passwordError
        });
    // submit login with service
    UserService.hasUserWithUserName(
      req.app.get('db'),
      userLogin.user_name
    )
      .then((hasUserWithUserName) => {
        // if username is already taken, return error
        if (hasUserWithUserName) {
          res.status(400).json({
            error: `Username already taken`
          });
          return;
        }
        return UserService.hashPassword(userLogin.password)
          .then(hashedPassword => {
            const formattedDate = format(new Date(), 'M/dd/yyyy, K:mm:s b');
            // create new user object
            const newUser = {
              user_name: userLogin.user_name,
              password: hashedPassword,
              date_created: formattedDate
            };
            // insert new user into db
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
      .catch(next);
  })

export default userRouter;
