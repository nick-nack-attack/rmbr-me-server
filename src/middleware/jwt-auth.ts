// jwt authentication
import AuthService from '../auth/auth-service';

/**
 * Gets the token from the request and turns it into a user object, saving it to the `req.user` property
 * @param {Request} req the Express request
 * @param {Response} res
 * @param {NextFunction} next
 */
function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';
  let bearerToken;

  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res
      .status(401)
      .json({error: 'Missing bearer token'})
  } else {
    // slice off 'bearer ' from the token
    bearerToken = authToken.slice(7, authToken.length)
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken);

    AuthService.getUserWithUsername(payload.sub)
      .then(user => {
        if (!user)
          return res
            .status(401)
            .json({
              error: 'Unauthorized request'
            })
        req.user = user;
        next();
      })
      .catch(err => {
        next(err)
      })
  } catch (error) {
    res
      .status(401)
      .json({
        error: 'Unauthorized request'
      })
  }
}

export default requireAuth;
