import User from '~/models/schemas/User.schema'
import databaseService from './database.services'

class UserService {
  async register(payload: { email: string; password: string }) {
    const result = await databaseService.users.insertOne(new User(payload))
    return result
  }
  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email })
    console.log('🚀 ~ file: users.services.ts:11 ~ UserService ~ checkEmailExist ~ result:', result)
    return Boolean(result)
  }
}

const userService = new UserService()
export default userService
