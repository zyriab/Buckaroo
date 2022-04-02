import { RequestBody, ResponseBody } from '../definitions/root';
import { AccessToken } from '../definitions/auth';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import 'dotenv/config';

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getKey(header: any, callback: (a: any, key: any) => any) {
  client.getSigningKey(header.kid, (e, key: any) => {
    const signingKey: jwksClient.SigningKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

export async function checkAuth(
  req: RequestBody,
  res: ResponseBody<any>,
  next: () => void
) {
  try {
    let decodedToken: AccessToken;
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      req.body.isAuth = false;
      return next();
    }

    const token: string = authHeader.split(' ')[1];
    if (!token || token === '') {
      req.body.isAuth = false;
      return next();
    }

    try {
      decodedToken = await new Promise((resolve, reject) => {
        jwt.verify(
          token,
          getKey,
          {
            audience: process.env.AUTH0_AUDIENCE,
            issuer: `https://${process.env.AUTH0_DOMAIN}/`,
            algorithms: ['RS256'],
          },
          (error: any, decoded: any) => {
            if (error) {
              resolve({ error });
            }
            if (decoded) {
              resolve({ decoded });
            }
          }
        );
      });
    } catch (err) {
      req.body.isAuth = false;
      return next();
    }

    if (!decodedToken) {
      req.body.isAuth = false;
      return next();
    }

    if (decodedToken.error) {
      req.body.isAuth = false;
      res.status(401);
      return next();
    }

    req.body.isAuth = true;
    req.body.token = decodedToken.decoded!;

    next();
  } catch (err) {
    req.body.isAuth = false;
    res.status(500);
    return next();
  }
}
