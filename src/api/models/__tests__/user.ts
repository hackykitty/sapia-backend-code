import faker from 'faker'

import User from '@src/api/models/user'
import db from '@src/utils/db'

beforeAll(async () => {
  await db.open()
})

afterAll(async () => {
  await db.close()
})

describe('save', () => {
  it('should create user', async () => {
    const password = faker.internet.password()
    const username = faker.internet.userName()
    const before = Date.now()

    const user = new User({ password: password, username: username })
    await user.save()

    const after = Date.now()

    const fetched = await User.findById(user._id)

    expect(fetched).not.toBeNull()

    expect(fetched!.username).toBe(username)
    expect(fetched!.password).not.toBe(password)

    expect(before).toBeLessThanOrEqual(fetched!.created.getTime())
    expect(fetched!.created.getTime()).toBeLessThanOrEqual(after)
  })

  it('should update user', async () => {
    const name1 = faker.internet.userName()
    const user = new User({ password: faker.internet.password(), username: name1 })
    const dbUser1 = await user.save()

    const name2 = faker.internet.userName()
    dbUser1.username = name2
    const dbUser2 = await dbUser1.save()
    expect(dbUser2.username).toEqual(name2)
  })

  it('should not save user without a password', async () => {
    const user2 = new User({ email: faker.internet.email(), username: faker.internet.userName() })
    await expect(user2.save()).rejects.toThrowError(/password/)
  })

  it('should not save user without a username', async () => {
    const user1 = new User({ email: faker.internet.email(), password: faker.internet.password() })
    await expect(user1.save()).rejects.toThrowError(/username/)
  })

  it('should not save user with the same username', async () => {
    const password = faker.internet.password()
    const username = faker.internet.userName()
    const userData = { password: password, username: username }

    const user1 = new User(userData)
    await user1.save()

    const user2 = new User(userData)
    await expect(user2.save()).rejects.toThrowError(/E11000/)
  })

  it('should not save password in a readable form', async () => {
    const password = faker.internet.password()

    const user1 = new User({ password: password, username: faker.internet.userName() })
    await user1.save()
    expect(user1.password).not.toBe(password)

    const user2 = new User({ password: password, username: faker.internet.userName() })
    await user2.save()
    expect(user2.password).not.toBe(password)

    expect(user1.password).not.toBe(user2.password)
  })
})

describe('comparePassword', () => {
  it('should return true for valid password', async () => {
    const password = faker.internet.password()
    const user = new User({ password: password, username: faker.internet.userName() })
    await user.save()
    expect(await user.comparePassword(password)).toBe(true)
  })

  it('should return false for invalid password', async () => {
    const user = new User({ password: faker.internet.password(), username: faker.internet.userName() })
    await user.save()
    expect(await user.comparePassword(faker.internet.password())).toBe(false)
  })

  it('should update password hash if password is updated', async () => {
    const password1 = faker.internet.password()
    const user = new User({ password: password1, username: faker.internet.userName() })
    const dbUser1 = await user.save()
    expect(await dbUser1.comparePassword(password1)).toBe(true)

    const password2 = faker.internet.password()
    dbUser1.password = password2
    const dbUser2 = await dbUser1.save()
    expect(await dbUser2.comparePassword(password2)).toBe(true)
    expect(await dbUser2.comparePassword(password1)).toBe(false)
  })
})

describe('toJSON', () => {
  it('should return valid JSON', async () => {
    const password = faker.internet.password()
    const username = faker.internet.userName()

    const user = new User({ password: password, username: username })
    await user.save()
    expect(user.toJSON()).toEqual({ username: username, created: expect.any(Number) })
  })
})
