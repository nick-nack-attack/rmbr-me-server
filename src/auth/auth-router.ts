// authentication router
import * as express from 'express';
import requireAuth from '../middleware/jwt-auth';
const jsonBodyParser = express.json();
const authRouter = express.Router();

// service
import AuthService from './auth-service';

authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {
    const {user_name, password} = req.body;
    const loginUser = {user_name, password};

    // verify user_name and email are in the request body
    for (const [key, value] of Object.entries(loginUser))
      // if one is missing, return error and key missing
      if (value == null)
        return res
          .status(400)
          .json({
            error: `Missing '${key}' in request body`
          })

    AuthService.getUserWithUsername(
      loginUser.user_name
    )
      .then(dbUser => {
        // if the user doesn't exist, return error
        if (!dbUser)
          return res
            .status(400)
            .json({
              error: 'Incorrect username or password'
            })

        AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            // if request body password and db password don't match, return error
            if (!compareMatch)
              return res
                .status(400)
                .json({
                  error: 'Incorrect username or password',
                })

            // try creating jwt and returning it to user
            try {
              const sub = dbUser.user_name;
              const payload = {user_id: dbUser.id};

              return res.json({
                authToken: AuthService.createJwt(sub, payload),
                user_id: dbUser.id
              });
            } catch (err) {
              return res
                .status(500)
                .json({
                  error: "Couldn't create token"
                })
            }
          })
      })
      // handle an error not already handled
      .catch((err) => {
        console.log(err)
        next();
      })
  });

// refresh client token
authRouter
  .post('/refresh', requireAuth, (req, res) => {
    const sub = req['user'].user_name;
    const payload = {user_id: req['user'].id};
    const user_id = payload.user_id;
    res.send({
      authToken: AuthService.createJwt(sub, payload),
      user_id
    })
  });

export default authRouter;
