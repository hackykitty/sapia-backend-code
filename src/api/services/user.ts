import fs from 'fs'
import jwt, { SignOptions, VerifyErrors, VerifyOptions } from 'jsonwebtoken'

import User from '@src/api/models/user'
import config from '@src/config'
import logger from '@src/utils/logger'

export type ErrorResponse = { error: { type: string, message: string } }
export type AuthResponse = ErrorResponse | { userId: string }
export type CreateUserResponse = ErrorResponse | { userId: string }
export type LoginUserResponse = ErrorResponse | { token: string, userId: string, expireAt: Date }

const privateKey = fs.readFileSync(config.privateKeyFile)
const privateSecret = {
  key: privateKey,
  passphrase: config.privateKeyPassphrase
}
const signOptions: SignOptions = {
  algorithm: 'RS256',
  expiresIn: '14d'
}

const publicKey = fs.readFileSync(config.publicKeyFile)
const lockTime = config.lockTime

const verifyOptions: VerifyOptions = {
  algorithms: ['RS256']
}

function auth(bearerToken: string): Promise<AuthResponse> {
  return new Promise(function (resolve, reject) {
    const token = bearerToken.replace('Bearer ', '')
    jwt.verify(token, publicKey, verifyOptions, (err: VerifyErrors | null, decoded: object | undefined) => {
      if (err === null && decoded !== undefined) {
        const d = decoded as { userId?: string, exp: number }
        if (d.userId) {
          resolve({ userId: d.userId })
          return
        }
      }
      resolve({ error: { type: 'unauthorized', message: 'Authentication Failed' } })
    })
  })
}

function createAuthToken(userId: string): Promise<{ token: string, expireAt: Date }> {
  return new Promise(function (resolve, reject) {
    jwt.sign({ userId: userId }, privateSecret, signOptions, (err: Error | null, encoded: string | undefined) => {
      if (err === null && encoded !== undefined) {
        const expireAfter = 2 * 604800 /* two weeks */
        const expireAt = new Date()
        expireAt.setSeconds(expireAt.getSeconds() + expireAfter)

        resolve({ token: encoded, expireAt: expireAt })
      } else {
        reject(err)
      }
    })
  })
}

async function login(username: string, password: string): Promise<LoginUserResponse> {
  try {
    const user = await User.findOne({ username })
    if (!user) {
      return { error: { type: 'non_existing_user', message: 'User does not exist' } }
    }

    if (user.attempts === 0) {
      return { error: { type: 'user_locked', message: 'User has been locked' } }
    }

    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch) {
      if (user.attempts === 3)
        user.attempted = new Date()

      const now = new Date()
      const diffTime = Math.abs(now.getTime() - user.attempted.getTime())

      if ((diffTime > lockTime && user.attempts !== 0)) {
        user.attempted = new Date()
        user.attempts = 3
      }

      user.attempts--
      await user.save()

      return { error: { type: 'invalid_password', message: 'Invalid Password' } }
    }

    user.attempts = 3
    await user.save()

    const authToken = await createAuthToken(user._id.toString())
    return { userId: user._id.toString(), token: authToken.token, expireAt: authToken.expireAt }
  } catch (err) {
    logger.error(`login: ${err}`)
    return Promise.reject({ error: { type: 'internal_server_error', message: 'Internal Server Error' } })
  }
}

function createUser(username: string, password: string): Promise<CreateUserResponse> {
  return new Promise(function (resolve, reject) {
    const user = new User({ password, username })
    user.save()
      .then(u => {
        resolve({ userId: u._id.toString() })
      })
      .catch(err => {
        if (err.code === 11000) {
          resolve({ error: { type: 'account_already_exists', message: `${username} already exists` } })
        } else {
          logger.error(`createUser: ${err}`)
          reject(err)
        }
      })
  })
}

export default { auth: auth, createAuthToken: createAuthToken, login: login, createUser: createUser }
