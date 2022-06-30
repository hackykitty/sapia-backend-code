import faker from 'faker'

import request from 'supertest'
import { Express } from 'express-serve-static-core'

import db from '@src/utils/db'
import { createServer } from '@src/utils/server'
import { createDummy } from '@src/tests/user'

let server: Express
beforeAll(async () => {
  await db.open()
  server = await createServer()
})

afterAll(async () => {
  await db.close()
})

describe('POST /api/v1/login', () => {
  it('should return 200 & valid response for a valid login request', async done => {
    const dummy = await createDummy()
    request(server)
      .post(`/api/v1/login`)
      .send({
        username: dummy.username,
        password: dummy.password
      })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.header['x-expires-after']).toMatch(/^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/)
        expect(res.body).toEqual({
          userId: expect.stringMatching(/^[a-f0-9]{24}$/),
          token: expect.stringMatching(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        })
        done()
      })
  })

  it('should return 404 & valid response for a non-existing user', async done => {
    request(server)
      .post(`/api/v1/login`)
      .send({
        username: faker.internet.userName(),
        password: faker.internet.password()
      })
      .expect(404)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body).toEqual({
          error: { type: 'invalid_credentials', message: 'Invalid Login/Password' }
        })
        done()
      })
  })

  it('should return 400 & valid response for invalid request', async done => {
    request(server)
      .post(`/api/v1/login`)
      .send({
        username: faker.internet.ip(),
        password: faker.internet.password()
      })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body).toMatchObject({
          error: { type: 'request_validation', message: expect.stringMatching(/email/) }
        })
        done()
      })
  })
})

describe('POST /api/v1/user', () => {
  it('should return 201 & valid response for valid user', async done => {
    request(server)
      .post(`/api/v1/user`)
      .send({
        password: faker.internet.password(),
        username: faker.internet.userName()
      })
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body).toMatchObject({
          userId: expect.stringMatching(/^[a-f0-9]{24}$/)
        })
        done()
      })
  })

  it('should return 409 & valid response for duplicated user', async done => {
    const data = {
      password: faker.internet.password(),
      username: faker.internet.userName()
    }
    request(server)
      .post(`/api/v1/user`)
      .send(data)
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err)

        request(server)
          .post(`/api/v1/user`)
          .send(data)
          .expect(409)
          .end(function (err, res) {
            if (err) return done(err)
            expect(res.body).toMatchObject({
              error: {
                type: 'account_already_exists',
                message: expect.stringMatching(/already exists/)
              }
            })
            done()
          })
      })
  })

  it('should return 400 & valid response for invalid request', async done => {
    request(server)
      .post(`/api/v1/user`)
      .send({
        password: faker.internet.password(),
        username: faker.internet.userName()
      })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body).toMatchObject({
          error: { type: 'request_validation', message: expect.stringMatching(/email/) }
        })
        done()
      })
  })
})
