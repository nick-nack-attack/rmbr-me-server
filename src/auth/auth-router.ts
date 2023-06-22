// authentication router
import * as express from 'express';
import requireAuth from '../middleware/jwt-auth';
const jsonBodyParser = express.json();
const authRouter = express.Router();

// service
import AuthService from './auth-service';
import axios, { AxiosResponse } from "axios";
import UserService, { IUserWithGoogle } from "../user/user-service";

const CLIENT_ID = '899756612598-a3s6ko7i4dihnce2i924ifkk8sgm8k4g.apps.googleusercontent.com';
const CLIENT_SECRET = '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';

interface IGoogleTokensResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
    id_token: string;
}

interface IGoogleUserInfoResponse {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
    locale: string;
}

authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {
    const { user_name, password } = req.body;
    const loginUser = { user_name, password };

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
              const payload = { user_id: dbUser.id };

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

authRouter
    .post('/google', jsonBodyParser, async (req, res, next) => {
        const response = await axios.post("https://oauth2.googleapis.com/token", {
            code: req.body.code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: 'postmessage',
            grant_type: 'authorization_code'
        });

        const tokens: IGoogleTokensResponse = response.data;
        const token = tokens.access_token;

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const config: any = {
            headers: headers,
        };

        const userInfoResponse: AxiosResponse = await axios.get<any>('https://www.googleapis.com/oauth2/v3/userinfo', config);

        const userInfo: IGoogleUserInfoResponse = userInfoResponse.data;
        const email = userInfo.email;

        const existingUser = await AuthService.getUserWithUsername(email);

        let userName: string;
        let userId: number;

        if (existingUser) {
            userName = existingUser.user_name;
            userId = existingUser.id;
        } else {
            const googleUser: IUserWithGoogle = {
                user_name: userInfo.email,
                google_sub: userInfo.sub,
            }

            const createdUser = await UserService.insertUser(googleUser);

            userName = createdUser.user_name;
            userId = createdUser.id;
        }

        try {
            const sub = userName;
            const payload = { user_id: userId };

            return res.json({
                authToken: AuthService.createJwt(sub, payload),
                user_id: userId,
            });
        } catch (err) {
            return res
                .status(500)
                .json({
                    error: "Couldn't create token"
                })
        }
    })

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
