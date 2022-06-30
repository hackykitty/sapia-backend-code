import faker from 'faker'

import User from '@src/api/models/user'
import UserService from '@src/api/services/user'

type DummyUser = { password: string, username: string, userId: string }
type AuthorizedDummyUser = { password: string, username: string, userId: string, token: string }

export function dummy() {
  return {
    password: faker.internet.password(),
    username: faker.internet.userName()
  }
}

export async function createDummy(): Promise<DummyUser> {
  const user = dummy()
  const dbUser = new User(user)
  await dbUser.save()
  return { ...user, userId: dbUser._id.toString() }
}

export async function createDummyAndAuthorize(): Promise<AuthorizedDummyUser> {
  const user = await createDummy()
  const authToken = await UserService.createAuthToken(user.userId)
  return { ...user, token: authToken.token }
}
