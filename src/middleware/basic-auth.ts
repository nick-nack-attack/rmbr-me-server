import AuthService  from '../auth/auth-service';

export default function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';
  let basicToken;

  if (!authToken.toLowerCase().startsWith('basic ')) {
    return res.status(401).json({error: 'Missing basic token'})
  } else {
    basicToken = authToken.slice('basic '.length, authToken.length)
  }

  const [tokenUsername, tokenPassword] = AuthService.parseBasicToken(basicToken);

  if (!tokenUsername || !tokenPassword) {
    return res.status(401).json({error: 'Unauthorized request'})
  }

  AuthService.getUserWithUsername(tokenUsername)
    .then(user => {
        if (!user) {
          return res.status(401).json({error: 'Unauthorized request'})
        }
        return AuthService.comparePasswords(tokenPassword, user.password)
            .then(passwordsMatch => {
              if (!passwordsMatch) {
                return res.status(401).json({error: 'Unauthorized request'})
              }
              req.user = user
              next()
            })
      })
      .catch(next)
};
