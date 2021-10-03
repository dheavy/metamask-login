import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config'
import { User } from '../../models/user.model';

export const create = (req: Request, res: Response, next: NextFunction) => {
  const { signature, address } = req.body;
  if (!signature || !address) {
    return res
      .status(400)
      .send({ error: 'Missing signature and/or address' });
  }

  return User
    // 1 - find User based on address
    .findOne({ where: { address } })
    .then((user: User | null) => {
      if (!user) {
        res
          .status(401)
          .send({ error: `User with address ${address} not found` });

        return null;
      }

      return user;
    })
    // 2 - verify signature
    .then((user: User | null) => {
      if (!(user instanceof User)) {
        // Should never happen.
        throw new Error('User is not defined during digital signature verification');
      }

      const msg = `Signing with one-time nonce ${user.nonce}`;
      const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
      const addressFromSig = recoverPersonalSignature({
        data: msgBufferHex,
        sig: signature
      });

      if (addressFromSig.toLowerCase() === address.toLowerCase()) {
        return user;
      } else {
        res
          .status(401)
          .send({ error: 'Signature verification failed' });

        return null;
      }
    })
    // 3 - update nonce
    .then((user: User | null) => {
      if (!(user instanceof User)) {
        // Should never happen.
        throw new Error('User is not defined during nonce generation');
      }

      user.nonce = Math.floor(Math.random() * 10000);
      return user.save();
    })
    // 4 - create JWT
    .then((user: User) => {
      return new Promise<string>((resolve, reject) => {
        jwt.sign({
          payload: {
            id: user.id,
            address
          }
        }, config.secret, {
          algorithm: config.algorithms[0]
        }, (err, token) => {
          if (err) {
            return reject(err);
          }
          if (!token) {
            return reject(new Error('Empty token'));
          }
          return resolve(token);
        })
      });
    })
    .then((token: string) => res.json({ token }))
    .catch(next)
};
